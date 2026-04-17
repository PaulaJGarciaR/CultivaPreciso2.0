// src/components/dashboard/ViewWeather.jsx
import { SectionHeader } from "./shared";

const WEATHER_DAYS = [
  { day:"Lun", icon:"☀️",  max:29, min:18, rain:5,  humidity:62, wind:12 },
  { day:"Mar", icon:"⛅",  max:27, min:17, rain:25, humidity:74, wind:15 },
  { day:"Mié", icon:"🌧️", max:23, min:16, rain:80, humidity:88, wind:20 },
  { day:"Jue", icon:"🌦️", max:25, min:17, rain:40, humidity:78, wind:14 },
  { day:"Vie", icon:"⛅",  max:26, min:18, rain:20, humidity:70, wind:11 },
  { day:"Sáb", icon:"☀️",  max:30, min:19, rain:0,  humidity:58, wind:9  },
  { day:"Dom", icon:"☀️",  max:31, min:20, rain:5,  humidity:55, wind:8  },
];

export default function ViewWeather({ cultivo }) {
  const today = WEATHER_DAYS[0];
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Meteorología"
        sub={cultivo.region
          ? `Condiciones climáticas — ${cultivo.region}`
          : "Condiciones climáticas de tu zona"}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Hoy */}
        <div
          className="stat-card rounded-xl p-6 flex flex-col justify-between"
          style={{ border: "1px solid rgba(46,107,69,0.3)" }}
        >
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-3">
              Hoy — {new Date().toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long"})}
            </p>
            <div className="flex items-center gap-4">
              <span className="text-5xl">{today.icon}</span>
              <div>
                <p className="font-serif text-white text-5xl font-bold">{today.max}°</p>
                <p className="text-white/40 text-sm">Mín: {today.min}°C</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-5">
            {[
              { label:"Lluvia",  val:`${today.rain}%`,      ico:"💧" },
              { label:"Humedad", val:`${today.humidity}%`,  ico:"🌫️" },
              { label:"Viento",  val:`${today.wind} km/h`,  ico:"💨" },
            ].map(d => (
              <div key={d.label} className="rounded-lg p-2 text-center" style={{ background:"rgba(255,255,255,0.04)" }}>
                <p className="text-base mb-0.5">{d.ico}</p>
                <p className="text-white font-bold text-xs">{d.val}</p>
                <p className="text-white/30 text-[9px]">{d.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pronóstico 7 días */}
        <div className="stat-card rounded-xl p-5 lg:col-span-2">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Pronóstico 7 días</p>
          <div className="grid grid-cols-7 gap-2">
            {WEATHER_DAYS.map((d, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1.5 p-2 rounded-lg"
                style={{
                  background: i===0 ? "rgba(46,107,69,0.2)" : "rgba(255,255,255,0.03)",
                  border:     i===0 ? "1px solid rgba(46,107,69,0.3)" : "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <p className="text-white/50 text-[10px] font-semibold">{d.day}</p>
                <span className="text-xl">{d.icon}</span>
                <p className="text-white font-bold text-xs">{d.max}°</p>
                <p className="text-white/40 text-[10px]">{d.min}°</p>
                <div className="w-full rounded-full overflow-hidden" style={{ height:3, background:"rgba(255,255,255,0.08)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width:`${d.rain}%`, background: d.rain>50 ? "#378ADD" : "rgba(55,138,221,0.3)" }}
                  />
                </div>
                <p className="text-blue-400 text-[9px]">{d.rain}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Impacto en cultivo */}
      <div className="stat-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🌿</span>
          <h3 className="font-serif text-white text-lg">Impacto en el cultivo de cacao</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { ico:"🌧️", title:"Riesgo de monilia",          level:"Alto",   lc:"text-red-400 bg-red-500/15",
              desc:"Alta humedad el miércoles favorece la monilia. Aplicar fungicida preventivo el martes." },
            { ico:"☀️",  title:"Días favorables para labores", level:"Óptimo", lc:"text-[#4CAF7D] bg-[#2E6B45]/20",
              desc:"Sábado y domingo ideales para poda, fertilización y siembra de nuevas plantas." },
            { ico:"💧", title:"Balance hídrico",             level:"Normal", lc:"text-blue-400 bg-blue-400/15",
              desc:"Lluvia del miércoles suple necesidades hídricas. No regar martes-jueves." },
            { ico:"🌡️", title:"Rango térmico",              level:"Óptimo", lc:"text-[#4CAF7D] bg-[#2E6B45]/20",
              desc:"23-31°C dentro del rango ideal (18-32°C). Sin estrés térmico previsto." },
          ].map((a, i) => (
            <div
              key={i}
              className="flex gap-3 p-3 rounded-lg"
              style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.05)" }}
            >
              <span className="text-xl shrink-0">{a.ico}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-white text-sm font-semibold">{a.title}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.lc}`}>{a.level}</span>
                </div>
                <p className="text-white/40 text-xs leading-relaxed">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}