// src/components/dashboard/ViewMonitoring.jsx
import { SectionHeader } from "./shared";

export default function ViewMonitoring() {
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Monitoreo IoT"
        sub="Sistema de sensores en tiempo real — disponible próximamente."
      />
      <div
        className="stat-card rounded-xl p-12 flex flex-col items-center text-center"
        style={{ border: "1px dashed rgba(255,255,255,0.1)" }}
      >
        <div className="w-16 h-16 rounded-full bg-[#2E6B45]/10 flex items-center justify-center mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="#2E6B45" strokeWidth="1.5" className="w-8 h-8">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <h3 className="font-serif text-white text-xl mb-2">Sensores IoT en campo</h3>
        <p className="text-white/40 text-sm max-w-md mb-6">
          Esta sección mostrará datos en tiempo real de temperatura, humedad del suelo
          y condiciones ambientales una vez instales los sensores en tu finca.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {["Temperatura","Humedad suelo","pH","Luminosidad","CO₂","Precipitación"].map(s => (
            <div
              key={s}
              className="px-3 py-1.5 rounded-full text-xs text-white/30"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {s}
            </div>
          ))}
        </div>
        <p className="text-[#CC9633]/50 text-xs mt-6">Módulo disponible próximamente</p>
      </div>
    </div>
  );
}