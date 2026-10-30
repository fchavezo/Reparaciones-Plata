import { useState } from 'react';
import { formatTicketNumber, type Ticket } from '../types/ticket';
import { Link } from 'react-router-dom';
import './HistoryPage.css';

interface HistoryPageProps {
  tickets: Ticket[];
}

export function HistoryPage({ tickets }: HistoryPageProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = tickets.filter((t) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      String(t.id).includes(term) ||
      t.date.includes(term) ||
      t.lines.some((l) => l.concept.toLowerCase().includes(term))
    );
  });

  return (
    <div className="history-container">
      <div className="history-header">
        <h1>Historial de Tickets</h1>
        <div className="history-count">
          {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Buscar por nº ticket, fecha o concepto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>{searchTerm ? 'No se encontraron tickets' : 'Aún no hay tickets generados'}</p>
        </div>
      ) : (
        <div className="history-list">
          {filtered.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/ticket/${ticket.id}`}
              className="history-card"
            >
              <div className="card-top">
                <div className="card-number">
                  <span className="card-label">Ticket Nº</span>
                  <span className="card-value">{formatTicketNumber(ticket.id)}</span>
                </div>
                <div className="card-date">
                  <span>📅</span> {ticket.date} {ticket.time}
                </div>
              </div>
              <div className="card-lines">
                {ticket.lines.slice(0, 2).map((line) => (
                  <div key={line.id} className="card-line">
                    <span className="line-bullet">•</span>
                    <span>{line.concept || '(Sin concepto)'}</span>
                    <span className="line-amount">{line.units} × {(line.unitPrice || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
                  </div>
                ))}
                {ticket.lines.length > 2 && (
                  <div className="card-more">+{ticket.lines.length - 2} líneas más</div>
                )}
              </div>
              <div className="card-total">
                <span>TOTAL</span>
                <span className="total-amount">{ticket.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
