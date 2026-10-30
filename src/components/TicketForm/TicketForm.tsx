import { calculateTotals, formatCurrency, formatTicketNumber, type TicketLine } from '../../types/ticket';
import { TicketLineRow } from './TicketLine';
import './TicketForm.css';

interface TicketFormProps {
  lines: TicketLine[];
  ivaRate: number;
  ticketNumber: number;
  printed: boolean;
  saving: boolean;
  onIVAChange: (rate: number) => void;
  onAddLine: () => void;
  onLineUpdate: (id: string, field: keyof TicketLine, value: string | number) => void;
  onLineRemove: (id: string) => void;
  onPrint: () => void;
  onNewTicket: () => void;
}

export function TicketForm({
  lines,
  ivaRate,
  ticketNumber,
  printed,
  saving,
  onIVAChange,
  onAddLine,
  onLineUpdate,
  onLineRemove,
  onPrint,
  onNewTicket,
}: TicketFormProps) {
  const totals = calculateTotals(lines, ivaRate);

  return (
    <div className="ticket-form-container">
      <div className="form-header">
        <h1>Nuevo Ticket</h1>
        <div className="ticket-number-badge">
          Ticket <span>Nº</span> <strong>{formatTicketNumber(ticketNumber)}</strong>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">Líneas del Ticket</h3>
        <div className="lines-header">
          <div className="line-index-header">#</div>
          <div className="line-concept-header">Concepto</div>
          <div className="line-price-header">P. Unit. (€)</div>
          <div className="line-units-header">Unidades</div>
          <div className="line-total-header">Subtotal</div>
          <div></div>
        </div>

        <div className="lines-list">
          {lines.map((line, index) => (
            <TicketLineRow
              key={line.id}
              line={line}
              index={index}
              onUpdate={onLineUpdate}
              onRemove={onLineRemove}
              isFirst={lines.length === 1}
            />
          ))}
        </div>

        <button className="add-line-btn" onClick={onAddLine}>
          <span className="btn-icon">+</span> Agregar Línea
        </button>
      </div>

      <div className="form-section summary-section">
        <h3 className="section-title">IVA</h3>
        <div className="iva-selector">
          <label className={`iva-option ${ivaRate === 21 ? 'selected' : ''}`}>
            <input
              type="radio"
              name="iva"
              value="21"
              checked={ivaRate === 21}
              onChange={() => onIVAChange(21)}
            />
            <span className="options-text">21% Normal</span>
          </label>
        </div>
      </div>

      <div className="form-section totals-section">
        <div className="totals-grid">
          <div className="total-row">
            <span className="total-label">Subtotal</span>
            <span className="total-value">{formatCurrency(totals.subtotal)}</span>
          </div>
          <div className="total-row">
            <span className="total-label">IVA ({ivaRate}%)</span>
            <span className="total-value">{formatCurrency(totals.ivaAmount)}</span>
          </div>
          <div className="total-row grand-total">
            <span className="total-label">TOTAL</span>
            <span className="total-value">{formatCurrency(totals.total)}</span>
          </div>
        </div>
        <button className="print-btn" onClick={onPrint} disabled={saving}>
          {saving ? 'Guardando…' : printed ? '🖨️ Reimprimir Ticket' : '🖨️ Imprimir Ticket'}
        </button>
        <button className="new-ticket-btn" onClick={onNewTicket} disabled={saving}>
          <span className="btn-icon">+</span> Nuevo Ticket
        </button>
      </div>
    </div>
  );
}
