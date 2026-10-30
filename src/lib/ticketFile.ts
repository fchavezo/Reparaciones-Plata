import type { Ticket } from '../types/ticket';

// Only the file handle is kept in the browser (IndexedDB) so the same file can be
// reopened on the next visit; the tickets themselves live in the JSON file.
const DB_NAME = 'dgx-tickets';
const STORE_NAME = 'handles';
const HANDLE_KEY = 'ticket-file';

const PICKER_TYPES: FilePickerAcceptType[] = [
  { description: 'Archivo de tickets', accept: { 'application/json': ['.json'] } },
];

interface TicketFileContent {
  version: 1;
  tickets: Ticket[];
}

export function isFileAccessSupported(): boolean {
  return typeof window.showOpenFilePicker === 'function';
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function runStore<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = action(db.transaction(STORE_NAME, mode).objectStore(STORE_NAME));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export async function loadSavedHandle(): Promise<FileSystemFileHandle | null> {
  const handle = await runStore<FileSystemFileHandle | undefined>('readonly', (store) => store.get(HANDLE_KEY));
  return handle ?? null;
}

export async function saveHandle(handle: FileSystemFileHandle): Promise<void> {
  await runStore('readwrite', (store) => store.put(handle, HANDLE_KEY));
}

export async function pickExistingFile(): Promise<FileSystemFileHandle> {
  const [handle] = await window.showOpenFilePicker({ types: PICKER_TYPES, multiple: false });
  return handle;
}

export async function pickNewFile(): Promise<FileSystemFileHandle> {
  return window.showSaveFilePicker({ suggestedName: 'tickets.json', types: PICKER_TYPES });
}

export async function hasPermission(handle: FileSystemFileHandle, request: boolean): Promise<boolean> {
  const descriptor = { mode: 'readwrite' } as const;
  if ((await handle.queryPermission(descriptor)) === 'granted') return true;
  return request && (await handle.requestPermission(descriptor)) === 'granted';
}

export async function readTickets(handle: FileSystemFileHandle): Promise<Ticket[]> {
  const text = await (await handle.getFile()).text();
  if (!text.trim()) return [];

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`"${handle.name}" no es un archivo de tickets válido.`);
  }
  const tickets = Array.isArray(data) ? data : (data as Partial<TicketFileContent> | null)?.tickets;
  if (!Array.isArray(tickets)) {
    throw new Error(`"${handle.name}" no es un archivo de tickets válido.`);
  }
  return tickets;
}

export async function writeTickets(handle: FileSystemFileHandle, tickets: Ticket[]): Promise<void> {
  const content: TicketFileContent = { version: 1, tickets };
  const writable = await handle.createWritable();
  await writable.write(JSON.stringify(content, null, 2));
  await writable.close();
}
