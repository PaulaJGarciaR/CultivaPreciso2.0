import { SectionHeader } from "./shared";

const noticias = [
  {
    tipo: "Actualidad",
    titulo: "Agricultura de precisión para pequeños productores",
    texto: "El uso de sensores, registros digitales y alertas climáticas permite tomar decisiones más oportunas en riego, fertilización y sanidad del cultivo.",
    fecha: "Hoy",
    color: "#2E6B45",
  },
  {
    tipo: "Cacao",
    titulo: "Buenas prácticas para reducir pérdidas por enfermedades",
    texto: "La revisión semanal de mazorcas, poda sanitaria y retiro de material afectado ayudan a disminuir la presión de hongos en épocas húmedas.",
    fecha: "Esta semana",
    color: "#CC9633",
  },
  {
    tipo: "Clima",
    titulo: "Monitorear lluvia y humedad mejora la planificación",
    texto: "Registrar precipitación y humedad del suelo ayuda a programar labores como fertilización, poda y control fitosanitario en momentos más seguros.",
    fecha: "Recomendación",
    color: "#5B9BD5",
  },
];

const recursos = [
  "Guías de manejo integrado de enfermedades",
  "Recomendaciones de sensores e IoT agrícola",
  "Alertas y novedades para productores de cacao",
];

export default function ViewNoticias() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <SectionHeader
        title="Información y Noticias"
        sub="Novedades, recomendaciones y contenido útil para la toma de decisiones en tu cultivo."
      />

      <div
        className="rounded-3xl p-7 overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, rgba(46,107,69,0.16), rgba(204,150,51,0.10))",
          border: "1px solid rgba(46,107,69,0.18)",
        }}
      >
        <div className="max-w-2xl">
          <p className="text-[#2E6B45] text-xs font-bold uppercase tracking-widest mb-2">Centro de información</p>
          <h2 className="font-serif text-white text-3xl leading-tight">Noticias y aprendizaje para CultivaPreciso</h2>
          <p className="text-white/55 text-sm mt-3 leading-relaxed">
            Aquí encontrarás información relevante sobre cacao, agricultura de precisión, clima, sensores y buenas prácticas agrícolas.
          </p>
        </div>
        <div className="absolute right-6 bottom-4 text-7xl opacity-20">📰</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {noticias.map((item) => (
          <article key={item.titulo} className="stat-card rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ background: `${item.color}18`, color: item.color, border: `1px solid ${item.color}30` }}
              >
                {item.tipo}
              </span>
              <span className="text-white/35 text-xs">{item.fecha}</span>
            </div>
            <div>
              <h3 className="font-serif text-white text-lg leading-snug">{item.titulo}</h3>
              <p className="text-white/50 text-sm leading-relaxed mt-2">{item.texto}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="stat-card rounded-2xl p-5">
        <h3 className="font-serif text-white text-xl mb-4">Próximamente en esta sección</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recursos.map((recurso) => (
            <div key={recurso} className="rounded-xl p-4" style={{ background: "rgba(46,107,69,0.08)", border: "1px solid rgba(46,107,69,0.14)" }}>
              <p className="text-white/70 text-sm">{recurso}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
