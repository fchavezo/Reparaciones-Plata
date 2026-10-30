import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MenuIcon } from './icons';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // While the mobile menu is open: close it with Escape and stop the page behind from scrolling
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <div className={`app-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <header className="topbar">
        <button
          className="topbar-menu"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú"
          aria-controls="app-sidebar"
          aria-expanded={mobileOpen}
        >
          <MenuIcon />
        </button>
        <span className="brand-mark">RP</span>
        <span className="topbar-title">Reparaciones Plata</span>
      </header>

      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapsed={() => setCollapsed((prev) => !prev)}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div
        className={`sidebar-overlay ${mobileOpen ? 'visible' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <main className="main-content">{children}</main>
    </div>
  );
}
