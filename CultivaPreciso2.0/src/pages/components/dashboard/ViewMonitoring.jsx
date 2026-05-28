// src/components/dashboard/ViewMonitoring.jsx
import { SectionHeader } from "./shared";
import ViewCalculadoraSensores from "./ViewCalculadoraSensores";

export default function ViewMonitoring() {
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Monitoreo IoT"
        sub="Sistema de sensores en tiempo real — disponible próximamente."
      />
      <div
        className="stat-card rounded-xl p-12 flex flex-col items-center text-center"
        style={{ border: "1px dashed rgba(46,107,69,0.22)" }}
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
              style={{ border: "1px solid rgba(46,107,69,0.16)" }}
            >
              {s}
            </div>
          ))}
        </div>
        <p className="text-[#CC9633]/70 text-xs mt-6">Módulo disponible próximamente</p>
      </div>

      <div
        className="rounded-2xl p-5"
        style={{
          background: "linear-gradient(135deg, rgba(46,107,69,0.10), rgba(204,150,51,0.08))",
          border: "1px solid rgba(46,107,69,0.18)",
        }}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-[#2E6B45] text-xs font-bold uppercase tracking-widest">Prueba beta</p>
            <h3 className="font-serif text-white text-xl mt-1">Calculadora manual de datos de sensores</h3>
            <p className="text-white/50 text-sm mt-1">
              Ingresa lecturas de sensores o mediciones tomadas en campo para estimar el estado del suelo.
            </p>
          </div>
          <div className="hidden sm:flex w-12 h-12 rounded-2xl items-center justify-center" style={{ background: "rgba(46,107,69,0.12)" }}>
            <span className="text-2xl">🧮</span>
          </div>
        </div>
        <ViewCalculadoraSensores />
      </div>
    </div>
  );
}
