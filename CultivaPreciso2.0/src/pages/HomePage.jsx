import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logoCultivaPreciso from "../assets/cultiva-preciso-logo.svg";

const NAV_LINKS = ["Inicio", "Servicios", "Monitoreo", "Nosotros", "Contacto"];

const STATS = [
  { label: "Agricultores", value: 1200, suffix: "+" },
  { label: "Hectáreas monitoreadas", value: 45000, suffix: "+" },
  { label: "Rendimiento mejorado", value: 38, suffix: "%" },
  { label: "Países", value: 12, suffix: "" },
];

// ── Países productores (ISO numérico world-atlas) ──────────────────
const CACAO_INFO = {
  "384": { name: "Costa de Marfil",    flag: "🇨🇮", rank: "#1 mundial",        tons: "2.2M ton/año"  },
  "288": { name: "Ghana",              flag: "🇬🇭", rank: "#2 mundial",        tons: "1.0M ton/año"  },
  "360": { name: "Indonesia",          flag: "🇮🇩", rank: "#3 mundial",        tons: "660K ton/año"  },
  "218": { name: "Ecuador",            flag: "🇪🇨", rank: "Top exportador",    tons: "330K ton/año"  },
  "566": { name: "Nigeria",            flag: "🇳🇬", rank: "#4 mundial",        tons: "340K ton/año"  },
  "120": { name: "Camerún",            flag: "🇨🇲", rank: "#5 mundial",        tons: "295K ton/año"  },
  "076": { name: "Brasil",             flag: "🇧🇷", rank: "#6 mundial",        tons: "270K ton/año"  },
  "604": { name: "Perú",               flag: "🇵🇪", rank: "Orgánico",          tons: "130K ton/año"  },
  "598": { name: "Papua Nueva Guinea", flag: "🇵🇬", rank: "Pacífico",          tons: "45K ton/año"   },
  "484": { name: "México",             flag: "🇲🇽", rank: "Origen histórico",  tons: "28K ton/año"   },
  "214": { name: "Rep. Dominicana",    flag: "🇩🇴", rank: "Orgánico",          tons: "80K ton/año"   },
  "862": { name: "Venezuela",          flag: "🇻🇪", rank: "Cacao de élite",    tons: "20K ton/año"   },
  "450": { name: "Madagascar",         flag: "🇲🇬", rank: "Fino y aromático",  tons: "12K ton/año"   },
  "800": { name: "Uganda",             flag: "🇺🇬", rank: "África oriental",   tons: "35K ton/año"   },
  "768": { name: "Togo",               flag: "🇹🇬", rank: "África occidental", tons: "18K ton/año"   },
  "608": { name: "Filipinas",          flag: "🇵🇭", rank: "Asia",              tons: "10K ton/año"   },
  "170": { name: "Colombia",           flag: "🇨🇴", rank: "Nuestro mercado",   tons: "60K ton/año", isCol: true },
};

// ── Proyección Mercator simple ─────────────────────────────────────
const W = 960, H = 500;
function project(lon, lat) {
  const x = (lon + 180) * (W / 360);
  const latR = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latR / 2));
  const y = H / 2 - (W * mercN) / (2 * Math.PI);
  return [x, y];
}
function ringToD(ring) {
  return ring
    .map((pt, i) => {
      const [x, y] = project(pt[0], pt[1]);
      return (i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1);
    })
    .join(" ") + "Z";
}
function featureToD(geom) {
  if (!geom) return "";
  const parts = [];
  if (geom.type === "Polygon") {
    geom.coordinates.forEach((r) => parts.push(ringToD(r)));
  } else if (geom.type === "MultiPolygon") {
    geom.coordinates.forEach((poly) => poly.forEach((r) => parts.push(ringToD(r))));
  }
  return parts.join(" ");
}

// ── Mapa mundial ───────────────────────────────────────────────────
function WorldMap() {
  const [countries, setCountries] = useState([]);
  const [tooltip, setTooltip] = useState(null);
  const [loading, setLoading] = useState(true);
  const svgRef = useRef(null);

  useEffect(() => {
    // Carga topojson-client desde CDN, luego world-atlas
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js";
    script.onload = () => {
      fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
        .then((r) => r.json())
        .then((world) => {
          /* global topojson */
          const features = topojson.feature(world, world.objects.countries).features;
          setCountries(
            features.map((f) => ({
              id: String(f.id).padStart(3, "0"),
              d: featureToD(f.geometry),
            }))
          );
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };
    script.onerror = () => setLoading(false);
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  const handleMouseMove = (id, e) => {
    const info = CACAO_INFO[id];
    if (info) setTooltip({ ...info, x: e.clientX, y: e.clientY });
  };
  const handleMouseLeave = () => setTooltip(null);

  return (
    <div style={{ position: "relative" }}>
      {/* SVG Map */}
      <div
        style={{
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(204,150,51,0.25)",
          background: "#e8f0eb",
          boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
        }}
      >
        {loading ? (
          <div
            style={{
              height: 420,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#8a7a68",
              fontFamily: "'Lato',sans-serif",
              fontSize: 14,
              gap: 10,
            }}
          >
            <svg style={{ animation: "spin 1s linear infinite" }} width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#CC9633" strokeWidth="3" strokeDasharray="40 20" />
            </svg>
            Cargando mapa…
          </div>
        ) : (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            style={{ width: "100%", height: "auto", display: "block" }}
          >
            {/* Océano */}
            <rect width={W} height={H} fill="#c8ddd0" />

            {countries.map(({ id, d }) => {
              const info = CACAO_INFO[id];
              const isCol = info?.isCol;
              const isCacao = !!info && !isCol;

              return (
                <path
                  key={id}
                  d={d}
                  fill={isCol ? "#2E6B45" : isCacao ? "#CC9633" : "#b8cfc0"}
                  stroke={isCol ? "#4CAF7D" : isCacao ? "#8B6820" : "#a0b8a8"}
                  strokeWidth={info ? 0.6 : 0.3}
                  style={{
                    cursor: info ? "pointer" : "default",
                    transition: "fill 0.15s",
                  }}
                  onMouseMove={info ? (e) => handleMouseMove(id, e) : undefined}
                  onMouseLeave={info ? handleMouseLeave : undefined}
                  onMouseEnter={
                    info
                      ? (e) => {
                          e.currentTarget.style.fill = isCol ? "#3d8a5c" : "#D4A853";
                        }
                      : undefined
                  }
                  onMouseOut={
                    info
                      ? (e) => {
                          e.currentTarget.style.fill = isCol ? "#2E6B45" : "#CC9633";
                        }
                      : undefined
                  }
                />
              );
            })}
          </svg>
        )}
      </div>

      {/* Leyenda */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          marginTop: 18,
          flexWrap: "wrap",
          fontFamily: "'Lato',sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 20, height: 14, borderRadius: 3, background: "#CC9633", border: "1px solid #8B6820" }} />
          <span style={{ color: "#5a4a3a", fontSize: 13 }}>Países productores de cacao</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 20, height: 14, borderRadius: 3, background: "#2E6B45", border: "1px solid #4CAF7D" }} />
          <span style={{ color: "#5a4a3a", fontSize: 13 }}>Colombia — nuestro mercado</span>
        </div>
        <span style={{ color: "#9a8878", fontSize: 12 }}>🖱 Pasa el cursor para ver detalles</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x + 14,
            top: tooltip.y - 14,
            zIndex: 9999,
            pointerEvents: "none",
            background: tooltip.isCol
              ? "linear-gradient(135deg,#1a3a28,#2E6B45)"
              : "linear-gradient(135deg,#3a2414,#5a3820)",
            border: `1px solid ${tooltip.isCol ? "rgba(76,175,125,0.5)" : "rgba(204,150,51,0.5)"}`,
            borderRadius: 12,
            padding: "12px 16px",
            minWidth: 180,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            fontFamily: "'Lato',sans-serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
            <span style={{ fontSize: 20 }}>{tooltip.flag}</span>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "'Playfair Display',serif" }}>
              {tooltip.name}
            </span>
          </div>
          <div style={{ color: tooltip.isCol ? "#4CAF7D" : "#CC9633", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
            {tooltip.rank}
          </div>
          <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>📦 {tooltip.tons}</div>
        </div>
      )}
    </div>
  );
}

// ── Hooks ──────────────────────────────────────────────────────────
function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handle);
    return () => window.removeEventListener("scroll", handle);
  }, []);
  return scrolled;
}

function useParallax() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handle = (e) => {
      setOffset({
        x: (e.clientX / window.innerWidth - 0.5) * 14,
        y: (e.clientY / window.innerHeight - 0.5) * 8,
      });
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);
  return offset;
}

function useCountUp(target, duration = 2200, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

function StatCard({ label, value, suffix, animate }) {
  const count = useCountUp(value, 2200, animate);
  return (
    <div className="flex flex-col items-center px-4 sm:px-8 py-5">
      <span className="font-serif sm:text-5xl font-bold leading-none text-[#D4A853]">
        {count.toLocaleString()}{suffix}
      </span>
      <span className="mt-1.5 text-[0.65rem] uppercase tracking-widest text-white/60 text-center">
        {label}
      </span>
    </div>
  );
}

const LEAVES = Array.from({ length: 7 }, (_, i) => ({
  id: i,
  size: 60 + i * 18,
  left: [8, 85, 20, 70, 45, 92, 35][i],
  top: [10, 20, 65, 50, 80, 70, 35][i],
  delay: i * 0.7,
  duration: 5 + i * 0.8,
  rotate: [-15, 30, -25, 20, -35, 15, -10][i],
}));

// ── Componente principal ───────────────────────────────────────────
export default function CacaoTech() {
  const scrolled = useScrolled();
  const parallax = useParallax();
  const [mounted, setMounted] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const statsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const authPage = () => navigate("/comenzar");

  return (
    <div className="w-full min-h-screen overflow-x-hidden" style={{ fontFamily: "'Lato', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Lato:wght@300;400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body, #root { margin: 0 !important; padding: 0 !important; width: 100%; max-width: 100vw; overflow-x: hidden; }
        .font-serif { font-family: 'Playfair Display', serif !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes floatLeaf {
          0%,100% { transform: translateY(0px) rotate(var(--r)); }
          33%     { transform: translateY(-16px) rotate(calc(var(--r) + 8deg)); }
          66%     { transform: translateY(8px) rotate(calc(var(--r) - 8deg)); }
        }
        @keyframes heroReveal {
          from { opacity: 0; transform: translateY(36px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes badgePulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(212,168,83,.4); }
          50%     { box-shadow: 0 0 0 10px rgba(212,168,83,0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes bgKen {
          0%,100% { transform: scale(1) translateX(0); }
          50%     { transform: scale(1.06) translateX(-1%); }
        }
        @keyframes droneFloat {
          0%,100% { transform: translateX(-50%) translateY(0); }
          25%     { transform: translateX(-50%) translateY(-10px); }
          75%     { transform: translateX(-50%) translateY(5px); }
        }
        @keyframes scrollBounce {
          0%,100% { transform: translateX(-50%) translateY(0); }
          50%     { transform: translateX(-50%) translateY(8px); }
        }
        @keyframes gradOrb {
          0%,100% { transform: scale(1) translate(0,0); opacity:.5; }
          50%     { transform: scale(1.2) translate(20px,-10px); opacity:.25; }
        }
        .nav-link {
          position: relative; color: rgba(255,255,255,.75);
          font-size: .875rem; letter-spacing: .05em;
          text-decoration: none; transition: color .25s;
        }
        .nav-link::after {
          content:''; position:absolute; bottom:-4px; left:0;
          width:0; height:1px; background:#D4A853; transition:width .3s;
        }
        .nav-link:hover { color: #D4A853; }
        .nav-link:hover::after { width: 100%; }
        .btn-primary {
          display:inline-flex; align-items:center; gap:.5rem;
          background:#2D6A4F; color:#fff; border:none;
          padding:.8rem 1.75rem; font-size:.875rem; font-weight:700;
          letter-spacing:.05em; border-radius:4px; cursor:pointer;
          transition: background .25s, transform .2s, box-shadow .25s;
          white-space: nowrap;
        }
        .btn-primary:hover {
          background:#2E6B45; transform:translateY(-2px);
          box-shadow:0 8px 24px rgba(45,106,79,.5);
        }
        .btn-ghost {
          display:inline-flex; align-items:center; gap:.5rem;
          background:transparent; color:rgba(255,255,255,.85);
          border:1px solid rgba(255,255,255,.3);
          padding:.8rem 1.75rem; font-size:.875rem; font-weight:400;
          letter-spacing:.05em; border-radius:4px; cursor:pointer;
          transition: border-color .25s, color .25s, transform .2s;
          white-space: nowrap;
        }
        .btn-ghost:hover { border-color:#D4A853; color:#D4A853; transform:translateY(-2px); }
        .feature-card {
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 8px; padding: 2rem;
          transition: border-color .3s, transform .3s, box-shadow .3s;
        }
        .feature-card:hover {
          border-color: rgba(212,168,83,.4);
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0,0,0,.4);
        }
        .shimmer-text {
          background: linear-gradient(90deg, #D4A853, #F0C96B, #D4A853);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .anim-1 { animation: heroReveal .9s ease .1s  both; }
        .anim-2 { animation: heroReveal .9s ease .3s  both; }
        .anim-3 { animation: heroReveal .9s ease .55s both; }
        .anim-4 { animation: heroReveal .9s ease .75s both; }
        .anim-badge { animation: badgePulse 3s ease-in-out infinite, heroReveal .8s ease .1s both; }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 p-2 flex items-center justify-between px-5 sm:px-10 lg:px-14 transition-all duration-300 ${scrolled ? "bg-[#55362E] backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.08)]" : "bg-transparent"}`}>
          {/* Logo */}
        <div
          className="flex items-center gap-3 px-4 h-16 shrink-0"
        >
          <img src={logoCultivaPreciso} alt="CultivaPreciso" className="w-10 h-10 rounded-full shrink-0 object-contain" />
          
            <span className= "text-white text-xl font-bold" >
              Cultiva<span className="text-[#CC9633] text-xl font-black">Preciso</span>
            </span>
          
        </div>
        <div className="hidden md:flex items-center gap-8 lg:gap-10">
          {NAV_LINKS.map((l) => <a key={l} href="#" className="nav-link">{l}</a>)}
        </div>
        <button className="btn-primary hidden md:inline-flex" onClick={authPage}>Comenzar</button>
      </nav>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-8 md:hidden transition-all duration-300 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        {NAV_LINKS.map((l) => (
          <a key={l} href="#" className="font-serif text-white text-2xl hover:text-[#D4A853] transition-colors" onClick={() => setMenuOpen(false)}>{l}</a>
        ))}
        <button className="btn-primary mt-4" onClick={() => setMenuOpen(false)}>Comenzar</button>
      </div>

      {/* ── HERO ── */}
      <section className="relative w-full h-screen overflow-hidden">
        <div className="absolute inset-0 overflow-hidden" style={{ animation: "bgKen 18s ease-in-out infinite", transformOrigin: "center" }}>
          <img
            src="https://blog.aepla.es/wp-content/uploads/2021/10/beneficios-agricultura-de-conservacion.jpeg"
            alt="Cultivo de cacao"
            className="w-full h-full object-cover"
            style={{ transform: `scale(1.05) translate(${parallax.x * 0.3}px, ${parallax.y * 0.15}px)`, transition: "transform 0.15s ease-out" }}
          />
        </div>
        <div className="absolute inset-0 bg-linear-to-br from-[#CC9633]/30 via-black/30 to-black/55" />
        <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
        <div className="absolute rounded-full pointer-events-none" style={{ width: "clamp(300px,50vw,600px)", height: "clamp(300px,50vw,600px)", top: "-80px", right: "-80px", background: "radial-gradient(circle, rgba(45,106,79,.25) 0%, transparent 70%)", animation: "gradOrb 8s ease-in-out infinite" }} />
        {LEAVES.map((leaf) => (
          <div key={leaf.id} className="absolute pointer-events-none" style={{ left: `${leaf.left}%`, top: `${leaf.top}%`, width: leaf.size, height: leaf.size, opacity: 0.08, zIndex: 2, "--r": `${leaf.rotate}deg`, animation: `floatLeaf ${leaf.duration}s ease-in-out ${leaf.delay}s infinite` }}>
            <svg viewBox="0 0 60 60" fill="none">
              <path d="M30 5 Q55 15 55 30 Q55 50 30 58 Q5 50 5 30 Q5 15 30 5Z" fill="#D4A853" />
              <path d="M30 5 L30 58" stroke="#2D6A4F" strokeWidth="2" />
              <path d="M30 20 Q42 25 45 35" stroke="#2D6A4F" strokeWidth="1.5" />
              <path d="M30 20 Q18 25 15 35" stroke="#2D6A4F" strokeWidth="1.5" />
            </svg>
          </div>
        ))}
        <div className="absolute z-10" style={{ bottom: "28%", left: "50%", opacity: mounted ? 0.55 : 0, transition: "opacity 1.5s ease 1.5s", animation: "droneFloat 6s ease-in-out infinite" }}>
          <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="6" fill="rgba(255,255,255,.15)" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" />
            {[[24,18,10,10],[24,18,38,10],[24,30,10,38],[24,30,38,38]].map(([x1,y1,x2,y2],i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,.3)" strokeWidth="1.5" />
            ))}
            {[[10,10],[38,10],[10,38],[38,38]].map(([cx,cy],i) => (
              <circle key={i} cx={cx} cy={cy} r="4" fill="rgba(212,168,83,.5)" stroke="#D4A853" strokeWidth="1.5" />
            ))}
          </svg>
        </div>
        <div className="relative z-10 h-full flex items-center justify-center text-center px-5">
          <div className="w-full">
            <div className="w-[50%]">
              <div className="flex justify-center">
                <div className="w-[45%] flex justify-center items-center rounded-full border border-[#D4A853]/40 bg-[#55362E]/70">
                  <span className="text-[0.80rem] py-0.5 font-bold tracking-[.18em] uppercase text-[#CC9633]">Agricultura de Precisión</span>
                </div>
              </div>
              <h1 className="font-serif font-black text-white leading-tight my-5 text-center text-6xl">
                Tecnología al <br /> servicio del <em className="shimmer-text not-italic">Cacao</em>
              </h1>
              <p className={`font-light text-white/65 leading-relaxed mb-9 ${mounted ? "anim-3" : "opacity-0"}`} style={{ fontSize: "clamp(.9rem, 1.8vw, 1.1rem)" }}>
                Optimiza tu producción con monitoreo inteligente, análisis de datos en tiempo real y recomendaciones basadas en inteligencia artificial.
              </p>
              <div className={`flex flex-wrap gap-3 justify-center ${mounted ? "anim-4" : "opacity-0"}`}>
                <button className="btn-primary">Explorar Servicios</button>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-7 left-1/2 z-10 opacity-50" style={{ animation: "scrollBounce 2s ease-in-out infinite" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12l7 7 7-7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </section>

      {/* ── SERVICIOS ── */}
      <div className="bg-[#F7F2E8]">
        <div className="flex justify-center py-8">
          <div className="flex-col">
            <div className="flex justify-center">
              <div className="w-[20%] flex justify-center items-center rounded-full border border-[#CC9633]/60 bg-[#CC9633]/20">
                <span className="text-[0.7rem] py-0.5 font-bold tracking-[.18em] uppercase text-[#CC9633]">Servicios</span>
              </div>
            </div>
            <h1 className="font-serif text-[#6E665F] leading-tight mt-5 text-center text-5xl">
              Soluciones para <em className="text-[#2E6B45]">tu cultivo</em>
            </h1>
          </div>
        </div>
        <div className="bg-[#F7F2E8] flex items-center justify-center p-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {[
              { title: "Monitoreo Satelital", desc: "Imágenes multiespectrales para evaluar la salud de tus cultivos de cacao desde el espacio.", icon: "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" },
              { title: "Sensores IoT", desc: "Medición en tiempo real de temperatura, humedad del suelo y condiciones ambientales.", icon: "M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" },
              { title: "Riego Inteligente", desc: "Sistemas automatizados de riego basados en las necesidades hídricas de cada zona.", icon: "M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" },
              { title: "Análisis de Datos", desc: "Dashboards interactivos con métricas clave para tomar decisiones informadas.", icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" },
              { title: "Detección de Plagas", desc: "Identificación temprana de enfermedades y plagas mediante visión artificial.", icon: "M12 12.75c1.148 0 2.278.08 3.383.237 1.037.146 1.866.966 1.866 2.013 0 3.728-2.35 6.75-5.25 6.75S6.75 18.728 6.75 15c0-1.046.83-1.867 1.866-2.013A24.204 24.204 0 0 1 12 12.75Zm0 0c2.883 0 5.647.508 8.207 1.44a23.91 23.91 0 0 1-1.152 6.06M12 12.75c-2.883 0-5.647.508-8.208 1.44.125 2.104.52 4.136 1.153 6.06M12 12.75a2.25 2.25 0 0 0 2.248-2.354M12 12.75a2.25 2.25 0 0 1-2.248-2.354M12 8.25c.995 0 1.971-.08 2.922-.236.403-.066.74-.358.795-.762a3.778 3.778 0 0 0-.399-2.25M12 8.25c-.995 0-1.97-.08-2.922-.236-.402-.066-.74-.358-.795-.762a3.734 3.734 0 0 1 .4-2.253M12 8.25a2.25 2.25 0 0 0-2.248 2.146M12 8.25a2.25 2.25 0 0 1 2.248 2.146" },
              { title: "Gestión de Cultivos", desc: "Planificación de siembra, fertilización y cosecha optimizada con IA.", icon: "M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" },
            ].map((card) => (
              <div key={card.title} className="relative bg-[#EDE3DF] rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                <div className="absolute top-5 right-5 text-[#9a9a8a]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#2E6B45]/30 flex items-center justify-center text-[#2E6B45] mb-6">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                  </svg>
                </div>
                <h3 className="text-[#1a1a14] font-semibold text-lg mb-2">{card.title}</h3>
                <p className="text-[#6b6b58] text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="bg-[#2E6B45] p-20">
        <div className="flex justify-center py-8">
          <div className="flex-col">
            <div className="flex justify-center">
              <div className="w-[20%] flex justify-center items-center rounded-full border border-[#CC9633]/60 bg-[#CC9633]/20">
                <span className="text-[0.7rem] py-0.5 font-bold tracking-[.18em] uppercase text-[#CC9633]">Impacto</span>
              </div>
            </div>
            <h1 className="font-serif text-white leading-tight mt-5 text-center text-5xl">
              Resultados que <em className="text-[#CC9633]">hablan</em>
            </h1>
            <div className="flex justify-center my-4">
              <p className="text-[#B8ADA0] w-[80%] text-center">
                Nuestros agricultores han experimentado mejoras significativas en sus cultivos de cacao.
              </p>
            </div>
          </div>
        </div>
        <div ref={statsRef} className="w-full flex flex-wrap items-center justify-center" style={{ borderColor: "rgba(212,168,83,.2)" }}>
          {STATS.map((s, i) => (
            <div key={s.label} className="flex items-center">
              <StatCard {...s} animate={statsVisible} />
              {i < STATS.length - 1 && <div className="hidden sm:block w-px h-10 bg-white/15" />}
            </div>
          ))}
        </div>
      </div>

      {/* ── MAPA MUNDIAL ── */}
      <div className="bg-[#F7F2E8] px-8 lg:px-16 py-20">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <div style={{
              display: "inline-flex", alignItems: "center",
              background: "rgba(204,150,51,0.15)",
              border: "1px solid rgba(204,150,51,0.4)",
              borderRadius: 999, padding: "4px 18px",
            }}>
              <span style={{ color: "#CC9633", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                Presencia mundial del cacao
              </span>
            </div>
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            color: "#3a2a1a",
            fontSize: "clamp(26px, 4vw, 42px)",
            fontWeight: 900, lineHeight: 1.2, margin: "0 0 12px",
          }}>
            Países productores de{" "}
            <em style={{ color: "#2E6B45", fontStyle: "italic" }}>Cacao</em>
          </h2>
          <p style={{ color: "#8a7a68", fontSize: 14, maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
            El cacao se cultiva en la franja tropical del planeta. Pasa el cursor sobre cada país para ver su producción.
          </p>
        </div>

        {/* Mapa */}
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <WorldMap />
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="w-full bg-[#422D1A] text-white px-10 py-20 pb-4">
        <div className="mx-auto flex flex-wrap gap-16">
          <div className="max-w-sm flex w-[50%]">
            <div>
              <div className="flex items-center gap-2 mb-5">
                <span className="text-xl font-semibold tracking-tight">
                  Cultiva<span className="text-[#CC9633]">Preciso</span>
                </span>
              </div>
              <p className="text-sm text-white/40 leading-relaxed mb-8">
                Transformando la agricultura del cacao con tecnología de precisión, inteligencia artificial y análisis de datos avanzado.
              </p>
              <div className="flex gap-3 mb-3">
                {[
                  { d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
                  { d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
                  { d: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" },
                ].map((icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#D4A853]/10 border border-white/10 hover:border-[#D4A853]/30 flex items-center justify-center transition-all duration-200">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white/50">
                      <path d={icon.d} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-16 w-[40%]">
            {[
              { label: "Producto", links: ["Monitoreo","Análisis","IoT","IA"] },
              { label: "Empresa",  links: ["Nosotros","Blog","Carreras","Prensa"] },
              { label: "Soporte",  links: ["Documentación","FAQ","Contacto","API"] },
            ].map((col) => (
              <div key={col.label} className="flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#CC9633] mb-2">{col.label}</span>
                {col.links.map((l) => (
                  <a key={l} href="#" className="text-sm text-white/45 hover:text-white transition-colors duration-200">{l}</a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/8 mt-10" />
        <div className="mx-auto mt-6 flex flex-wrap items-center justify-center gap-4">
          <span className="text-xs text-white/30">© 2026 CacaoTech. Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  );
}