import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

/** Tarayıcı eklentilerinden gelen gürültüyü bastır (uygulama hatası değil) */
function uzantiGurultusunuFiltrele() {
  window.addEventListener('unhandledrejection', (event) => {
    const mesaj = String(event.reason?.message || event.reason || '');
    if (
      mesaj.includes('message channel closed') ||
      mesaj.includes('Extension context invalidated') ||
      mesaj.includes('Receiving end does not exist')
    ) {
      event.preventDefault();
    }
  });
}

uzantiGurultusunuFiltrele();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
