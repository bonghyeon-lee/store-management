import { App } from '@app';
import React from 'react';
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


