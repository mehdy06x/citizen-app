import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import { Navigate } from 'react-router-dom'  

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}
function RegisterAndLogout() {
  localStorage.clear()
  return <Register /> //when registering clear the local storage so that the user is logged out and redirected to the register page and avoid any issues with the access token
}
function App() {
  

  return (
    <Router> 
      <Routes>
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} /> // home is for people loged in and authenticated
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App
