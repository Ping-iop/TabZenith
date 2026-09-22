import React from 'react';
import ReactDOM from 'react-dom/client';
import { PopupApp } from './App';
import { ErrorBoundary } from '@/ui/molecules/ErrorBoundary';
import '@/ui/tokens/design-tokens.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary fallbackTitle="Error en Popup">
        <PopupApp />
      </ErrorBoundary>
    </React.StrictMode>
  );
}

