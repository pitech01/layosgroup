import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Silent AI Engine: Aggressively eliminate Puter Popups/Banners/Modals
const eliminatePuterBanner = () => {
  const query = '[id*="puter-"], [class*="puter-"], iframe[src*="puter.com"], .puter-attribution, #puter-attribution';
  document.querySelectorAll(query).forEach(el => el.remove());
  
  // Also scan for elements by text if they lack classes
  document.querySelectorAll('div, span, p, label').forEach(el => {
    if (el.textContent && (
      el.textContent.includes('Powered by Puter') || 
      el.textContent.includes('This website uses Puter to bring you')
    )) {
      (el.closest('[id*="puter"]') || el).remove();
    }
  });
};

const observer = new MutationObserver(eliminatePuterBanner);
observer.observe(document.body, { childList: true, subtree: true });
eliminatePuterBanner();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
