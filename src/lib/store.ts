import "server-only";
import { promises as fs } from "fs";
import path from "path";

/**
 * Tiny JSON-file store for the proof of concept. Works locally and on any
 * server with a disk (VPS). On serverless hosts swap this for a database.
 */
export const DATA_DIR = process.env.ARTFORGE_DATA_DIR || path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

let queue: Promise<unknown> = Promise.resolve();

async function readList<T>(file: string): Promise<T[]> {
  try {
    return JSON.parse(await fs.readFile(path.join(DATA_DIR, file), "utf8")) as T[];
  } catch {
    return [];
  }
}

export function readAll<T>(file: string) {
  return readList<T>(file);
}

/** Appends a record; writes are serialised so concurrent requests don't clobber each other. */
export function append<T>(file: string, record: T) {
  const run = queue.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const list = await readList<T>(file);
    list.unshift(record);
    const target = path.join(DATA_DIR, file);
    await fs.writeFile(`${target}.tmp`, JSON.stringify(list, null, 2));
    await fs.rename(`${target}.tmp`, target);
  });
  queue = run.catch(() => {});
  return run;
}

export async function saveUpload(id: string, data: Buffer) {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, `${id}.jpg`), data);
}

export async function readUpload(id: string) {
  if (!/^[a-z0-9-]{8,64}$/i.test(id)) return null;
  try {
    return await fs.readFile(path.join(UPLOAD_DIR, `${id}.jpg`));
  } catch {
    return null;
  }
}
