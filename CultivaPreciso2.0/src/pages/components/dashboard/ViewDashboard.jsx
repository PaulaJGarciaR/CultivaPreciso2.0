// src/components/dashboard/ViewDashboard.jsx

import { StatCard, RecCard } from "./shared";

const HARVEST_MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const HARVEST_VALUES = [1.2,1.8,1.4,2.2,3.0,2.8,3.5,4.2,3.8,2.5,2.0,1.5];

export default function ViewDashboard({ cultivo, onGoTo }) {
  const maxH   = Math.max(...HARVEST_VALUES);
  const plantas = cultivo.hectareas
    ? Math.floor(parseFloat(cultivo.hectareas) * 10000 / 6)
    : 0;

  const aiRecs = cultivo.hectareas ? [
    {
      priority: "Alta", colorCls: "bg-red-500/15 text-red-400",
      title: "Preparación del terreno",
      desc: `Con ${cultivo.hectareas} ha y ${plantas.toLocaleString()} plantas previstas, inicie preparación de surcos 3 semanas antes de la siembra.`,
    },
    {
      priority: "Media", colorCls: "bg-[#CC9633]/15 text-[#CC9633]",
      title: "Plan de fertilización inicial",
      desc: `Aplique abono orgánico base a razón de 2 kg por hoyo antes de la siembra de las ${plantas.toLocaleString()} plantas.`,
    },
    {
      priority: "Baja", colorCls: "bg-[#2E6B45]/20 text-[#4CAF7D]",
      title: "Sombrío temporal",
      desc: "El cacao joven requiere 60-70% de sombra. Instale sombrío de plátano en las primeras 18 semanas.",
    },
  ] : [];

  return (
    <div className="space-y-5">

      {/* ── KPIs de siembra ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Hectáreas registradas"
          value={cultivo.hectareas || "—"}
          unit={cultivo.hectareas ? "ha" : ""}
          icon="🌿"
          sub={cultivo.hectareas ? "Activo" : "Sin datos"}
          subUp={!!cultivo.hectareas}
        />
        <StatCard
          label="Plantas estimadas"
          value={plantas ? plantas.toLocaleString() : "—"}
          unit={plantas ? "plantas" : ""}
          icon="🌱"
          sub={plantas ? "6 m² c/u" : "Registra datos"}
          subUp={!!plantas}
        />
        <StatCard
          label="Variedad"
          value={cultivo.variedad || "—"}
          icon="🍫"
          sub={cultivo.variedad ? "Registrada" : "Sin datos"}
          subUp={!!cultivo.variedad}
        />
        <StatCard
          label="Fecha de siembra"
          value={cultivo.fechaSiembra || "—"}
          icon="🗓"
          sub={cultivo.fechaSiembra ? "Programada" : "Sin datos"}
          subUp={!!cultivo.fechaSiembra}
        />
      </div>

      {/* ── Banner sin datos ── */}
      {!cultivo.hectareas && (
        <div
          className="stat-card rounded-xl p-5 flex items-center gap-4"
          style={{ border: "1px solid rgba(204,150,51,0.3)", background: "rgba(204,150,51,0.05)" }}
        >
          <span className="text-2xl">⚠️</span>
          <div className="flex-1">
            <p className="text-[#CC9633] font-semibold text-sm">No tienes datos de cultivo registrados</p>
            <p className="text-white/40 text-xs mt-0.5">
              Ingresa los datos de tu finca para ver estadísticas y recomendaciones personalizadas.
            </p>
          </div>
          <button
            onClick={() => onGoTo("cultivo")}
            className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#2E6B45] hover:bg-[#2E6B45]/80 transition-colors shrink-0"
          >
            Registrar cultivo →
          </button>
        </div>
      )}

      {/* ── Gráfico + Recomendaciones ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Barchart producción */}
        <div className="stat-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-white text-lg">Producción mensual estimada</h3>
            <span className="text-white/30 text-xs">t/ha</span>
          </div>
          <div className="flex items-end gap-1.5" style={{ height: 110 }}>
            {HARVEST_VALUES.map((val, i) => {
              const h    = (val / maxH) * 100;
              const peak = i === 7;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end" style={{ height: 90 }}>
                    <div
                      className="w-full rounded-t-sm"
                      style={{
                        height: `${h}%`, minHeight: 4,
                        background: peak ? "#CC9633" : "rgba(46,107,69,0.5)",
                      }}
                    />
                  </div>
                  <span className="text-white/30 text-[9px]">{HARVEST_MONTHS[i]}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "rgba(46,107,69,0.5)" }} />
              <span className="text-white/40 text-xs">Producción</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#CC9633]" />
              <span className="text-white/40 text-xs">Pico máximo</span>
            </div>
          </div>
        </div>

        {/* Recomendaciones IA */}
        <div className="stat-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[#CC9633]/15 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#CC9633" strokeWidth="2" className="w-4 h-4">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
              </svg>
            </div>
            <h3 className="font-serif text-white text-lg">Recomendaciones IA</h3>
          </div>

          {aiRecs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="text-3xl mb-3">🤖</span>
              <p className="text-white/40 text-sm">
                Registra los datos de tu cultivo para recibir recomendaciones personalizadas.
              </p>
              <button
                onClick={() => onGoTo("cultivo")}
                className="mt-3 text-[#CC9633] text-xs hover:underline"
              >
                Ir a Mi Cultivo →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {aiRecs.map((r, i) => <RecCard key={i} {...r} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}