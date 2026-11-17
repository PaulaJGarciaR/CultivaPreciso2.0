import logo from "../../assets/cultiva-preciso-logo.svg";

export default function PantallaCarga() {
  const claro = localStorage.getItem("cultiva_theme") === "light";

  const fondo = claro ? "#F7F5EC" : "#1A110D";
  const anillo = claro ? "rgba(46,107,69,0.15)" : "rgba(255,255,255,0.08)";
  const acento = claro ? "#2E6B45" : "#CC9633";
  const texto = claro ? "#2F281F" : "rgba(255,255,255,0.7)";

  return (
    <div
      role="status"
      aria-live="polite"
      className="h-screen w-full flex flex-col items-center justify-center gap-5"
      style={{ background: fondo }}
    >
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border-4 animate-spin"
          style={{ borderColor: anillo, borderTopColor: acento }}
        />
        <img src={logo} alt="" className="w-16 h-16 rounded-full object-contain" />
      </div>
      <p
        className="text-sm tracking-wide"
        style={{ color: texto, fontFamily: "'Lato', sans-serif" }}
      >
        Cargando…
      </p>
    </div>
  );
}