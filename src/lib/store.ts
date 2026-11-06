import "server-only";
import { promises as fs } from "fs";
import path from "path";

/**
 * Tiny JSON-file store. Works on any server with a disk (VPS). All writes go
 * through one queue and are atomic (write to .tmp, then rename), so concurrent
 * requests never clobber each other or leave half-written files.
 */
export const DATA_DIR = process.env.ARTFORGE_DATA_DIR || path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
export const MEDIA_DIR = path.join(DATA_DIR, "media");

let queue: Promise<unknown> = Promise.resolve();

/** Runs `task` after every previously queued write. */
export function serial<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task);
  queue = run.catch(() => {});
  return run;
}

export async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path.join(DATA_DIR, file), "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeNow(file: string, data: unknown) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const target = path.join(DATA_DIR, file);
  await fs.writeFile(`${target}.tmp`, JSON.stringify(data, null, 2), { mode: 0o600 });
  await fs.rename(`${target}.tmp`, target);
}

export function writeJson(file: string, data: unknown) {
  return serial(() => writeNow(file, data));
}

/** Read-modify-write inside the queue. */
export function mutateJson<T>(file: string, fallback: T, fn: (current: T) => T | Promise<T>) {
  return serial(async () => {
    const next = await fn(await readJson(file, fallback));
    await writeNow(file, next);
    return next;
  });
}

export function readAll<T>(file: string) {
  return readJson<T[]>(file, []);
}

/** Prepends a record to a list file. */
export function append<T>(file: string, record: T) {
  return mutateJson<T[]>(file, [], (list) => [record, ...list]);
}

const ID = /^[a-z0-9-]{8,64}$/i;

export async function saveUpload(id: string, data: Buffer) {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, `${id}.jpg`), data, { mode: 0o600 });
}

export async function readUpload(id: string) {
  if (!ID.test(id)) return null;
  try {
    return await fs.readFile(path.join(UPLOAD_DIR, `${id}.jpg`));
  } catch {
    return null;
  }
}

const MEDIA_FILE = /^[a-z0-9][a-z0-9-]{2,90}\.jpg$/;

export async function saveMedia(name: string, data: Buffer) {
  if (!MEDIA_FILE.test(name)) throw new Error("invalid media name");
  await fs.mkdir(path.join(MEDIA_DIR, "art"), { recursive: true });
  await fs.writeFile(path.join(MEDIA_DIR, "art", name), data, { mode: 0o644 });
}

export async function readMedia(name: string) {
  if (!MEDIA_FILE.test(name)) return null;
  try {
    return await fs.readFile(path.join(MEDIA_DIR, "art", name));
  } catch {
    return null;
  }
}

export async function deleteMedia(name: string) {
  if (!MEDIA_FILE.test(name)) return;
  await fs.rm(path.join(MEDIA_DIR, "art", name), { force: true });
}

/** True for JPEG, PNG or WebP file signatures. */
export function imageKind(buf: Buffer): "jpg" | "png" | "webp" | null {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  return null;
}
