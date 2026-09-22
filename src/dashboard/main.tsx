import React from 'react';
import ReactDOM from 'react-dom/client';
import { DashboardApp } from './App';
import { ErrorBoundary } from '@/ui/molecules/ErrorBoundary';
import '@/ui/tokens/design-tokens.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary fallbackTitle="Error en Dashboard Gerencial">
        <DashboardApp />
      </ErrorBoundary>
    </React.StrictMode>
  );
}

