import { useState } from 'react'
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase.js";
import Home from "./pages/HomePage";
import AuthPage from './pages/AuthPage';
import DashboardAgricultor from './pages/DashboardAgricultor';
import './App.css'

function PrivateRoute({ children }) {
  const [user, loading] = useAuthState(auth);
  if (loading) return <h1 style={{ color: "white" }}>Cargando...</h1>;
  return user ? children : <Navigate to="/comenzar" replace />;
}

export default function App() {
  const [user] = useAuthState(auth);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="comenzar" element={<AuthPage />} />
      <Route path="dashboardAgricultor" element={<DashboardAgricultor />} />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <DashboardAgricultor user={user} />
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}