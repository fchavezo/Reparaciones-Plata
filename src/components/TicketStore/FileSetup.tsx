import { useTicketStore } from '../../hooks/useTicketStore';
import './FileSetup.css';

export function FileSetup() {
  const { status, fileName, error, openFile, createFile, reconnect } = useTicketStore();

  if (status === 'loading') {
    return <div className="file-setup"><p className="file-setup-text">Cargando…</p></div>;
  }

  if (status === 'unsupported') {
    return (
      <div className="file-setup">
        <div className="file-setup-card">
          <div className="file-setup-icon">⚠️</div>
          <h1>Navegador no compatible</h1>
          <p className="file-setup-text">
            Para guardar los tickets en un archivo abre la aplicación con Google Chrome o Microsoft Edge.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="file-setup">
      <div className="file-setup-card">
        <div className="file-setup-icon">📂</div>
        <h1>Archivo de tickets</h1>
        <p className="file-setup-text">
          Los tickets se guardan en un archivo de tu ordenador. Ábrelo para ver el historial y seguir con la numeración.
        </p>

        {error && <p className="file-setup-error">{error}</p>}

        <div className="file-setup-actions">
          {fileName && (
            <button className="file-setup-btn primary" onClick={reconnect}>
              {status === 'needs-permission' ? 'Abrir' : 'Volver a usar'} {fileName}
            </button>
          )}
          <button className={`file-setup-btn ${fileName ? '' : 'primary'}`} onClick={openFile}>
            Abrir archivo existente
          </button>
          <button className="file-setup-btn" onClick={createFile}>
            Crear archivo nuevo
          </button>
        </div>
      </div>
    </div>
  );
}
