import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// ── Vistas existentes ─────────────────────────────────────────────────────────
import ViewDashboard from "./components/dashboard/ViewDashboard.jsx";
import ViewCultivo from "./components/dashboard/ViewCultivo";
import ViewWeather from "./components/dashboard/ViewWeather";
import ViewMonitoring from "./components/dashboard/ViewMonitoring";
import ViewReports from "./components/dashboard/ViewReports";
import ViewCalendar from "./components/dashboard/ViewCalendar.jsx";
import ViewPerfil from "./components/dashboard/ViewPerfil.jsx";

// ── Nuevas vistas de Fitosanidad ──────────────────────────────────────────────
import ViewEnfermedades from "./components/dashboard/ViewEnfermedades.jsx";
import ChatEnfermedadesFlotante from "./components/dashboard/Viewchatenfermedades.jsx";
import ChatGeneralFlotante from "./components/dashboard/Viewchatgeneral.jsx";
import ViewCalculadoraSensores from "./components/dashboard/ViewCalculadoraSensores.jsx";

// ── Firebase ──────────────────────────────────────────────────────────────────
import { signOut } from "firebase/auth";
import { auth } from "../firebase.js";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// ── Iconos ────────────────────────────────────────────────────────────────────
const Icon = {
  Dashboard: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-5 h-5"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Monitor: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-5 h-5"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  Sensor: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-5 h-5"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  ),
  Cultivo: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-5 h-5"
    >
      <path d="M12 22V12M12 12C12 7 7 4 2 5c0 5 3 9 10 7M12 12c0-5 5-8 10-7 0 5-3 9-10 7" />
    </svg>
  ),
  Weather: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-5 h-5"
    >
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  ),
  AI: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-5 h-5"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Reports: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-5 h-5"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Calendario: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 10h16M8 14h8m-4-7V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Z"
      />
    </svg>
  ),
  Enfermedad: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-5 h-5"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4m0 4h.01" />
    </svg>
  ),
  Menu: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="w-5 h-5"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Logout: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-4 h-4"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  User: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="w-5 h-5"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
};

// ── Grupos de navegación ──────────────────────────────────────────────────────
const NAV_PRINCIPAL = [
  { id: "dashboard", label: "Inicio", Icon: Icon.Dashboard },
  { id: "cultivo", label: "Mi Cultivo", Icon: Icon.Cultivo },
  { id: "weather", label: "Meteorología", Icon: Icon.Weather },
  { id: "monitoring", label: "Monitoreo", Icon: Icon.Monitor },
  { id: "sensores", label: "Sensores", Icon: Icon.Sensor },
  { id: "reports", label: "Reportes", Icon: Icon.Reports },
  { id: "calendar", label: "Calendario", Icon: Icon.Calendario },
  { id: "enfermedades", label: "Enfermedades", Icon: Icon.Enfermedad },
  { id: "perfil", label: "Mi Perfil", Icon: Icon.User },
];

export default function DashboardAgricultor({ user }) {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const db = getFirestore();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!user?.uid) return;
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setUserData(snap.data());
      } catch (e) {
        console.error("Error al obtener datos del usuario:", e);
      }
    };
    fetchUser();
  }, [user]);

  const [cultivo, setCultivo] = useState({
    nombre: "",
    hectareas: "",
    variedad: "",
    fechaSiembra: "",
    region: "",
    notas: "",
  });

  // ── Nombre / iniciales ────────────────────────────────────────────────────
  const displayName = userData
    ? `${userData.firstName || ""} ${userData.lastName || ""}`.trim()
    : user?.displayName?.split(" ")[0] ||
      user?.email?.split("@")[0] ||
      "Usuario";

  const getInitials = () => {
    if (userData?.firstName)
      return `${userData.firstName[0]}${userData.lastName?.[0] || ""}`.toUpperCase();
    if (!user?.displayName) return "US";
    return user.displayName
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // ── Vista activa ──────────────────────────────────────────────────────────
  const renderView = () => {
    switch (activeNav) {
      case "dashboard":
        return <ViewDashboard cultivo={cultivo} onGoTo={setActiveNav} />;
      case "cultivo":
        return (
          <ViewCultivo cultivo={cultivo} setCultivo={setCultivo} user={user} />
        );
      case "weather":
        return <ViewWeather cultivo={cultivo} />;
      case "monitoring":
        return <ViewMonitoring />;
      case "sensores":
        return <ViewCalculadoraSensores />;
      case "reports":
        return <ViewReports cultivo={cultivo} />;
      case "calendar":
        return <ViewCalendar cultivo={cultivo} user={user} />;
      case "enfermedades":
        return <ViewEnfermedades />;
      case "perfil":
        return (
          <ViewPerfil
            user={user}
            userData={userData}
            setUserData={setUserData}
          />
        );
      default:
        return null;
    }
  };

  const allItems = NAV_PRINCIPAL;
  const activeItem = allItems.find((n) => n.id === activeNav);
  const isFitoActive = activeNav === "enfermedades";

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
      Swal.fire({
        icon: "success",
        title: "Sesión terminada",
        text: "Se cerró la sesión correctamente",
        timer: 1500,
        showConfirmButton: false,
        background: "#422D1A",
        color: "#ffffff",
      });
    } catch (e) {
      console.error("Error al cerrar sesión:", e);
    }
  };

  // ── Botón nav reutilizable ────────────────────────────────────────────────
  const NavButton = ({ id, label, Icon: NavIcon, fito = false }) => {
    const active = activeNav === id;
    return (
      <button
        onClick={() => setActiveNav(id)}
        className={`nav-item w-full flex items-center gap-3 px-4 py-2.5 text-left
          ${
            active
              ? fito
                ? "nav-item-fito active"
                : "active"
              : "text-white/40 hover:text-white/70"
          }`}
      >
        <span className="shrink-0">
          <NavIcon />
        </span>
        {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
      </button>
    );
  };

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ fontFamily: "'Lato',sans-serif", background: "#1A110D" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Lato:wght@300;400;700&display=swap');
        .font-serif { font-family:'Playfair Display',serif !important; }
        ::-webkit-scrollbar       { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1); border-radius:4px; }
        .nav-item { transition:background .2s,color .2s; border-left:2px solid transparent; }
        .nav-item:hover { background:rgba(255,255,255,0.05); }
        .nav-item.active { background:rgba(46,107,69,0.2); border-left-color:#2E6B45; color:#4CAF7D; }
        .nav-item-fito.active { background:rgba(204,150,51,0.14); border-left-color:#CC9633; color:#CC9633; }
        .form-input {
          width:100%; padding:.55rem .85rem; border-radius:8px; font-size:.875rem;
          background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1);
          color:white; outline:none; transition:border-color .2s; font-family:'Lato',sans-serif;
        }
        .form-input::placeholder { color:rgba(255,255,255,0.25); }
        .form-input:focus        { border-color:rgba(46,107,69,0.6); }
        .form-input option       { background:#1A110D; color:white; }
        .field-label {
          display:block; color:rgba(255,255,255,0.4); font-size:0.65rem;
          text-transform:uppercase; letter-spacing:.1em; margin-bottom:.375rem;
        }
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside
        className={`${sidebarOpen ? "w-56" : "w-16"} shrink-0 h-full flex flex-col transition-all duration-300`}
        style={{
          background: "#120C08",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-4 h-16 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="w-8 h-8 rounded-lg bg-[#2E6B45] flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              className="w-4 h-4"
            >
              <path d="M12 22V12M12 12C12 7 7 4 2 5c0 5 3 9 10 7M12 12c0-5 5-8 10-7 0 5-3 9-10 7" />
            </svg>
          </div>
          {sidebarOpen && (
            <span className="font-serif text-white text-base leading-tight">
              Cultiva<span className="text-[#CC9633]">Preciso</span>
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_PRINCIPAL.map(({ id, label, Icon: NavIcon }) => (
            <NavButton key={id} id={id} label={label} Icon={NavIcon} />
          ))}
        </nav>

        {/* Usuario + logout */}
        <div
          className="px-4 py-4 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="avatar"
                className="w-8 h-8 rounded-full shrink-0 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#CC9633]/20 flex items-center justify-center shrink-0">
                <span className="text-[#CC9633] text-xs font-bold">
                  {getInitials()}
                </span>
              </div>
            )}
            {sidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="text-white text-xs font-semibold truncate">
                  {displayName}
                </p>
                <p className="text-white/40 text-xs truncate">
                  {userData?.email || user?.email || "Sin correo"}
                </p>
              </div>
            )}
            {sidebarOpen && (
              <button
                onClick={handleLogout}
                className="text-white/30 hover:text-red-400 transition-colors shrink-0"
                title="Cerrar sesión"
              >
                <Icon.Logout />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header
          className="h-16 shrink-0 flex items-center justify-between px-6"
          style={{
            background: "#120C08",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="text-white/40 hover:text-white transition-colors"
            >
              <Icon.Menu />
            </button>
            <div>
              <h1 className="font-serif text-white text-lg leading-none">
                {activeItem?.label}
              </h1>
              {cultivo.nombre && (
                <p className="text-white/35 text-xs mt-0.5">{cultivo.nombre}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isFitoActive && (
              <span
                className="text-xs px-2.5 py-1 rounded-full font-semibold"
                style={{
                  background: "rgba(204,150,51,0.1)",
                  border: "1px solid rgba(204,150,51,0.22)",
                  color: "#CC9633",
                }}
              >
                Fitosanidad
              </span>
            )}
            <span className="text-white/40 text-xs hidden sm:inline">
              Hola,{" "}
              <span className="text-white/70 font-semibold">{displayName}</span>
            </span>
          </div>
        </header>

        {/* Vista */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          {renderView()}

          {/* Chat flotante de enfermedades — solo aparece en la sección de enfermedades */}
          {activeNav === "enfermedades" && <ChatEnfermedadesFlotante />}

          {/* Chat flotante general — aparece en todas las páginas excepto enfermedades */}
          {activeNav !== "enfermedades" && <ChatGeneralFlotante />}
        </main>
      </div>
    </div>
  );
}
