import { useState } from "react";

const enfermedades = [
  {
    id: "moniliasis",
    nombre: "Moniliasis",
    agente: "Moniliophthera roreri",
    imagenUrl: "https://croplifela.org/images/ES/articulos/102/foto-cacao3.png",
    descripcion:
      "El hongo infecta la fruta en todas las fases de su desarrollo. Los síntomas varían según la edad del fruto: desde maduración temprana anormal hasta frutos deformados y manchas grasientas. A medida que avanza la infección, aparece un tejido ampolloso blanco que se vuelve gris por las esporas dispersadas por el viento. Los daños provocan la momificación de la fruta, que puede durar hasta 9 meses.",
    control:
      "Recojo y entierro de frutos afectados desde los primeros indicios para reducir la fuente de inóculo. Evaluación semanal obligatoria (un fruto infectado puede contagiar otros 20 en promedio). Se recomienda Triadimefon, Tebuconazol y Prochloraz; lo ideal es aplicarlos cuando el fruto tenga entre 30 y 90 días, etapa de máxima sensibilidad.",
    color: "#CC9633",
    badge: "Hongo",
  },
  {
    id: "escoba",
    nombre: "Escoba de Bruja",
    agente: "Crinipellis perniciosa",
    imagenUrl: "https://agrolink.ec/wp-content/uploads/2025/07/Image_29-scaled.jpeg",
    descripcion:
      "Ocasiona una brotación anormal en yemas terminales y axilares, con concentración de ramas a partir de un solo punto. En los cojines florales las flores quedan adheridas más tiempo de lo normal, engrosan su pedicelo y el ovario se desarrolla sin ser fecundado, generando los frutos llamados «chirimoyos».",
    control:
      "Retiro y entierro de todo material afectado para evitar formación de esporas. Poda de ventilación, control de malezas y distanciamiento adecuado para evitar microclimas húmedos. Aplicar oxicloruro de cobre o caldo bordalés desde 1 mes después de la floración hasta los tres meses.",
    color: "#4CAF7D",
    badge: "Hongo",
  },
  {
    id: "pudricion",
    nombre: "Pudrición Parda de la Mazorca",
    agente: "Phytophthora sp.",
    imagenUrl: "https://www.agrosavia.co/media/fkcpo3ku/leonora-rodr%C3%ADguez-polanco-20.jpg",
    descripcion:
      "El síntoma inicial es una mancha circular parda con consistencia acuosa que va agrandándose hasta abarcar todo el fruto. A nivel del tronco produce chancros circulares que en estado avanzado exudan un fluido rojizo a través de las grietas de la corteza.",
    control:
      "Identificar la época de mayor concentración de frutos susceptibles (menores de 3 meses) y planificar aplicaciones. Usar fungicidas a base de cobre como oxicloruro de cobre o caldo bordalés. Incluir siempre un adherente agrícola para mejorar la cobertura.",
    color: "#E07B4F",
    badge: "Oomiceto",
  },
  {
    id: "machete",
    nombre: "Mal de Machete",
    agente: "Ceratocystis fimbriata",
    imagenUrl: "https://croplifela.org/images/ES/plagas/arbol-cacao-seco.jpg",
    descripcion:
      "El daño ocurre en tronco y ramas, y puede causar la muerte del árbol completo o de la rama afectada. El hongo ingresa principalmente a través de heridas provocadas por herramientas contaminadas, de ahí su nombre popular.",
    control:
      "Retirar y quemar las plantas enfermas. Desinfectar el suelo con cal agrícola, oxicloruro de cobre o guano fresco. Esperar 3 meses antes de resembrar para que la insolación elimine el inóculo del suelo.",
    color: "#9B6B9B",
    badge: "Hongo",
  },
  {
    id: "rosellinia",
    nombre: "Rosellinia",
    agente: "Rosellinia sp.",
    imagenUrl: "https://scielo.iics.una.py/img/revistas/ia/v18n2//2305-0683-ia-18-02-00077-gf2.jpg",
    descripcion:
      "Conocida como llaga estrellada o podredumbre negra de la raíz. Afecta inicialmente el sistema radical y luego el cuello del tallo hasta causar la muerte. Los síntomas incluyen amarillamiento, clorosis, marchitamiento, defoliación progresiva, secamiento de ramas y finalmente la muerte.",
    control:
      "Fungicidas recomendados: quintozeno, tiofanato metílico, fluazinam y benomilo. La eficacia varía según la cepa: en cepas de Villa Guerrero el quintozeno fue efectivo; para Coatepec Harinas, tiofanato metílico y fluazinam inhibieron completamente el crecimiento micelial.",
    color: "#5B9BD5",
    badge: "Hongo",
  },
];

function EnfermedadCard({ enfermedad, isDark }) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const textPrimary = isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.82)";
  const textSecondary = isDark ? "rgba(255,255,255,0.58)" : "rgba(0,0,0,0.55)";
  const textMuted = isDark ? "rgba(255,255,255,0.32)" : "rgba(0,0,0,0.35)";
  const cardBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.09)";
  const dividerColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const chevronBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-400"
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        boxShadow: expanded ? `0 8px 32px ${enfermedad.color}18` : "none",
      }}
    >
      {/* ── Header (siempre visible) ── */}
      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-1.5 h-10 rounded-full shrink-0"
            style={{ background: enfermedad.color, opacity: expanded ? 1 : 0.45 }}
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2
                className="text-base font-bold"
                style={{ fontFamily: "'Playfair Display', serif", color: textPrimary }}
              >
                {enfermedad.nombre}
              </h2>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: `${enfermedad.color}18`,
                  color: enfermedad.color,
                  border: `1px solid ${enfermedad.color}35`,
                }}
              >
                {enfermedad.badge}
              </span>
            </div>
            <p className="text-xs italic mt-0.5" style={{ color: textMuted }}>
              {enfermedad.agente}
            </p>
          </div>
        </div>

        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300"
          style={{
            background: expanded ? `${enfermedad.color}20` : chevronBg,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            className="w-4 h-4"
            stroke={expanded ? enfermedad.color : textMuted}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* ── Preview colapsado ── */}
      {!expanded && (
        <div className="flex items-center gap-4 px-6 pb-4">
          {!imgError ? (
            <img
              src={enfermedad.imagenUrl}
              alt={enfermedad.nombre}
              className="w-14 h-14 object-cover rounded-xl shrink-0"
              style={{ border: `1px solid ${cardBorder}` }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center"
              style={{
                background: `${enfermedad.color}10`,
                border: `1px solid ${enfermedad.color}25`,
              }}
            >
              <span style={{ color: enfermedad.color, fontSize: 22 }}>🍫</span>
            </div>
          )}
          <p className="text-xs leading-relaxed" style={{ color: textMuted }}>
            {enfermedad.descripcion.substring(0, 120)}…
          </p>
        </div>
      )}

      {/* ── Expandido ── */}
      {expanded && (
        <div
          className="pb-6"
          style={{
            borderTop: `1px solid ${dividerColor}`,
            animation: "fadeSlide 0.3s ease forwards",
          }}
        >
          <div className="flex gap-0 mt-0 flex-wrap lg:flex-nowrap">

            {/* ── IMAGEN (columna izquierda) ── */}
            <div
              className="shrink-0 flex flex-col items-center justify-start gap-2 p-5"
              style={{
                width: "200px",
                minWidth: "200px",
                borderRight: `1px solid ${dividerColor}`,
              }}
            >
              {!imgError ? (
                <img
                  src={enfermedad.imagenUrl}
                  alt={enfermedad.nombre}
                  className="w-full object-cover rounded-xl"
                  style={{
                    height: "160px",
                    border: `1px solid ${enfermedad.color}35`,
                    boxShadow: `0 4px 24px ${enfermedad.color}20`,
                  }}
                  onError={() => setImgError(true)}
                />
              ) : (
                <div
                  className="w-full rounded-xl flex items-center justify-center"
                  style={{
                    height: "160px",
                    background: `${enfermedad.color}10`,
                    border: `1px solid ${enfermedad.color}25`,
                  }}
                >
                  <div className="text-center">
                    <span style={{ fontSize: 36 }}>🍫</span>
                    <p className="text-xs mt-1" style={{ color: textMuted }}>
                      Imagen no disponible
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── CONTENIDO (columna derecha) ── */}
            <div className="flex-1 flex flex-col gap-4 min-w-0 px-6 pt-5 pb-1">
              {/* Descripción */}
              <div>
                <p
                  className="text-xs uppercase tracking-widest font-bold mb-1.5"
                  style={{ color: enfermedad.color }}
                >
                  Descripción
                </p>
                <p className="text-sm leading-relaxed" style={{ color: textSecondary }}>
                  {enfermedad.descripcion}
                </p>
              </div>

              {/* Control */}
              <div
                className="rounded-xl p-4"
                style={{
                  background: `${enfermedad.color}09`,
                  border: `1px solid ${enfermedad.color}22`,
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: enfermedad.color }}
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                  </svg>
                  <p
                    className="text-xs uppercase tracking-widest font-bold"
                    style={{ color: enfermedad.color }}
                  >
                    Control
                  </p>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: textSecondary }}>
                  {enfermedad.control}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ViewEnfermedades({ isDark = true }) {
  const textPrimary = isDark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.82)";
  const textMuted = isDark ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.40)";
  const noticeBg = isDark ? "rgba(204,150,51,0.07)" : "rgba(204,150,51,0.08)";
  const noticeBorder = isDark ? "rgba(204,150,51,0.18)" : "rgba(204,150,51,0.28)";

  return (
    <div className="max-w-4xl mx-auto">
      <style>{`
        @keyframes fadeSlide {
          from { opacity:0; transform:translateY(-6px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>

      {/* ── Hero banner ── */}
      <div
        className="relative rounded-2xl overflow-hidden mb-8"
        style={{ height: "200px" }}
      >
        <img
          src="/enfermedades/cacao/monilia.jpg"
          alt="banner cacao"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: isDark ? "brightness(0.22) saturate(0.5)" : "brightness(0.55) saturate(0.6)" }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? "linear-gradient(135deg, rgba(13,38,1,0.88) 0%, rgba(26,17,13,0.75) 100%)"
              : "linear-gradient(135deg, rgba(20,60,10,0.72) 0%, rgba(50,35,10,0.60) 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-8"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(76,175,125,0.35) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative z-10 flex flex-col justify-center h-full px-8">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-1 h-5 rounded-full bg-[#4CAF7D]" />
            <span
              className="text-xs uppercase tracking-widest font-bold"
              style={{ color: "#4CAF7D" }}
            >
              Fitosanidad · Cacao
            </span>
          </div>
          <h1
            className="text-3xl font-bold text-white"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Enfermedades del Cultivo
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.42)" }}>
            Identificación, síntomas y manejo integrado
          </p>
          <div className="flex gap-5 mt-4">
            {[
              { v: "5", l: "Enfermedades" },
              { v: "5", l: "Patógenos" },
              { v: "IA", l: "Diagnóstico disponible" },
            ].map((s) => (
              <div key={s.l} className="flex items-center gap-1.5">
                <span className="text-sm font-bold" style={{ color: "#CC9633" }}>{s.v}</span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.32)" }}>{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Aviso chat flotante */}
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5"
        style={{ background: noticeBg, border: `1px solid ${noticeBorder}` }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#CC9633"
          strokeWidth="2"
          className="w-4 h-4 shrink-0"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <p className="text-xs" style={{ color: textMuted }}>
          ¿Ves síntomas en tu cultivo? Usa el{" "}
          <span style={{ color: "#CC9633" }}>botón de chat</span> en la esquina
          inferior derecha para subir una foto y obtener una opinión preliminar
          de la IA.
        </p>
      </div>

      {/* Tarjetas */}
      <div className="space-y-3">
        {enfermedades.map((e) => (
          <EnfermedadCard key={e.id} enfermedad={e} isDark={isDark} />
        ))}
      </div>
    </div>
  );
}