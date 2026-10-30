import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { TicketStoreContext } from '../../hooks/useTicketStore';
import type { TicketStore, TicketStoreStatus } from '../../hooks/useTicketStore';
import { getNextTicketId } from '../../types/ticket';
import type { Ticket, TicketInput } from '../../types/ticket';
import {
  hasPermission,
  isFileAccessSupported,
  loadSavedHandle,
  pickExistingFile,
  pickNewFile,
  readTickets,
  saveHandle,
  writeTickets,
} from '../../lib/ticketFile';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isPickerCancelled(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

export function TicketStoreProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<TicketStoreStatus>(() =>
    isFileAccessSupported() ? 'loading' : 'unsupported',
  );
  const [handle, setHandle] = useState<FileSystemFileHandle | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (fileHandle: FileSystemFileHandle) => {
    try {
      const loaded = await readTickets(fileHandle);
      await saveHandle(fileHandle);
      setHandle(fileHandle);
      setTickets(loaded);
      setError(null);
      setStatus('ready');
    } catch (err) {
      setError(errorMessage(err));
      setStatus('no-file');
    }
  }, []);

  useEffect(() => {
    if (!isFileAccessSupported()) return;
    let cancelled = false;
    (async () => {
      const saved = await loadSavedHandle().catch(() => null);
      if (cancelled) return;
      if (!saved) {
        setStatus('no-file');
      } else if (await hasPermission(saved, false)) {
        await connect(saved);
      } else {
        setHandle(saved);
        setStatus('needs-permission');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [connect]);

  const openFile = useCallback(async () => {
    try {
      await connect(await pickExistingFile());
    } catch (err) {
      if (!isPickerCancelled(err)) setError(errorMessage(err));
    }
  }, [connect]);

  const createFile = useCallback(async () => {
    try {
      const fileHandle = await pickNewFile();
      // If an existing tickets file was chosen in the save dialog, keep its tickets.
      const existing = await readTickets(fileHandle).catch(() => []);
      if (existing.length === 0) await writeTickets(fileHandle, []);
      await connect(fileHandle);
    } catch (err) {
      if (!isPickerCancelled(err)) setError(errorMessage(err));
    }
  }, [connect]);

  const reconnect = useCallback(async () => {
    if (!handle) return;
    try {
      if (await hasPermission(handle, true)) {
        await connect(handle);
      } else {
        setError(`No se concedió permiso para usar "${handle.name}".`);
      }
    } catch (err) {
      setError(errorMessage(err));
    }
  }, [handle, connect]);

  const closeFile = useCallback(() => {
    setError(null);
    setStatus('no-file');
  }, []);

  const saveTicket = useCallback(
    async (input: TicketInput): Promise<Ticket> => {
      if (!handle) throw new Error('No hay ningún archivo de tickets abierto.');
      // Re-read the file so changes made outside the app are not overwritten.
      const current = await readTickets(handle);
      const ticket: Ticket = { ...input, id: input.id ?? getNextTicketId(current) };
      const next = [ticket, ...current.filter((t) => t.id !== ticket.id)].sort((a, b) => b.id - a.id);
      await writeTickets(handle, next);
      setTickets(next);
      return ticket;
    },
    [handle],
  );

  const deleteTicket = useCallback(
    async (id: number): Promise<void> => {
      if (!handle) throw new Error('No hay ningún archivo de tickets abierto.');
      const current = await readTickets(handle);
      const next = current.filter((t) => t.id !== id);
      await writeTickets(handle, next);
      setTickets(next);
    },
    [handle],
  );

  const store = useMemo<TicketStore>(
    () => ({
      status,
      fileName: handle?.name ?? null,
      tickets,
      error,
      openFile,
      createFile,
      reconnect,
      closeFile,
      saveTicket,
      deleteTicket,
    }),
    [status, handle, tickets, error, openFile, createFile, reconnect, closeFile, saveTicket, deleteTicket],
  );

  return <TicketStoreContext.Provider value={store}>{children}</TicketStoreContext.Provider>;
}
