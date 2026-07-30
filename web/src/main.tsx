import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sileo';
import 'sileo/styles.css';
import App from './App';
import './index.css';
import { ProfileProvider } from './state/profile';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ProfileProvider>
        <App />
        {/* Sempre en clar: l'aplicació no té tema fosc.
            Es vol per sobre de tot, fins i tot de la barra de navegació
            (el viewport de Sileo ja té z-index:50, per sobre del header
            que és z-30) — per això el marge superior és mínim en comptes
            de deixar espai sota la píndola. */}
        <Toaster theme="light" position="top-center" offset={{ top: 16 }} />
      </ProfileProvider>
    </BrowserRouter>
  </StrictMode>,
);
