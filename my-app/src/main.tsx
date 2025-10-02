import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import App from './App.tsx'
import AuthProvider from './AuthProvider';
import AdminDashboard from './admindashboard.tsx'
import Connect from './Connect.tsx'
import AdminReportsPage from './AdminReportsPage'
import AdminAgentsPage from './AdminAgentsPage'
import AgentDashboard from './AgentDashboard'
import AdminFlexyWrapper from './AdminFlexyWrapper'
import UserDashboard from './Userdashboard.tsx'
import UsersList from './UsersList.tsx'
const CitizenRegister = lazy(() => import('./citizen/pages/Register.jsx'))
const MakeReport = lazy(() => import('./citizen/pages/MakeReport.jsx'))
// CitizenMakeReport removed; only MakeReport component is used for /make-report

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path='/' element={<App/>} />

          <Route path='/connect' element={<Connect/>} />
          {/* Show the React AdminDashboard at /admin so admins see the dashboard after login */}
          <Route path='/admin' element={<AdminDashboard/>} />
          {/* Keep the original Flexy iframe available as a fallback */}
          <Route path='/admin/flexy' element={<AdminFlexyWrapper/>} />
          <Route path='/admin/users' element={<UsersList/>} />
          <Route path='/admin/agents' element={<AdminAgentsPage/>} />
          <Route path='/secondpage' element={<UserDashboard/>} />
          <Route path='/admin/reports' element={<AdminReportsPage/>} />
          <Route path='/agent/reports' element={<AgentDashboard/>} />
          <Route path='/register' element={<CitizenRegister/>} />
          <Route path='/make-report' element={<MakeReport/>} />
        </Routes>
      </Suspense>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

// Preload page background to avoid white flash on route navigation
try{
  const img = new Image();
  img.src = new URL('./images/backBleu.png', import.meta.url).toString();
}catch(e){
  // ignore in environments without URL/import meta support
}
