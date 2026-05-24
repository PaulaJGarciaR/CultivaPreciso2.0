// src/components/dashboard/ViewWeather.jsx
import { useEffect, useState } from "react";
import {
  Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain,
  Snowflake, CloudSnow, CloudLightning, Thermometer,
  Droplets, Wind, Leaf, Scissors, Waves, AlertTriangle, RefreshCw,
} from "lucide-react";
import { SectionHeader } from "./shared";

// ─── Configuración ───────────────────────────────────────────────
const LAT    = 8.55;
const LON    = -73.15;
const REGION = "Catatumbo, Norte de Santander";

const DAYS_ES   = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MONTHS_ES = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];

// ─── WMO helpers ─────────────────────────────────────────────────
function WmoIcon({ code, size = 24, className = "" }) {
  const p = { size, strokeWidth: 1.5, className };
  if (code === 0)  return <Sun {...p} />;
  if (code <= 2)   return <CloudSun {...p} />;
  if (code === 3)  return <Cloud {...p} />;
  if (code <= 49)  return <CloudFog {...p} />;
  if (code <= 59)  return <CloudDrizzle {...p} />;
  if (code <= 69)  return <CloudRain {...p} />;
  if (code <= 79)  return <Snowflake {...p} />;
  if (code <= 84)  return <CloudSnow {...p} />;
  if (code <= 99)  return <CloudLightning {...p} />;
  return                  <Thermometer {...p} />;
}

function wmoDesc(code) {
  if (code === 0)  return "Despejado";
  if (code <= 2)   return "Parcialmente nublado";
  if (code === 3)  return "Nublado";
  if (code <= 49)  return "Niebla";
  if (code <= 59)  return "Llovizna";
  if (code <= 69)  return "Lluvia";
  if (code <= 79)  return "Nieve";
  if (code <= 84)  return "Chubascos";
  if (code <= 99)  return "Tormenta eléctrica";
  return "Variable";
}

// ─── Impacto agrícola ────────────────────────────────────────────
function buildImpacts(daily) {
  const totalRain = daily.precipitation_sum.reduce((a, b) => a + b, 0);
  const maxRain   = Math.max(...daily.precipitation_sum);
  const goodDays  = daily.precipitation_probability_max.filter(p => p < 30).length;
  const minTemp   = Math.min(...daily.temperature_2m_min);
  const maxTemp   = Math.max(...daily.temperature_2m_max);
  const highRisk  = maxRain > 15 || daily.precipitation_probability_max.some(p => p > 70);
  const tempOk    = minTemp >= 18 && maxTemp <= 32;

  return [
    {
      Icon: Leaf,
      iconBg:    highRisk ? "bg-red-500/10"      : "bg-[#2E6B45]/20",
      iconColor: highRisk ? "text-red-400"       : "text-[#4CAF7D]",
      title: "Riesgo de monilia",
      badge: highRisk ? "Alto" : "Bajo",
      badgeColor: highRisk ? "text-red-400 bg-red-500/15" : "text-[#4CAF7D] bg-[#2E6B45]/20",
      desc: highRisk
        ? "Alta humedad y probabilidad de lluvia favorecen la monilia. Aplicar fungicida preventivo antes de las precipitaciones."
        : "Condiciones secas reducen el riesgo de monilia. Mantener monitoreo preventivo en campo.",
    },
    {
      Icon: Scissors,
      iconBg:    goodDays >= 2 ? "bg-[#2E6B45]/20"   : "bg-amber-500/10",
      iconColor: goodDays >= 2 ? "text-[#4CAF7D]"    : "text-amber-400",
      title: "Días para labores de campo",
      badge: goodDays >= 2 ? "Óptimo" : "Limitado",
      badgeColor: goodDays >= 2 ? "text-[#4CAF7D] bg-[#2E6B45]/20" : "text-amber-400 bg-amber-500/15",
      desc: `${goodDays} día${goodDays !== 1 ? "s" : ""} con baja probabilidad de lluvia esta semana. ${
        goodDays >= 2 ? "Aprovechar para poda, fertilización y siembra." : "Planear labores en las ventanas secas disponibles."
      }`,
    },
    {
      Icon: Waves,
      iconBg: "bg-blue-500/10", iconColor: "text-blue-400",
      title: "Balance hídrico",
      badge: "Normal", badgeColor: "text-blue-400 bg-blue-400/15",
      desc: `Precipitación acumulada prevista: ${Math.round(totalRain)} mm en 7 días. ${
        maxRain > 20 ? "No regar en días con lluvia prevista." : "Verificar humedad del suelo periódicamente."
      }`,
    },
    {
      Icon: Thermometer,
      iconBg:    tempOk ? "bg-[#2E6B45]/20"   : "bg-amber-500/10",
      iconColor: tempOk ? "text-[#4CAF7D]"    : "text-amber-400",
      title: "Rango térmico",
      badge: tempOk ? "Óptimo" : "Atención",
      badgeColor: tempOk ? "text-[#4CAF7D] bg-[#2E6B45]/20" : "text-amber-400 bg-amber-500/15",
      desc: `${Math.round(minTemp)}–${Math.round(maxTemp)}°C proyectados esta semana. ${
        tempOk ? "Dentro del rango ideal para cacao (18–32°C)." : "Monitorear posible estrés térmico en el cultivo."
      }`,
    },
  ];
}

// ─── Sub-componentes ─────────────────────────────────────────────
function StatPill({ icon: Icon, value, label }) {
  return (
    <div
      className="flex flex-col items-center gap-1 rounded-lg p-2"
      style={{ background: "rgba(255,255,255,0.04)" }}
    >
      <Icon size={14} strokeWidth={1.5} className="text-white/40" />
      <span className="text-white font-semibold text-xs">{value}</span>
      <span className="text-white/30 text-[9px]">{label}</span>
    </div>
  );
}

function DayColumn({ day, wmoCode, max, min, rain, isToday }) {
  const rainColor = rain > 50 ? "#378ADD" : "rgba(55,138,221,0.3)";
  return (
    <div
      className="flex flex-col items-center gap-1.5 p-2 rounded-lg"
      style={{
        background: isToday ? "rgba(46,107,69,0.2)" : "rgba(255,255,255,0.03)",
        border: isToday ? "1px solid rgba(46,107,69,0.4)" : "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <p className="text-white/50 text-[10px] font-semibold">{day}</p>
      <WmoIcon code={wmoCode} size={18} className={isToday ? "text-[#4CAF7D]" : "text-white/50"} />
      <p className="text-white font-bold text-xs">{Math.round(max)}°</p>
      <p className="text-white/40 text-[10px]">{Math.round(min)}°</p>
      <div className="w-full rounded-full overflow-hidden" style={{ height: 3, background: "rgba(255,255,255,0.08)" }}>
        <div className="h-full rounded-full" style={{ width: `${rain}%`, background: rainColor }} />
      </div>
      <p className="text-blue-400 text-[9px]">{rain}%</p>
    </div>
  );
}

function ImpactCard({ Icon, iconBg, iconColor, title, badge, badgeColor, desc }) {
  return (
    <div
      className="flex gap-3 p-3 rounded-lg"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${iconBg}`}>
        <Icon size={16} strokeWidth={1.5} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="text-white text-sm font-semibold">{title}</p>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
        </div>
        <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────
export default function ViewWeather({ cultivo }) {
  // Estados: "idle" | "loading" | "success" | "error"
  const [status,  setStatus]  = useState("idle");
  const [weather, setWeather] = useState(null);
  const [errMsg,  setErrMsg]  = useState("");

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setStatus("loading");
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${LAT}&longitude=${LON}` +
          `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code` +
          `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code` +
          `&timezone=America%2FBogota&forecast_days=7`;

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        // Validar que la respuesta tenga la estructura esperada
        if (!data?.current || !data?.daily) throw new Error("Respuesta inesperada de la API");

        setWeather(data);
        setStatus("success");
      } catch (err) {
        if (err.name === "AbortError") return;
        setErrMsg(err.message || "Error desconocido");
        setStatus("error");
      }
    })();

    return () => controller.abort();
  }, []);

  const region = cultivo?.region
    ? `Condiciones climáticas — ${cultivo.region}`
    : `Condiciones climáticas — ${REGION}`;

  const now    = new Date();
  const nowStr = `${DAYS_ES[now.getDay()]} ${now.getDate()} ${MONTHS_ES[now.getMonth()]} · ${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;

  // ── Loading ──────────────────────────────────────────────────
  if (status === "idle" || status === "loading") {
    return (
      <div className="space-y-5">
        <SectionHeader title="Meteorología" sub={region} />
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <RefreshCw size={28} strokeWidth={1.5} className="text-[#4CAF7D] animate-spin" />
          <p className="text-white/30 text-sm">Consultando Open-Meteo…</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="space-y-5">
        <SectionHeader title="Meteorología" sub={region} />
        <div
          className="rounded-xl p-5 flex items-center gap-3"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          <AlertTriangle size={22} strokeWidth={1.5} className="text-red-400 shrink-0" />
          <div>
            <p className="text-red-400 font-semibold text-sm">
              No se pudo conectar con el servicio meteorológico
            </p>
            <p className="text-white/30 text-xs mt-0.5">{errMsg}</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Success — aquí weather está garantizado ──────────────────
  const cur     = weather.current;
  const daily   = weather.daily;
  const impacts = buildImpacts(daily);

  return (
    <div className="space-y-5">
      <SectionHeader title="Meteorología" sub={region} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Tarjeta actual */}
        <div
          className="stat-card rounded-xl p-6 flex flex-col justify-between"
          style={{ border: "1px solid rgba(46,107,69,0.3)" }}
        >
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-4">
              Ahora · {nowStr}
            </p>
            <div className="flex items-center gap-4 mb-6">
              <WmoIcon code={cur.weather_code} size={48} className="text-[#4CAF7D] shrink-0" />
              <div>
                <p className="font-serif text-white text-5xl font-bold leading-none">
                  {Math.round(cur.temperature_2m)}°
                </p>
                <p className="text-white/50 text-sm mt-1">{wmoDesc(cur.weather_code)}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatPill icon={Droplets}  value={`${Math.round(cur.relative_humidity_2m)}%`}  label="Humedad" />
            <StatPill icon={CloudRain} value={`${cur.precipitation} mm`}                   label="Precip." />
            <StatPill icon={Wind}      value={`${Math.round(cur.wind_speed_10m)} km/h`}    label="Viento" />
          </div>
        </div>

        {/* Pronóstico 7 días */}
        <div className="stat-card rounded-xl p-5 lg:col-span-2">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Pronóstico 7 días</p>
          <div className="grid grid-cols-7 gap-2">
            {daily.time.map((t, i) => {
              const dt    = new Date(t + "T12:00:00");
              const label = i === 0 ? "Hoy" : DAYS_ES[dt.getDay()];
              return (
                <DayColumn
                  key={t}
                  day={label}
                  wmoCode={daily.weather_code[i]}
                  max={daily.temperature_2m_max[i]}
                  min={daily.temperature_2m_min[i]}
                  rain={daily.precipitation_probability_max[i]}
                  isToday={i === 0}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Impacto en cultivo */}
      <div className="stat-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Leaf size={18} strokeWidth={1.5} className="text-[#4CAF7D]" />
          <h3 className="font-serif text-white text-lg">Impacto en el cultivo de cacao</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {impacts.map((item, i) => <ImpactCard key={i} {...item} />)}
        </div>
      </div>

      <p className="text-white/20 text-[10px] text-right">
        Datos: Open-Meteo · Lat {LAT}, Lon {LON} · {nowStr}
      </p>
    </div>
  );
}