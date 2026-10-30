import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency, formatTicketNumber, type Ticket } from '../types/ticket';
import { printTicket } from '../lib/ticket';
import { useTicketStore } from '../hooks/useTicketStore';
import './TicketDetailPage.css';

export function TicketDetailPage({ ticket }: { ticket: Ticket }) {
  const { deleteTicket } = useTicketStore();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar el ticket Nº ${formatTicketNumber(ticket.id)}? Esta acción no se puede deshacer.`)) {
      return;
    }
    setDeleting(true);
    try {
      await deleteTicket(ticket.id);
      navigate('/historial');
    } catch (err) {
      alert(`No se pudo eliminar el ticket: ${err instanceof Error ? err.message : err}`);
      setDeleting(false);
    }
  };

  return (
    <div className="detail-container">
      <div className="detail-back">
        <Link to="/historial" className="back-link">
          ← Volver al historial
        </Link>
        <div className="detail-actions">
          <button className="delete-btn" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Eliminando…' : '🗑️ Eliminar'}
          </button>
          <button className="reprint-btn" onClick={() => printTicket(ticket)} disabled={deleting}>
            🖨️ Reimprimir
          </button>
        </div>
      </div>

      <div className="detail-card">
        <div className="detail-header">
          <div>
            <span className="detail-label">FACTURA SIMPLIFICADA</span>
            <h1 className="detail-title">Ticket Nº {formatTicketNumber(ticket.id)}</h1>
          </div>
          <div className="detail-date">
            {ticket.date} · {ticket.time}
          </div>
        </div>

        <div className="detail-divider" />

        <h2 className="detail-section-title">Líneas</h2>
        <div className="detail-lines-header">
          <span className="dl-header">#</span>
          <span className="dl-header dl-concept">Concepto</span>
          <span className="dl-header dl-qty">Cant.</span>
          <span className="dl-header dl-price">P. Unit.</span>
          <span className="dl-header dl-total">Importe</span>
        </div>

        <div className="detail-lines">
          {ticket.lines.map((line, index) => (
            <div key={line.id} className="detail-line-row">
              <span className="dl-number">{index + 1}</span>
              <span className="dl-text">{line.concept || '(Sin concepto)'}</span>
              <span className="dl-qty">{parseFloat(line.units.toFixed(2)).toLocaleString('es-ES')}</span>
              <span className="dl-price">{formatCurrency(line.unitPrice)}</span>
              <span className="dl-total">{formatCurrency(line.unitPrice * line.units)}</span>
            </div>
          ))}
        </div>

        <div className="detail-divider" />

        <div className="detail-totals">
          <div className="detail-total-row">
            <span>Subtotal</span>
            <span>{formatCurrency(ticket.subtotal)}</span>
          </div>
          <div className="detail-total-row">
            <span>IVA ({ticket.ivaRate}%)</span>
            <span>{formatCurrency(ticket.ivaAmount)}</span>
          </div>
          <div className="detail-total-row grand">
            <span><strong>TOTAL</strong></span>
            <span><strong>{formatCurrency(ticket.total)}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
