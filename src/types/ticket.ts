export interface CompanyConfig {
  name: string;
  nif: string;
  address: string;
  phone: string;
}

export interface TicketLine {
  id: string;
  concept: string;
  unitPrice: number;
  units: number;
}

export interface Ticket {
  id: number;
  date: string;
  time: string;
  lines: TicketLine[];
  subtotal: number;
  ivaRate: number;
  ivaAmount: number;
  total: number;
}

export interface TicketFormData {
  lines: TicketLine[];
  ivaRate: number;
}

// Ticket being edited on the home page. `id` stays null until it is first printed,
// so the number shown is only reserved once the ticket is saved.
export interface TicketDraft extends TicketFormData {
  id: number | null;
}

// A ticket to save: a null id means a new ticket that gets the next free number.
export type TicketInput = Omit<Ticket, 'id'> & { id: number | null };

export function createEmptyDraft(): TicketDraft {
  return { id: null, lines: [createEmptyLine()], ivaRate: 21 };
}

export function getNextTicketId(tickets: Ticket[]): number {
  return tickets.reduce((max, ticket) => Math.max(max, ticket.id), 0) + 1;
}

export function getDefaultCompanyConfig(): CompanyConfig {
  return {
    name: 'Reparaciones Plata',
    nif: '8857038Z',
    address: 'Avda. Extremadura, 68 Talavera la Real, Badajoz',
    phone: '604417781',
  };
}

export function createEmptyLine(): TicketLine {
  return {
    id: crypto.randomUUID(),
    concept: '',
    unitPrice: 0,
    units: 1,
  };
}

export function calculateTotals(lines: TicketLine[], ivaRate: number): { subtotal: number; ivaAmount: number; total: number } {
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.units, 0);
  const ivaAmount = subtotal * (ivaRate / 100);
  const total = subtotal + ivaAmount;
  return { subtotal, ivaAmount, total };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
}

export function formatTicketNumber(num: number): string {
  return String(num).padStart(5, '0');
}
