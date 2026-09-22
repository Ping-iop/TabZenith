import React from 'react';
import ReactDOM from 'react-dom/client';
import { PopupApp } from './App';
import { ErrorBoundary } from '@/ui/molecules/ErrorBoundary';
import { I18nProvider } from '@/core/i18n/I18nContext';
import '@/ui/tokens/design-tokens.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary fallbackTitle="Error en Popup">
        <I18nProvider>
          <PopupApp />
        </I18nProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

