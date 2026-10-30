import { createContext, useContext } from 'react';
import type { Ticket, TicketInput } from '../types/ticket';

export type TicketStoreStatus = 'loading' | 'unsupported' | 'no-file' | 'needs-permission' | 'ready';

export interface TicketStore {
  status: TicketStoreStatus;
  fileName: string | null;
  tickets: Ticket[];
  error: string | null;
  openFile: () => Promise<void>;
  createFile: () => Promise<void>;
  reconnect: () => Promise<void>;
  closeFile: () => void;
  saveTicket: (ticket: TicketInput) => Promise<Ticket>;
  deleteTicket: (id: number) => Promise<void>;
}

export const TicketStoreContext = createContext<TicketStore | null>(null);

export function useTicketStore(): TicketStore {
  const store = useContext(TicketStoreContext);
  if (!store) throw new Error('useTicketStore debe usarse dentro de TicketStoreProvider');
  return store;
}
