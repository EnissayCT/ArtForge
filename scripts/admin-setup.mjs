#!/usr/bin/env node
/**
 * Generates admin credentials for the store:
 *   - a strong random password, hashed with scrypt (same parameters as src/lib/auth.ts)
 *   - a TOTP secret for an authenticator app (Google Authenticator, Authy, 1Password…)
 *
 * Usage:  node scripts/admin-setup.mjs <output-dir> [site-url] [label]
 *
 * Writes (nothing secret is printed to the terminal):
 *   <output-dir>/admin.env         ADMIN_PASSWORD_HASH=… and ADMIN_TOTP_SECRET=… for the server env file
 *   <output-dir>/ADMIN-ACCESS.txt  the password, the 2FA secret and the otpauth:// link, for you
 *   <output-dir>/2fa-qr.png        QR code to scan with the authenticator app (if the `qrcode` package is available)
 */
import { randomBytes, scrypt } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const [outDir, siteUrl = "", label = "Admin"] = process.argv.slice(2);
if (!outDir) {
  console.error("usage: node scripts/admin-setup.mjs <output-dir> [site-url] [label]");
  process.exit(1);
}

// 4 groups of 5 from an unambiguous alphabet ≈ 113 bits of entropy
const alphabet = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const pick = (n) => Array.from(randomBytes(n), (b) => alphabet[b % alphabet.length]).join("");
const password = [pick(5), pick(5), pick(5), pick(5)].join("-");

const salt = randomBytes(16);
const N = 32768;
const key = await new Promise((resolve, reject) =>
  scrypt(password.normalize("NFKC"), salt, 64, { N, r: 8, p: 1, maxmem: 128 * 1024 * 1024 }, (e, k) => (e ? reject(e) : resolve(k))),
);
const hash = `scrypt:${N}:8:1:${salt.toString("base64")}:${key.toString("base64")}`;

const b32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const raw = randomBytes(20);
let bits = "";
for (const byte of raw) bits += byte.toString(2).padStart(8, "0");
let secret = "";
for (let i = 0; i + 5 <= bits.length; i += 5) secret += b32[parseInt(bits.slice(i, i + 5), 2)];

const issuer = label.replace(/[^A-Za-z0-9 ._-]/g, "") || "Admin";
const otpauth = `otpauth://totp/${encodeURIComponent(issuer)}:admin?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

mkdirSync(outDir, { recursive: true });
writeFileSync(path.join(outDir, "admin.env"), `ADMIN_PASSWORD_HASH=${hash}\nADMIN_TOTP_SECRET=${secret}\n`, { mode: 0o600 });
writeFileSync(
  path.join(outDir, "ADMIN-ACCESS.txt"),
  [
    `${issuer} — accès administrateur`,
    "",
    `Adresse        : ${siteUrl ? `${siteUrl.replace(/\/$/, "")}/admin` : "/admin"}`,
    `Mot de passe   : ${password}`,
    "",
    "Double authentification (obligatoire) :",
    "  1. Installez Google Authenticator (ou Authy, 1Password, Microsoft Authenticator).",
    "  2. Scannez 2fa-qr.png, ou saisissez la clé ci-dessous à la main.",
    `  Clé           : ${secret.match(/.{1,4}/g).join(" ")}`,
    `  Lien          : ${otpauth}`,
    "",
    "À faire maintenant : enregistrez ce mot de passe dans un gestionnaire de mots de passe,",
    "scannez le QR code, puis supprimez ce fichier et l'image. Vous pourrez changer le mot",
    "de passe dans Admin › Sécurité.",
    "",
  ].join("\n"),
  { mode: 0o600 },
);

let qr = false;
try {
  const require = createRequire(process.env.QR_MODULE_DIR ? path.join(process.env.QR_MODULE_DIR, "x.js") : import.meta.url);
  const QRCode = require("qrcode");
  await QRCode.toFile(path.join(outDir, "2fa-qr.png"), otpauth, { width: 420, margin: 2 });
  qr = true;
} catch {
  /* optional */
}
console.log(`Credentials written to ${outDir}${qr ? " (with QR code)" : " (no QR: install `qrcode` to get one)"}`);
