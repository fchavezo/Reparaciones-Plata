import { formatTicketNumber, type Ticket, type CompanyConfig } from '../types/ticket';
import { getPrintSettings, type PrintSettings } from './printSettings';

// Consolas has thicker strokes than Courier New, whose thin lines fade on the Windows driver.
// Courier New stays as the fallback: the ticket layout must also fit with its wider characters.
const TICKET_FONT = "Consolas, 'Courier New', monospace";

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
  const font = `bold ${fontSizePx * scale}px ${TICKET_FONT}`;
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

// Page box shared by the ticket and the test print: the content is only as wide as the area
// the printer driver actually prints, so nothing is cut off on narrower paper.
function pageStyles({ contentWidthMm, leftMarginMm, topMarginMm }: PrintSettings): string {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: ${TICKET_FONT};
      font-size: 12px;
      width: ${contentWidthMm}mm;
      color: #000;
      padding: 2mm;
    }
    @media print {
      body { width: ${contentWidthMm}mm; padding: ${topMarginMm}mm 0 0 ${leftMarginMm}mm; box-sizing: content-box; }
      @page { margin: 0; size: auto; }
    }`;
}

export function generateTicketPrintHTML(ticket: Ticket, settings: PrintSettings = getPrintSettings()): string {
  const config = getCompanyConfig();
  const companyName = config.name.toUpperCase();
  const companyNameHTML = renderTextAsImage(companyName, 15) ?? companyName;

  const linesHTML = ticket.lines
    .map(
      (line) => `<tr>
  <td class="line-concept" colspan="2">${line.concept || '(Sin concepto)'}</td>
</tr>
<tr>
  <td class="line-qty-price">${parseFloat(line.units.toFixed(2)).toLocaleString('es-ES')} x ${line.unitPrice.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
    ${pageStyles(settings)}
    .company-header { text-align: center; margin-bottom: 3mm; }
    .company-name { font-size: 14px; font-weight: bold; margin-bottom: 1mm; }
    .company-name-img { display: block; max-width: 100%; height: auto; margin: 0 auto; }
    .company-detail { font-size: 11px; margin-bottom: 0.5mm; }
    .divider { border-top: 1px dashed #000; margin: 2mm 0; }
    .ticket-info { text-align: center; font-size: 12px; margin-bottom: 2mm; }
    .ticket-title { font-size: 13px; font-weight: bold; margin-bottom: 1mm; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 2mm; }
    th { text-align: left; font-size: 11px; padding: 1mm 0; border-bottom: 1px solid #000; }
    td { font-size: 12px; }
    .line-concept { text-align: left; word-break: break-word; padding-top: 1mm; }
    .line-qty-price { text-align: left; padding-bottom: 1mm; }
    .line-total { text-align: right; white-space: nowrap; padding-left: 2mm; padding-bottom: 1mm; }
    th.line-total { padding-bottom: 1mm; }
    .totals { margin-top: 1mm; font-size: 12px; }
    .totals-row { display: flex; justify-content: space-between; padding: 0.5mm 0; }
    .totals-row.final { font-size: 13px; font-weight: bold; margin-top: 2mm; border-top: 1px solid #000; padding-top: 1mm; }
    .footer { text-align: center; font-size: 11px; margin-top: 3mm; }
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
    <div>Nº Ticket: ${formatTicketNumber(ticket.id)}</div>
    <div>${ticket.date} ${ticket.time}</div>
  </div>
  <div class="divider"></div>
  <table>
    <thead>
      <tr><th class="line-qty-price">Cant. x Precio</th><th class="line-total">Importe</th></tr>
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

// Calibration ticket: a box as wide as the configured area with a mark every 5 mm, so it is
// easy to see whether the edges are cut off or there is room to spare.
export function generatePrintTestHTML(settings: PrintSettings): string {
  const marks = Array.from({ length: Math.floor(settings.contentWidthMm / 5) }, (_, i) => {
    const mm = (i + 1) * 5;
    return `<div class="mark" style="left:${mm}mm"><span>${mm}</span></div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Prueba de impresión</title>
  <style>
    ${pageStyles(settings)}
    body { font-size: 10px; text-align: center; }
    .box { border: 1px solid #000; padding: 2mm 1mm; margin-bottom: 3mm; }
    .ruler { position: relative; height: 8mm; border-bottom: 1px solid #000; margin: 0 -1mm; }
    .mark { position: absolute; bottom: 0; width: 0; height: 3mm; border-left: 1px solid #000; }
    .mark span { position: absolute; bottom: 3.5mm; left: -3mm; width: 6mm; font-size: 7px; }
    .title { font-size: 12px; font-weight: bold; margin-bottom: 2mm; }
    p { margin-bottom: 1mm; }
  </style>
</head>
<body>
  <div class="box">
    <div class="title">PRUEBA DE IMPRESIÓN</div>
    <p>Ancho: ${settings.contentWidthMm} mm</p>
    <p>Margen izq.: ${settings.leftMarginMm} mm · sup.: ${settings.topMarginMm} mm</p>
    <div class="ruler">${marks}</div>
  </div>
  <p>Deben verse los 4 bordes del recuadro.</p>
  <p>Si falta el borde derecho, reduce el ancho.</p>
</body>
</html>`;
}

export function printTicket(ticket: Ticket): void {
  printHTML(generateTicketPrintHTML(ticket));
}

export function printHTML(html: string): void {
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
