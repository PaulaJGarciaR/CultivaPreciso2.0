import { useState } from "react";
import { SectionHeader } from "./shared";

// ─────────────────────────────────────────────
// NOTICIAS REALES CON ENLACES
// ─────────────────────────────────────────────
const NOTICIAS = {
  colombia: [
    {
      titulo: "Colombia avanza en el uso de drones para agricultura de precisión",
      texto: "El ICA y el MinAgricultura reglamentaron el uso de drones agrícolas en Colombia, abriendo paso a la fumigación y el monitoreo aéreo de cultivos en todo el país.",
      fuente: "Contexto Ganadero",
      fecha: "2024",
      url: "https://www.contextoganadero.com/agricultura/colombia-ya-tiene-reglamentacion-para-el-uso-de-drones-en-agricultura",
    },
    {
      titulo: "Fedecacao impulsa tecnología para productores de cacao",
      texto: "La Federación Nacional de Cacaoteros promueve herramientas digitales y asistencia técnica para mejorar la productividad de los cacaocultores colombianos.",
      fuente: "Fedecacao",
      fecha: "2024",
      url: "https://www.fedecacao.com.co",
    },
    {
      titulo: "FAO y Colombia trabajan en agricultura climáticamente inteligente",
      texto: "El programa de la FAO en Colombia apoya a pequeños productores con prácticas sostenibles y tecnología para adaptarse al cambio climático en cultivos de cacao y café.",
      fuente: "FAO Colombia",
      fecha: "2024",
      url: "https://www.fao.org/colombia/noticias/detail-events/es/c/1626735/",
    },
  ],
  mundo: [
    {
      titulo: "La inteligencia artificial transforma la agricultura global",
      texto: "Empresas tecnológicas y centros de investigación desarrollan modelos de IA que predicen rendimientos, detectan plagas y optimizan el uso de agua y fertilizantes.",
      fuente: "MIT Technology Review",
      fecha: "2024",
      url: "https://www.technologyreview.es/s/16441/la-ia-esta-transformando-la-agricultura",
    },
    {
      titulo: "Sensores e IoT revolucionan el campo en Europa y Asia",
      texto: "El uso masivo de sensores de suelo, estaciones meteorológicas y plataformas de datos en tiempo real permite a agricultores tomar decisiones precisas y reducir costos.",
      fuente: "AgFunder News",
      fecha: "2024",
      url: "https://agfundernews.com",
    },
    {
      titulo: "Imágenes satelitales permiten monitorear cultivos desde el espacio",
      texto: "Plataformas como Planet Labs y Sentinel ofrecen imágenes de alta resolución que agricultores de todo el mundo usan para detectar estrés hídrico y enfermedades foliares.",
      fuente: "FAO - Agricultura de Precisión",
      fecha: "2024",
      url: "https://www.fao.org/e-agriculture/es",
    },
  ],
  catatumbo: [
    {
      titulo: "Crisis humanitaria en el Catatumbo afecta a miles de familias campesinas",
      texto: "El conflicto armado en la región del Catatumbo en Norte de Santander desplazó a miles de familias productoras de cacao, café y panela a inicios de 2025.",
      fuente: "El Tiempo",
      fecha: "Ene 2025",
      url: "https://www.eltiempo.com/colombia/otras-ciudades/crisis-humanitaria-en-el-catatumbo-2025",
    },
    {
      titulo: "USAID apoya sustitución de cultivos ilícitos en el Catatumbo",
      texto: "El programa Alianzas para la Reconciliación de USAID entregó asistencia técnica y material vegetal a familias productoras de cacao en municipios del Catatumbo.",
      fuente: "USAID Colombia",
      fecha: "2024",
      url: "https://www.usaid.gov/es/colombia",
    },
    {
      titulo: "Catatumbo: cacao como alternativa productiva para el posconflicto",
      texto: "La Agencia de Renovación del Territorio (ART) adelanta proyectos productivos de cacao en el Catatumbo como parte de los Programas de Desarrollo con Enfoque Territorial.",
      fuente: "ART Colombia",
      fecha: "2024",
      url: "https://www.renovacionterritorio.gov.co",
    },
  ],
};

const CATEGORIAS = [
  { id: "colombia",  label: "Colombia",   color: "#2E6B45", emoji: "🇨🇴" },
  { id: "mundo",     label: "Mundo",      color: "#5B9BD5", emoji: "🌍" },
  { id: "catatumbo", label: "Catatumbo",  color: "#CC9633", emoji: "🌿" },
];

// ─────────────────────────────────────────────
// NOTICIA CARD
// ─────────────────────────────────────────────
function NoticiaCard({ noticia, color, tipo, emoji }) {
  return (
    <a
      href={noticia.url}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 cursor-pointer no-underline block"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${color}22`,
        textDecoration: "none",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = `1px solid ${color}55`;
        e.currentTarget.style.background = `${color}0a`;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = `1px solid ${color}22`;
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Badge + fecha */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span
          className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
          style={{
            background: `${color}18`,
            color,
            border: `1px solid ${color}30`,
          }}
        >
          {emoji} {tipo}
        </span>
        <span className="text-white/35 text-xs">{noticia.fecha}</span>
      </div>

      {/* Título */}
      <h3 className="font-serif text-white text-base leading-snug">
        {noticia.titulo}
      </h3>

      {/* Texto */}
      <p className="text-white/50 text-sm leading-relaxed flex-1">
        {noticia.texto}
      </p>

      {/* Fuente + ícono enlace */}
      <div
        className="flex items-center justify-between pt-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]" style={{ color: `${color}99` }}>📰</span>
          <span className="text-white/30 text-xs">{noticia.fuente}</span>
        </div>
        <span className="text-xs font-semibold" style={{ color }}>
          Leer →
        </span>
      </div>
    </a>
  );
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function ViewNoticias() {
  const [categoriaActiva, setCategoriaActiva] = useState("colombia");

  const catActiva = CATEGORIAS.find((c) => c.id === categoriaActiva);
  const noticiasActivas = NOTICIAS[categoriaActiva];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      <SectionHeader
        title="Información y Noticias"
        sub="Noticias reales sobre agricultura de precisión en Colombia, el mundo y la región del Catatumbo."
      />

      {/* ───────── HERO ───────── */}
      <div
        className="rounded-3xl p-7 overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, rgba(46,107,69,0.16), rgba(204,150,51,0.10))",
          border: "1px solid rgba(46,107,69,0.18)",
        }}
      >
        <div className="max-w-2xl">
          <p className="text-[#2E6B45] text-xs font-bold uppercase tracking-widest mb-2">
            Centro de información
          </p>
          <h2 className="font-serif text-white text-3xl leading-tight">
            Noticias y aprendizaje para CultivaPreciso
          </h2>
          <p className="text-white/55 text-sm mt-3 leading-relaxed">
            Haz clic en cualquier noticia para leer el artículo completo en la fuente original.
          </p>
        </div>
        <div className="absolute right-6 bottom-4 text-7xl opacity-20">📰</div>
      </div>

      {/* ───────── TABS ───────── */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoriaActiva(cat.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
            style={
              categoriaActiva === cat.id
                ? {
                    background: `${cat.color}22`,
                    border: `1px solid ${cat.color}55`,
                    color: cat.color,
                  }
                : {
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.45)",
                  }
            }
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* ───────── CARDS ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {noticiasActivas.map((noticia, i) => (
          <NoticiaCard
            key={i}
            noticia={noticia}
            color={catActiva.color}
            tipo={catActiva.label}
            emoji={catActiva.emoji}
          />
        ))}
      </div>

      {/* ───────── FOOTER ───────── */}
      <div
        className="rounded-2xl p-5 flex items-center gap-3"
        style={{
          background: "rgba(46,107,69,0.06)",
          border: "1px solid rgba(46,107,69,0.12)",
        }}
      >
        <span className="text-xl">🔗</span>
        <p className="text-white/40 text-xs leading-relaxed">
          Todas las noticias enlazan a sus fuentes originales. Haz clic en <strong className="text-white/50">Leer →</strong> para abrir el artículo completo en una nueva pestaña.
        </p>
      </div>

    </div>
  );
}