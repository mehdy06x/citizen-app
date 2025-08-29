import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import App from './App.tsx'
import AdminDashboard from './admindashboard.tsx'
import Connect from './Connect.tsx'
import AdminReportsPage from './AdminReportsPage'
import AdminFlexyWrapper from './AdminFlexyWrapper'
import UserDashboard from './Userdashboard.tsx'
const CitizenRegister = lazy(() => import('./citizen/pages/Register.jsx'))
const MakeReport = lazy(() => import('./citizen/pages/MakeReport.jsx'))
const CitizenMakeReport = lazy(() => import('./citizen/pages/Home.jsx'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path='/' element={<App/>} />
        
          <Route path='/connect' element={<Connect/>} />
          {/* Show the React AdminDashboard at /admin so admins see the dashboard after login */}
          <Route path='/admin' element={<AdminDashboard/>} />
          {/* Keep the original Flexy iframe available as a fallback */}
          <Route path='/admin/flexy' element={<AdminFlexyWrapper/>} />
          <Route path='/secondpage' element={<UserDashboard/>} />
          <Route path='/admin/reports' element={<AdminReportsPage/>} />
          <Route path='/register' element={<CitizenRegister/>} />
          <Route path='/make-report' element={<MakeReport/>} />
          <Route path='/make-report' element={<CitizenMakeReport/>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
