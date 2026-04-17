// src/components/dashboard/shared.jsx
// ─── Componentes reutilizables compartidos entre todas las vistas del dashboard

export function StatCard({ label, value, unit, icon, sub, subUp }) {
  return (
    <div className="stat-card rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xl">{icon}</span>
        {sub && (
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
              ${subUp ? "bg-[#2E6B45]/20 text-[#4CAF7D]" : "bg-red-500/15 text-red-400"}`}
          >
            {sub}
          </span>
        )}
      </div>
      <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="font-serif text-white text-3xl font-bold">{value}</span>
        {unit && <span className="text-white/40 text-sm">{unit}</span>}
      </div>
    </div>
  );
}

export function RecCard({ priority, colorCls, title, desc }) {
  return (
    <div
      className="flex gap-3 p-3 rounded-lg"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
    >
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full h-fit shrink-0 ${colorCls}`}>
        {priority}
      </span>
      <div>
        <p className="text-white text-sm font-semibold leading-tight">{title}</p>
        <p className="text-white/40 text-xs leading-relaxed mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

export function SectionHeader({ title, sub }) {
  return (
    <div className="mb-6">
      <h2 className="font-serif text-white text-2xl">{title}</h2>
      {sub && <p className="text-white/40 text-sm mt-1">{sub}</p>}
    </div>
  );
}