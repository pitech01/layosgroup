import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Silent AI Engine: Aggressively eliminate Puter Branding/Banners/Marketing
const eliminatePuterUI = () => {
  const selectors = [
    '.puter-attribution', 
    '#puter-attribution',
    '.puter-cloud-menu',
    '#puter-cloud-menu',
    '.puter-banner',
    '[id*="puter-cloud-menu"]',
    '#puter-attribution-container'
  ];
  
  const removeElements = (root: Document | ShadowRoot) => {
    selectors.forEach(selector => {
      root.querySelectorAll(selector).forEach(el => el.remove());
    });
    
    root.querySelectorAll('div, span, p, label, button, a').forEach(el => {
      // ONLY REMOVE MARKETING/POWERED-BY, NOT AUTH
      if (el.textContent && (
        el.textContent.includes('Powered by Puter') || 
        el.textContent.includes('This website uses Puter to bring شما') || // specific v2 banner
        el.textContent.includes('By clicking \'Continue\' you agree') // This is the banner footer text
      )) {
          if (!el.closest('[class*="modal"]') && !el.closest('[id*="modal"]')) {
              el.remove();
          }
      }
    });

    root.querySelectorAll('*').forEach(el => {
      if (el.shadowRoot) removeElements(el.shadowRoot);
    });
  };

  removeElements(document);

  const puter = (window as any).puter;
  if (puter && puter.ui) {
    if (typeof puter.ui.setMenuVisible === 'function') puter.ui.setMenuVisible(false);
    if (typeof puter.ui.hideSpinner === 'function') puter.ui.hideSpinner();
  }
};

const observer = new MutationObserver(eliminatePuterUI);
observer.observe(document.body, { childList: true, subtree: true });

// Run immediately and periodically for the first few seconds
eliminatePuterUI();
[500, 1000, 2000, 5000].forEach(ms => setTimeout(eliminatePuterUI, ms));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
