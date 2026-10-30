import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { TicketForm } from '../components/TicketForm/TicketForm';
import { calculateTotals, createEmptyDraft, createEmptyLine, getNextTicketId } from '../types/ticket';
import type { TicketDraft, TicketLine } from '../types/ticket';
import { useTicketStore } from '../hooks/useTicketStore';
import { printTicket } from '../lib/ticket';
import './HomePage.css';

interface HomePageProps {
  draft: TicketDraft;
  onDraftChange: Dispatch<SetStateAction<TicketDraft>>;
}

function HomePage({ draft, onDraftChange }: HomePageProps) {
  const { tickets, saveTicket } = useTicketStore();
  const [saving, setSaving] = useState(false);
  const { lines, ivaRate } = draft;
  const ticketNumber = draft.id ?? getNextTicketId(tickets);

  const setLines = (update: (prev: TicketLine[]) => TicketLine[]) => {
    onDraftChange((prev) => ({ ...prev, lines: update(prev.lines) }));
  };

  const handleAddLine = () => {
    setLines((prev) => [...prev, createEmptyLine()]);
  };

  const handleLineUpdate = (id: string, field: keyof TicketLine, value: string | number) => {
    setLines((prev) =>
      prev.map((line) => (line.id === id ? { ...line, [field]: value } : line))
    );
  };

  const handleLineRemove = (id: string) => {
    if (lines.length > 1) {
      setLines((prev) => prev.filter((line) => line.id !== id));
    }
  };

  const handleIVAChange = (rate: number) => {
    onDraftChange((prev) => ({ ...prev, ivaRate: rate }));
  };

  const handlePrint = async () => {
    // Filter out empty lines
    const activeLines = lines.filter((l) => l.concept.trim() || l.unitPrice > 0);
    if (activeLines.length === 0) {
      alert('Agrega al menos una línea con concepto o importe.');
      return;
    }

    // Reprinting keeps the number and the original date of the ticket
    const existing = draft.id !== null ? tickets.find((t) => t.id === draft.id) : undefined;
    const now = new Date();

    setSaving(true);
    try {
      const ticket = await saveTicket({
        id: draft.id,
        date: existing?.date ?? now.toLocaleDateString('es-ES'),
        time: existing?.time ?? now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        lines: activeLines,
        ivaRate,
        ...calculateTotals(activeLines, ivaRate),
      });
      onDraftChange((prev) => ({ ...prev, id: ticket.id }));
      printTicket(ticket);
    } catch (err) {
      alert(`No se pudo guardar el ticket: ${err instanceof Error ? err.message : err}`);
    } finally {
      setSaving(false);
    }
  };

  const handleNewTicket = () => {
    const hasContent = lines.some((l) => l.concept.trim() || l.unitPrice > 0);
    if (draft.id === null && hasContent && !confirm('El ticket actual no se ha impreso. ¿Descartarlo y empezar uno nuevo?')) {
      return;
    }
    onDraftChange(createEmptyDraft());
  };

  return (
    <TicketForm
      lines={lines}
      ivaRate={ivaRate}
      ticketNumber={ticketNumber}
      printed={draft.id !== null}
      saving={saving}
      onIVAChange={handleIVAChange}
      onAddLine={handleAddLine}
      onLineUpdate={handleLineUpdate}
      onLineRemove={handleLineRemove}
      onPrint={handlePrint}
      onNewTicket={handleNewTicket}
    />
  );
}

export default HomePage;
