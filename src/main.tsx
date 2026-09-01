// Live domain redirect fail-safe (e.g. *.layosgroupllc.com -> https://lms.lglconsultingllc.com)
if (
  typeof window !== 'undefined' &&
  window.location.hostname.includes('layosgroupllc.com') &&
  !window.location.hostname.includes('lglconsultingllc.com')
) {
  window.location.replace(
    `https://lms.lglconsultingllc.com${window.location.pathname}${window.location.search}${window.location.hash}`
  );
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import SecurityGuard from './components/common/SecurityGuard.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SecurityGuard>
      <App />
    </SecurityGuard>
  </StrictMode>,
)
