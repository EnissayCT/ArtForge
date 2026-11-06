import "server-only";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from "crypto";
import { readJson, writeJson } from "./store";

/*
 * Admin authentication.
 *  - password: scrypt hash (env ADMIN_PASSWORD_HASH, or data/auth.json after a change in /admin/securite)
 *  - second factor: TOTP code from an authenticator app (env ADMIN_TOTP_SECRET, base32), replay-protected
 *  - sessions: random 256-bit token in an HttpOnly, Secure, SameSite=Strict cookie; only its SHA-256
 *    is stored server-side, so sessions can be listed and revoked. 2 h idle / 12 h absolute lifetime.
 *  - brute force: 5 failures per IP per 15 min, 30 failures overall per 15 min, then lockout.
 * In production the admin stays closed until both the password hash and the TOTP secret are configured.
 */

const PROD = process.env.NODE_ENV === "production";
export const SESSION_COOKIE = PROD ? "__Host-af_admin" : "af_admin";
const IDLE_MS = 2 * 60 * 60 * 1000;
const ABSOLUTE_MS = 12 * 60 * 60 * 1000;
const WINDOW_MS = 15 * 60 * 1000;

interface Session {
  id: string;
  createdAt: number;
  lastSeen: number;
  ip: string;
  ua: string;
}
interface LoginEvent {
  at: number;
  ip: string;
  ok: boolean;
  reason?: string;
}
interface AuthState {
  passwordHash?: string;
  passwordChangedAt?: number;
  totpLast?: number;
  sessions: Session[];
  log: LoginEvent[];
}

let state: AuthState | null = null;

async function load(): Promise<AuthState> {
  state ??= await readJson<AuthState>("auth.json", { sessions: [], log: [] });
  return state;
}
function persist() {
  if (state) return writeJson("auth.json", state);
}

/* ------------------------------------------------------------------ crypto */

function scrypt(password: string, salt: Buffer, keylen: number, opts: ScryptOptions) {
  return new Promise<Buffer>((resolve, reject) =>
    scryptCb(password, salt, keylen, opts, (err, key) => (err ? reject(err) : resolve(key))),
  );
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const N = 32768;
  const key = await scrypt(password.normalize("NFKC"), salt, 64, { N, r: 8, p: 1, maxmem: 128 * 1024 * 1024 });
  // ":"-separated so the value survives shells and env files untouched
  return `scrypt:${N}:8:1:${salt.toString("base64")}:${key.toString("base64")}`;
}

async function verifyHash(password: string, stored: string) {
  const [alg, n, r, p, saltB64, keyB64] = stored.split(/[:$]/);
  if (alg !== "scrypt" || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, "base64");
  const key = await scrypt(password.normalize("NFKC"), Buffer.from(saltB64, "base64"), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: 128 * 1024 * 1024,
  });
  return key.length === expected.length && timingSafeEqual(key, expected);
}

function base32Decode(input: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = input.toUpperCase().replace(/[\s=-]/g, "");
  const out: number[] = [];
  let bits = 0;
  let value = 0;
  for (const ch of clean) {
    const i = alphabet.indexOf(ch);
    if (i < 0) throw new Error("bad base32");
    value = (value << 5) | i;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
      value &= (1 << bits) - 1;
    }
  }
  return Buffer.from(out);
}

function hotp(key: Buffer, counter: number) {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const h = createHmac("sha1", key).update(msg).digest();
  const off = h[h.length - 1] & 0x0f;
  const bin = ((h[off] & 0x7f) << 24) | (h[off + 1] << 16) | (h[off + 2] << 8) | h[off + 3];
  return String(bin % 1_000_000).padStart(6, "0");
}

/** Returns the matched time-step counter, or null. Accepts ±1 step (30 s) of clock drift. */
function verifyTotp(secret: string, code: string, now = Date.now()) {
  if (!/^\d{6}$/.test(code)) return null;
  const key = base32Decode(secret);
  const step = Math.floor(now / 30000);
  for (const c of [step, step - 1, step + 1]) {
    const expected = Buffer.from(hotp(key, c));
    if (timingSafeEqual(expected, Buffer.from(code))) return c;
  }
  return null;
}

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/* ------------------------------------------------------------------ config */

async function passwordHash() {
  return (await load()).passwordHash || process.env.ADMIN_PASSWORD_HASH || "";
}
const totpSecret = () => process.env.ADMIN_TOTP_SECRET || "";

export async function adminConfigured() {
  const hasPw = !!(await passwordHash());
  return PROD ? hasPw && !!totpSecret() : hasPw;
}

/* ------------------------------------------------------------------ request */

export async function clientInfo() {
  const h = await headers();
  const ip = h.get("x-real-ip") || h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return { ip: ip.slice(0, 64), ua: (h.get("user-agent") || "").slice(0, 200) };
}

/* ------------------------------------------------------------------ rate limit */

const failures = new Map<string, number[]>();
let globalFailures: number[] = [];

function recent(list: number[], now: number) {
  return list.filter((t) => now - t < WINDOW_MS);
}
function locked(ip: string, now: number) {
  const mine = recent(failures.get(ip) ?? [], now);
  globalFailures = recent(globalFailures, now);
  return mine.length >= 5 || globalFailures.length >= 30;
}
function fail(ip: string, now: number) {
  failures.set(ip, [...recent(failures.get(ip) ?? [], now), now]);
  globalFailures.push(now);
  if (failures.size > 5000) failures.clear();
}

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ login */

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function login(password: string, code: string): Promise<LoginResult> {
  const { ip, ua } = await clientInfo();
  const now = Date.now();
  const s = await load();
  const logEvent = (ok: boolean, reason?: string) => {
    s.log = [{ at: now, ip, ok, reason }, ...s.log].slice(0, 200);
  };

  if (!(await adminConfigured())) {
    return { ok: false, error: "L'administration n'est pas encore configurée sur ce serveur." };
  }
  if (locked(ip, now)) {
    logEvent(false, "verrouillé");
    await persist();
    return { ok: false, error: "Trop de tentatives. Réessayez dans 15 minutes." };
  }

  const pwOk = password.length > 0 && password.length <= 200 && (await verifyHash(password, await passwordHash()));
  let counter: number | null = null;
  const secret = totpSecret();
  if (secret) {
    counter = verifyTotp(secret, code.replace(/\s/g, ""), now);
    if (counter !== null && s.totpLast !== undefined && counter <= s.totpLast) counter = null; // replay
  }
  const ok = pwOk && (secret ? counter !== null : true);

  if (!ok) {
    fail(ip, now);
    logEvent(false, !pwOk ? "mot de passe" : "code 2FA");
    await persist();
    await pause(600 + Math.random() * 600);
    return { ok: false, error: "Identifiants incorrects." };
  }

  const token = randomBytes(32).toString("base64url");
  s.sessions = [
    { id: sha256(token), createdAt: now, lastSeen: now, ip, ua },
    ...s.sessions.filter((x) => now - x.createdAt < ABSOLUTE_MS && now - x.lastSeen < IDLE_MS),
  ].slice(0, 20);
  if (counter !== null) s.totpLast = counter;
  failures.delete(ip);
  logEvent(true);
  await persist();

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: PROD,
    sameSite: "strict",
    path: "/",
    maxAge: ABSOLUTE_MS / 1000,
  });
  return { ok: true };
}

/* ------------------------------------------------------------------ sessions */

export async function getAdminSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const s = await load();
  const id = sha256(token);
  const now = Date.now();
  const session = s.sessions.find((x) => x.id === id);
  if (!session) return null;
  if (now - session.createdAt > ABSOLUTE_MS || now - session.lastSeen > IDLE_MS) {
    s.sessions = s.sessions.filter((x) => x.id !== id);
    await persist();
    return null;
  }
  if (now - session.lastSeen > 60_000) {
    session.lastSeen = now;
    persist();
  }
  return session;
}

/** For admin pages and server actions: redirects to the login page when signed out. */
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const s = await load();
    const id = sha256(token);
    s.sessions = s.sessions.filter((x) => x.id !== id);
    await persist();
  }
  jar.delete(SESSION_COOKIE);
}

export async function logoutOthers(current: Session) {
  const s = await load();
  s.sessions = s.sessions.filter((x) => x.id === current.id);
  await persist();
}

export async function securityOverview() {
  const s = await load();
  const now = Date.now();
  return {
    sessions: s.sessions
      .filter((x) => now - x.createdAt < ABSOLUTE_MS && now - x.lastSeen < IDLE_MS)
      .map(({ id, createdAt, lastSeen, ip, ua }) => ({ id: id.slice(0, 8), createdAt, lastSeen, ip, ua })),
    log: s.log.slice(0, 50),
    passwordChangedAt: s.passwordChangedAt,
    twoFactor: !!totpSecret(),
  };
}

export async function changePassword(current: Session, oldPassword: string, code: string, next: string) {
  if (next.length < 12) return { ok: false as const, error: "Le nouveau mot de passe doit faire au moins 12 caractères." };
  if (!(await verifyHash(oldPassword, await passwordHash()))) {
    await pause(800);
    return { ok: false as const, error: "Mot de passe actuel incorrect." };
  }
  const secret = totpSecret();
  const s = await load();
  if (secret) {
    const counter = verifyTotp(secret, code.replace(/\s/g, ""));
    if (counter === null || (s.totpLast !== undefined && counter <= s.totpLast)) {
      return { ok: false as const, error: "Code de l'application d'authentification incorrect." };
    }
    s.totpLast = counter;
  }
  s.passwordHash = await hashPassword(next);
  s.passwordChangedAt = Date.now();
  // sign out every other device
  s.sessions = s.sessions.filter((x) => x.id === current.id);
  await persist();
  return { ok: true as const };
}
