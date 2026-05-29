import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase.js";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase.js";
import Home from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import DashboardAgricultor from "./pages/DashboardAgricultor";
import DashboardAdmin from "./pages/DashboardAdmin";
import DashboardProfesional from "./pages/DashboardProfesional";
import "./App.css";

function PrivateRoute({ children, requiredRole }) {
  const [user, loading] = useAuthState(auth);
  const [role, setRole] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      setChecking(false);
      return;
    }
    getDoc(doc(db, "users", user.uid))
      .then((snap) => {
        setRole(snap.data()?.role || "agricultor");
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [user]);

  if (loading || checking)
    return <h1 style={{ color: "white" }}>Cargando...</h1>;
  if (!user) return <Navigate to="/comenzar" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const [user] = useAuthState(auth);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/comenzar" element={<AuthPage />} />

      <Route
        path="/dashboardAgricultor"
        element={
          <PrivateRoute requiredRole="agricultor">
            <DashboardAgricultor user={user} />
          </PrivateRoute>
        }
      />

      <Route
        path="/dashboardAdmin"
        element={
          <PrivateRoute requiredRole="admin">
            <DashboardAdmin user={user} />
          </PrivateRoute>
        }
      />
      <Route
        path="/dashboardProfesional"
        element={
          <PrivateRoute requiredRole="profesional">
            <DashboardProfesional user={user} />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
