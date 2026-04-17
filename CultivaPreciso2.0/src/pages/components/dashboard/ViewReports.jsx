// src/components/dashboard/ViewReports.jsx
import { SectionHeader } from "./shared";

export default function ViewReports({ cultivo }) {
  const ha      = parseFloat(cultivo.hectareas) || 0;
  const plantas = ha ? Math.floor(ha * 10000 / 6) : 0;
  const today   = new Date().toLocaleDateString("es-CO", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="space-y-5 max-w-3xl">
      <SectionHeader title="Reportes" sub="Resumen técnico de tu finca y cultivo de cacao." />

      {!cultivo.hectareas ? (
        <div className="stat-card rounded-xl p-10 text-center">
          <span className="text-3xl">📋</span>
          <p className="text-white/40 text-sm mt-3">
            Registra los datos de tu cultivo para generar el reporte.
          </p>
        </div>
      ) : (
        <div className="stat-card rounded-xl p-6 space-y-5">

          {/* Encabezado del reporte */}
          <div
            className="flex items-start justify-between pb-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div>
              <h3 className="font-serif text-white text-xl">{cultivo.nombre || "Mi Finca"}</h3>
              <p className="text-white/40 text-sm mt-0.5">Reporte técnico · {today}</p>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-bold text-[#4CAF7D] bg-[#2E6B45]/20">
              Activo
            </div>
          </div>

          {/* Tabla de datos */}
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Datos del cultivo</p>
            <div className="space-y-1.5">
              {[
                { label: "Área total",          value: `${cultivo.hectareas} hectáreas` },
                { label: "Variedad",            value:  cultivo.variedad    || "No especificada" },
                { label: "Región",              value:  cultivo.region      || "No especificada" },
                { label: "Fecha de siembra",    value:  cultivo.fechaSiembra|| "No definida"     },
                { label: "Plantas estimadas",   value:  plantas.toLocaleString() },
                { label: "Marco de plantación", value:  "3 m × 2 m (6 m² por planta)" },
                { label: "Hoyos a preparar",    value:  plantas.toLocaleString() },
                { label: "Abono orgánico req.", value: `${(plantas * 2).toLocaleString()} kg` },
              ].map(row => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-2 px-3 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <span className="text-white/50 text-sm">{row.label}</span>
                  <span className="text-white text-sm font-semibold">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Observaciones */}
          {cultivo.notas && (
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Observaciones</p>
              <div
                className="p-3 rounded-lg text-white/60 text-sm leading-relaxed"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                {cultivo.notas}
              </div>
            </div>
          )}

          <p
            className="text-white/20 text-xs pt-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            Generado por CultivaPreciso · {today}
          </p>
        </div>
      )}
    </div>
  );
}