import type { TicketLine } from '../../types/ticket';

interface TicketLineRowProps {
  line: TicketLine;
  index: number;
  onUpdate: (id: string, field: keyof TicketLine, value: string | number) => void;
  onRemove: (id: string) => void;
  isFirst: boolean;
}

export function TicketLineRow({ line, index, onUpdate, onRemove, isFirst }: TicketLineRowProps) {
  const handleChange = (field: keyof TicketLine, value: string | number) => {
    onUpdate(line.id, field, value);
  };

  return (
    <div className="ticket-line-row">
      <div className="line-index">{index + 1}</div>
      <div className="line-concept-field">
        <input
          type="text"
          value={line.concept}
          onChange={(e) => handleChange('concept', e.target.value)}
          placeholder="Concepto..."
          className="line-input"
        />
      </div>
      <div className="line-price-field">
        <label className="field-label">P. Unit. (€)</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={line.unitPrice || ''}
          onChange={(e) => handleChange('unitPrice', parseFloat(e.target.value) || 0)}
          className="line-input line-price-input"
          placeholder="0,00"
        />
      </div>
      <div className="line-units-field">
        <label className="field-label">Unidades</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={line.units}
          onChange={(e) => handleChange('units', parseFloat(e.target.value) || 0)}
          className="line-input line-units-input"
        />
      </div>
      <div className="line-total-field">
        <label className="field-label">Subtotal</label>
        <div className="line-total">
          {((line.unitPrice || 0) * (line.units || 0)).toLocaleString('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })} €
        </div>
      </div>
      {!isFirst && (
        <button className="remove-line-btn" onClick={() => onRemove(line.id)} title="Eliminar línea">
          ✕
        </button>
      )}
    </div>
  );
}
