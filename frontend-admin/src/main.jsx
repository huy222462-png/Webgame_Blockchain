import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'
import AdminRegister from './AdminRegister'

const root = createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/register" element={<AdminRegister />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
