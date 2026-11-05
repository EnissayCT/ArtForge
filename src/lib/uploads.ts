"use client";

/**
 * Customer designs live in IndexedDB (they are far too big for localStorage).
 * The cart only keeps the id and a small thumbnail.
 */

const DB = "artforge";
const STORE = "designs";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export interface StoredDesign {
  /** print-ready crop */
  print: Blob;
  /** original file as uploaded */
  original?: Blob;
  name: string;
  createdAt: number;
}

export async function saveDesign(id: string, design: StoredDesign) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(design, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadDesign(id: string): Promise<StoredDesign | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE).objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result as StoredDesign | undefined);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteDesign(id: string) {
  const db = await openDb();
  db.transaction(STORE, "readwrite").objectStore(STORE).delete(id);
}

export function newId() {
  return crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = "image/jpeg", quality = 0.92) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), type, quality),
  );
}
