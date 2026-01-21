import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ReactGA from 'react-ga4';
import './index.css';
import App from './App.tsx';

// Initialize GA4
const GA4_MEASUREMENT_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;

if (GA4_MEASUREMENT_ID) {
  ReactGA.initialize(GA4_MEASUREMENT_ID);
  console.log('[GA4] Initialized with:', GA4_MEASUREMENT_ID);
} else {
  console.warn('[GA4] VITE_GA4_MEASUREMENT_ID not set - analytics disabled');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

