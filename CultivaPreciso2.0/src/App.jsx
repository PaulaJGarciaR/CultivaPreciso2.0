import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/HomePage"
import AuthPage from './pages/AuthPage';
import DashboardAgricultor from './pages/DashboardAgricultor';

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="comenzar" element={<AuthPage/>} />
        <Route path="dashboardAgricultor" element={<DashboardAgricultor/>} />
      </Routes>
    
  )
}

export default App
