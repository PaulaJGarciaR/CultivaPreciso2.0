import { useState } from "react";
import { SectionHeader } from "./shared";

// ─────────────────────────────────────────────
// NOTICIAS REALES CON ENLACES
// ─────────────────────────────────────────────
const NOTICIAS = {
  colombia: [
    {
      titulo: "La hora del cacao",
      texto: "Ante un consumo de chocolate siempre en crecimiento, lo sucedido en los últimos años con los precios y la producción alrededor del mundo ilustra las extraordinarias oportunidades para Colombia en este sector.",
      fuente: "La Republica",
      fecha: "2026",
      url: "https://www.larepublica.co/analisis/louis-kleyn-4225994/la-hora-del-cacao-4401106",
    },
    {
      titulo: "Monitoreo de predios con agricultura de precisión en el cultivo de cacao",
      texto: "La tecnificación del campo ha puesto en las manos de los agricultores una amplia variedad de herramientas",
      fuente: "CEDAIT",
      fecha: "2021",
      url: "https://www.udea.edu.co/wps/wcm/connect/udea/c1bc93ee-4e52-4788-b1bd-c2102faaacba/Boleti%CC%81n_Monitoreo_predios_cacao.pdf?MOD=AJPERES&CVID=nGbnYXf",
    },
    {
      titulo: "Cacao por la vida: comunidades cambian cultivos de uso ilícito por esperanza en el Pacífico",
      texto: "En zonas rurales de Tumaco, familias apuestan por el cacao como alternativa económica y camino hacia la paz, dejando atrás economías ilegales y reconstruyendo su territorio.",
      fuente: "Radio Nacional de Colombia",
      fecha: "2024",
      url: "https://www.radionacional.co/emisoras-de-paz/cacao-por-la-vida-comunidades-cambian-cultivos-de-uso-ilicito-por-esperanza-en-el",
    },
  ],
  mundo: [
    {
      titulo: "Agricultura de precisión en Italia: innovación, casos prácticos y retos para el futuro",
      texto: "Italia se está convirtiendo en un punto de referencia en la Agricultura 4.0 , donde las tecnologías digitales y la sostenibilidad se entrelazan. El mercado alcanzó los 2500 millones de euros en 2023 , con una tasa de crecimiento anual del 19 %. No se trata de una tendencia aislada: a escala mundial, se espera que el sector crezca una media del 10,7 % anual hasta 2031.",
      fuente: "Ministerio de Agricultura de Italia",
      fecha: "2026",
      url: "https://opportunitaly.gov.it/es-ES/news-and-media/agriculture-precision-italy-innovation",
    },
    {
      titulo: "¿Cómo y por qué migrar de la agricultura tradicional a la agricultura de precisión?",
      texto: "Decenas de productores trabajan de manera más eficiente, mejorando la calidad de sus cultivos y bajando los costos en medio de la crisis económica, al trabajar en conjunto con un TCU de la Escuela de Ingeniería de Biosistemas",
      fuente: "Universidad de Costa Rica",
      fecha: "2022",
      url: "https://www.ucr.ac.cr/noticias/2022/7/11/como-y-por-que-migrar-de-la-agricultura-tradicional-a-la-agricultura-de-precision.html",
    },
    {
      titulo: "Drones, innovación y sostenibilidad: más de 240 productores fortalecen la agricultura de precisión en Ecuador con apoyo del PNUD",
      texto: "Más de 240 productores, productoras y técnicos agrícolas de distintas provincias del país fortalecieron sus capacidades técnicas y operativas para el uso seguro y normado de drones aplicados a la agricultura de precisión, contribuyendo a una producción más eficiente que cuida la salud de las personas y el ambiente.",
      fuente: "PNUD Ecuador",
      fecha: "2026",
      url: "https://www.undp.org/es/ecuador/noticias/drones-innovacion-y-sostenibilidad-mas-de-240-productores-fortalecen-la-agricultura-de-precision-en-ecuador-con-apoyo-del-pnud",
    },
  ],
  catatumbo: [
    {
      titulo: "Catatumbo: Gobierno nacional fortalece el sector agropecuario con inversión, tierras y apoyo financiero",
      texto: "En el marco del estado de conmoción interior decretado para la región del Catatumbo, el Gobierno nacional ha intensificado sus acciones de desarrollo para el sector agropecuario, enfocándose en brindar apoyo integral a las comunidades rurales, campesinas y étnicas.",
      fuente: "Radio Nacional del Colombia",
      fecha: "2025",
      url: "https://www.radionacional.co/noticias-colombia/catatumbo-apoyo-financiero-al-sector-agropecuario",
    },
    {
      titulo: "Cacao, Catatumbo, ciencia y paz",
      texto: "Ocaña, Norte de Santander. 03 de septiembre de 2025. En territorios como el Catatumbo, donde la historia reciente está marcada por el conflicto armado, el abandono estatal y las economías ilícitas, el cacao se ha convertido en mucho más que un cultivo. Hoy es símbolo de resistencia, memoria y dignidad para cientos de familias campesinas que, a través de este grano, han encontrado una alternativa productiva y sostenible.",
      fuente: "Agrosavia",
      fecha: "2025",
      url: "https://www.agrosavia.co/noticias/cacao-catatumbo-ciencia-y-paz",
    },
    {
      titulo: "Cacao el Corazón del Catatumbo, una senda de transformación del territorio",
      texto: "“Cacao el Corazón del Catatumbo”, es el nombre dado por las 300 familias participantes del proyecto que hoy deja aportes a la reactivación económica y productiva de la cadena de cacao en esta subregión de Colombia, integrando los enfoques étnico y de género como elementos clave para la transformación territorial. ",
      fuente: "FAO",
      fecha: "2024",
      url: "https://www.fao.org/colombia/noticias/detail-events/fr/c/1727520/",
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