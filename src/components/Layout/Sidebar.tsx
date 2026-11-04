import { NavLink, useLocation } from 'react-router-dom';
import { useTicketStore } from '../../hooks/useTicketStore';
import { ChevronLeftIcon, CloseIcon, FileIcon, HistoryIcon, PrinterIcon, ReceiptIcon, SwapIcon } from './icons';
import './Sidebar.css';

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapsed: () => void;
  onCloseMobile: () => void;
}

export function Sidebar({ collapsed, mobileOpen, onToggleCollapsed, onCloseMobile }: SidebarProps) {
  const location = useLocation();
  const { status, fileName, tickets, closeFile } = useTicketStore();
  // A ticket opened from the history still belongs to the "Historial" section
  const inHistory = location.pathname === '/historial' || location.pathname.startsWith('/ticket/');

  const classes = ['sidebar', collapsed ? 'collapsed' : '', mobileOpen ? 'open' : ''].join(' ');

  const handleChangeFile = () => {
    onCloseMobile();
    closeFile();
  };

  return (
    <aside id="app-sidebar" className={classes} aria-label="Menú principal">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <span className="brand-mark">RP</span>
          <span className="brand-name sidebar-label">Reparaciones Plata</span>
        </div>
        <button className="sidebar-close" onClick={onCloseMobile} aria-label="Cerrar menú">
          <CloseIcon />
        </button>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          title={collapsed ? 'Nuevo ticket' : undefined}
          onClick={onCloseMobile}
        >
          <ReceiptIcon />
          <span className="sidebar-label">Nuevo ticket</span>
        </NavLink>
        <NavLink
          to="/historial"
          className={`nav-item ${inHistory ? 'active' : ''}`}
          aria-current={inHistory ? 'page' : undefined}
          title={collapsed ? `Historial (${tickets.length})` : undefined}
          onClick={onCloseMobile}
        >
          <HistoryIcon />
          <span className="sidebar-label">Historial</span>
          {status === 'ready' && <span className="nav-badge">{tickets.length}</span>}
        </NavLink>
        <NavLink
          to="/impresora"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          title={collapsed ? 'Impresora' : undefined}
          onClick={onCloseMobile}
        >
          <PrinterIcon />
          <span className="sidebar-label">Impresora</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        {status === 'ready' && (
          <div className="sidebar-file">
            <div className="file-info" title={fileName ?? undefined}>
              <FileIcon />
              <div className="file-text sidebar-label">
                <span className="file-caption">Archivo de tickets</span>
                <span className="file-name">{fileName}</span>
              </div>
            </div>
            <button
              className="sidebar-btn"
              onClick={handleChangeFile}
              title={collapsed ? 'Cambiar archivo' : undefined}
            >
              <SwapIcon />
              <span className="sidebar-label">Cambiar archivo</span>
            </button>
          </div>
        )}
        <button
          className="sidebar-btn collapse-btn"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
          aria-expanded={!collapsed}
          title={collapsed ? 'Expandir menú' : undefined}
        >
          <ChevronLeftIcon />
          <span className="sidebar-label">Contraer menú</span>
        </button>
      </div>
    </aside>
  );
}
