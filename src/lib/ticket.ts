import { formatTicketNumber, type Ticket, type CompanyConfig } from '../types/ticket';

export function getCompanyConfig(): CompanyConfig {
  return {
    name: 'Reparaciones Plata',
    nif: '8857038Z',
    address: 'Avda. Extremadura, 68 Talavera la Real, Badajoz',
    phone: '604417781',
  };
}

// Thermal printer drivers often swap large bold text for the printer's built-in fonts and
// print garbage, so the company name is printed as a black-and-white image instead of text.
function renderTextAsImage(text: string, fontSizePx: number): string | null {
  const scale = 3; // draw at a higher resolution so it stays sharp on the printer
  const font = `bold ${fontSizePx * scale}px 'Courier New', monospace`;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.font = font;
  canvas.width = Math.ceil(ctx.measureText(text).width);
  canvas.height = Math.ceil(fontSizePx * scale * 1.3);

  // Resizing the canvas resets its state
  ctx.font = font;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000';
  ctx.fillText(text, 0, canvas.height / 2);

  // Thermal printers only print black or white: drop the grey anti-aliasing so edges don't dither
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = image;
  for (let i = 0; i < data.length; i += 4) {
    const value = data[i] < 128 ? 0 : 255;
    data[i] = data[i + 1] = data[i + 2] = value;
  }
  ctx.putImageData(image, 0, 0);

  return `<img class="company-name-img" src="${canvas.toDataURL('image/png')}" width="${canvas.width / scale}" alt="${text}">`;
}

// The POS-58 driver on macOS drops the first band of every print job, so the ticket starts
// with blank space to keep the company name out of it.
const PRINT_TOP_MARGIN_MM = 8;

export function generateTicketPrintHTML(ticket: Ticket): string {
  const config = getCompanyConfig();
  const companyName = config.name.toUpperCase();
  const companyNameHTML = renderTextAsImage(companyName, 14) ?? companyName;

  const linesHTML = ticket.lines
    .map(
      (line) => `<tr>
  <td class="line-concept">${line.concept || '(Sin concepto)'}</td>
  <td class="line-qty">${parseFloat(line.units.toFixed(2)).toLocaleString('es-ES')}</td>
  <td class="line-price">${line.unitPrice.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
  <td class="line-total">${(line.unitPrice * line.units).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
</tr>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Ticket #${ticket.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      font-size: 11px;
      width: 58mm;
      color: #000;
      padding: 2mm;
    }
    .company-header { text-align: center; margin-bottom: 3mm; }
    .company-name { font-size: 14px; font-weight: bold; margin-bottom: 1mm; }
    .company-name-img { display: block; max-width: 100%; height: auto; margin: 0 auto; }
    .company-detail { font-size: 9px; margin-bottom: 0.5mm; }
    .divider { border-top: 1px dashed #000; margin: 2mm 0; }
    .ticket-info { text-align: center; font-size: 10px; margin-bottom: 2mm; }
    .ticket-title { font-size: 12px; font-weight: bold; margin-bottom: 1mm; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 2mm; }
    th { text-align: left; font-size: 9px; padding: 1mm 0; border-bottom: 1px solid #000; }
    td { padding: 0.5mm 0; font-size: 10px; }
    .line-concept { text-align: left; }
    .line-qty { text-align: right; padding-right: 4mm; }
    .line-price { text-align: right; padding-right: 4mm; }
    .line-total { text-align: right; }
    th.line-qty, th.line-price, th.line-total { text-align: right; }
    .totals { margin-top: 1mm; font-size: 10px; }
    .totals-row { display: flex; justify-content: space-between; padding: 0.5mm 0; }
    .totals-row.final { font-size: 13px; font-weight: bold; margin-top: 2mm; border-top: 1px solid #000; padding-top: 1mm; }
    .footer { text-align: center; font-size: 9px; margin-top: 3mm; }
    @media print {
      body { width: 58mm; padding: ${PRINT_TOP_MARGIN_MM}mm 0 0; }
      @page { margin: 0; size: auto; }
    }
  </style>
</head>
<body>
  <div class="company-header">
    <div class="company-name">${companyNameHTML}</div>
    <div class="company-detail">NIF: ${config.nif}</div>
    <div class="company-detail">${config.address}</div>
    <div class="company-detail">Tel: ${config.phone}</div>
  </div>
  <div class="divider"></div>
  <div class="ticket-info">
    <div class="ticket-title">FACTURA SIMPLIFICADA</div>
    <div>Nº Ticket: ${formatTicketNumber(ticket.id)} | Fecha: ${ticket.date} ${ticket.time}</div>
  </div>
  <div class="divider"></div>
  <table>
    <thead>
      <tr><th class="line-concept">Concepto</th><th class="line-qty">Cant.</th><th class="line-price">P.Unit.</th><th class="line-total">Importe</th></tr>
    </thead>
    <tbody>${linesHTML}</tbody>
  </table>
  <div class="divider"></div>
  <div class="totals">
    <div class="totals-row"><span>SUBTOTAL:</span><span>${ticket.subtotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span></div>
    <div class="totals-row"><span>IVA (${ticket.ivaRate}%):</span><span>${ticket.ivaAmount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span></div>
    <div class="totals-row final"><span>TOTAL:</span><span>${ticket.total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span></div>
  </div>
  <div class="divider"></div>
  <div class="footer">
    <div>¡Gracias por su confianza!</div>
    <div>${config.name}</div>
  </div>
</body>
</html>`;
}

export function printTicket(ticket: Ticket): void {
  const html = generateTicketPrintHTML(ticket);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }
}
