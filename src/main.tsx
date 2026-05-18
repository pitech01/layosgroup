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
