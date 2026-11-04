// Printer settings depend on the computer (driver, OS, paper roll), so they are kept in the
// browser of each machine instead of in the shared tickets file.
export interface PrintSettings {
  contentWidthMm: number; // width of the printed area, not of the paper roll
  leftMarginMm: number;
  topMarginMm: number;
}

const STORAGE_KEY = 'printSettings';

const isWindows = typeof navigator !== 'undefined' && /Windows/i.test(navigator.userAgent);

// The POS-58 driver on Windows only prints the central 48 mm of the roll and cuts anything
// wider, while the macOS driver scales the 58 mm page to fit. The macOS driver also drops the
// first band of every print job, so the ticket starts with blank space there.
export const DEFAULT_PRINT_SETTINGS: PrintSettings = isWindows
  ? { contentWidthMm: 46, leftMarginMm: 0, topMarginMm: 2 }
  : { contentWidthMm: 58, leftMarginMm: 0, topMarginMm: 8 };

export function getPrintSettings(): PrintSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_PRINT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    // Unavailable or corrupt storage: fall back to the defaults
  }
  return { ...DEFAULT_PRINT_SETTINGS };
}

export function savePrintSettings(settings: PrintSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage blocked: the settings only last until the page is closed
  }
}

export function resetPrintSettings(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored to remove
  }
}
