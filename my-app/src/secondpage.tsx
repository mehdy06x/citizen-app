import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import UserDashboard from './Userdashboard.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserDashboard />
  </StrictMode>,
)
