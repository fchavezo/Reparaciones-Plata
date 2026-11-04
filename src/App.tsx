import { useState } from 'react';
import { HashRouter, Routes, Route, useParams } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { TicketStoreProvider } from './components/TicketStore/TicketStoreProvider';
import { FileSetup } from './components/TicketStore/FileSetup';
import HomePage from './pages/HomePage';
import { HistoryPage } from './pages/HistoryPage';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { PrintSettingsPage } from './pages/PrintSettingsPage';
import { useTicketStore } from './hooks/useTicketStore';
import { createEmptyDraft } from './types/ticket';
import type { TicketDraft } from './types/ticket';
import './App.css';

function TicketDetailInner() {
  const params = useParams();
  const id = parseInt(params.id || '0', 10);
  const { tickets } = useTicketStore();
  const ticket = tickets.find((t) => t.id === id);

  if (!ticket) {
    return (
      <main className="page-container">
        <div className="not-found">
          <div className="not-found-icon">🔍</div>
          <h2>Ticket no encontrado</h2>
        </div>
      </main>
    );
  }

  return <TicketDetailPage ticket={ticket} />;
}

function RouterContent() {
  const { status, tickets } = useTicketStore();
  // Kept here so the ticket being edited survives navigating to the history and back
  const [draft, setDraft] = useState<TicketDraft>(createEmptyDraft);

  return (
    <Layout>
      {status === 'ready' ? (
        <Routes>
          <Route path="/" element={<HomePage draft={draft} onDraftChange={setDraft} />} />
          <Route path="/historial" element={<HistoryPage tickets={tickets} />} />
          <Route path="/ticket/:id" element={<TicketDetailInner />} />
          <Route path="/impresora" element={<PrintSettingsPage />} />
        </Routes>
      ) : (
        <FileSetup />
      )}
    </Layout>
  );
}

function App() {
  return (
    <TicketStoreProvider>
      <HashRouter>
        <RouterContent />
      </HashRouter>
    </TicketStoreProvider>
  );
}

export default App;
