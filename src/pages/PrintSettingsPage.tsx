import { useState } from 'react';
import { generatePrintTestHTML, printHTML } from '../lib/ticket';
import {
  DEFAULT_PRINT_SETTINGS,
  getPrintSettings,
  resetPrintSettings,
  savePrintSettings,
  type PrintSettings,
} from '../lib/printSettings';
import './PrintSettingsPage.css';

const FIELDS: { key: keyof PrintSettings; label: string; hint: string; min: number; max: number }[] = [
  {
    key: 'contentWidthMm',
    label: 'Ancho de impresión (mm)',
    hint: 'Zona que imprime el cabezal, no el ancho del rollo. En impresoras de 58 mm suele ser 46–48 mm.',
    min: 30,
    max: 80,
  },
  {
    key: 'leftMarginMm',
    label: 'Margen izquierdo (mm)',
    hint: 'Desplaza el ticket a la derecha si el borde izquierdo sale cortado.',
    min: 0,
    max: 15,
  },
  {
    key: 'topMarginMm',
    label: 'Margen superior (mm)',
    hint: 'Espacio en blanco antes del nombre de la empresa.',
    min: 0,
    max: 30,
  },
];

export function PrintSettingsPage() {
  const [settings, setSettings] = useState<PrintSettings>(getPrintSettings);

  const update = (key: keyof PrintSettings, value: string) => {
    const number = parseFloat(value.replace(',', '.'));
    const next = { ...settings, [key]: Number.isFinite(number) ? number : 0 };
    setSettings(next);
    savePrintSettings(next);
  };

  const handleReset = () => {
    resetPrintSettings();
    setSettings({ ...DEFAULT_PRINT_SETTINGS });
  };

  return (
    <div className="print-settings-container">
      <h1>Impresora</h1>
      <p className="print-settings-intro">
        Ajustes de este ordenador. Si el ticket sale cortado o descentrado, cambia los valores y haz una
        prueba hasta que se vean los cuatro bordes del recuadro.
      </p>

      <div className="print-settings-card">
        {FIELDS.map(({ key, label, hint, min, max }) => (
          <label key={key} className="print-setting">
            <span className="print-setting-label">{label}</span>
            <input
              type="number"
              min={min}
              max={max}
              step={0.5}
              value={settings[key]}
              onChange={(e) => update(key, e.target.value)}
            />
            <span className="print-setting-hint">{hint}</span>
          </label>
        ))}

        <div className="print-settings-actions">
          <button className="reset-btn" onClick={handleReset}>
            Restablecer
          </button>
          <button className="test-print-btn" onClick={() => printHTML(generatePrintTestHTML(settings))}>
            🖨️ Imprimir prueba
          </button>
        </div>
      </div>

      <div className="print-settings-card print-settings-tips">
        <h2>En el diálogo de impresión de Windows</h2>
        <ul>
          <li>Impresora: <strong>POS-58</strong>.</li>
          <li>En <em>Más opciones</em>: Márgenes <strong>Ninguno</strong> y Escala <strong>Predeterminado (100)</strong>.</li>
          <li>Desactiva <em>Encabezados y pies de página</em>.</li>
          <li>Edge recuerda estas opciones para las siguientes impresiones.</li>
        </ul>
      </div>
    </div>
  );
}
