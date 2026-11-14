// src/components/dashboard/ViewDashboard.jsx

import { useEffect, useState } from "react";
import { StatCard, RecCard } from "./shared";

const MONTHS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export default function ViewDashboard({ cultivo, onGoTo }) {
  // ─────────────────────────────────────────────
  // STATES
  // ─────────────────────────────────────────────
  const [harvestValues, setHarvestValues] = useState([
    1.2, 1.8, 1.4, 2.2, 3.0, 2.8, 3.5, 4.2, 3.8, 2.5, 2.0, 1.5,
  ]);

  const [aiRecs, setAiRecs] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);

  // ─────────────────────────────────────────────
  // DATOS CULTIVO
  // ─────────────────────────────────────────────
  const plantas = cultivo.hectareas
    ? Math.floor((parseFloat(cultivo.hectareas) * 10000) / 6)
    : 0;

  const maxH = Math.max(...harvestValues);

  // ─────────────────────────────────────────────
  // GRÁFICA DINÁMICA
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!cultivo?.hectareas) return;

    const hectareas = parseFloat(cultivo.hectareas || 1);

    let base = hectareas * 0.35;

    if (cultivo.variedad?.toLowerCase().includes("ccn")) {
      base *= 1.25;
    }

    if (cultivo.variedad?.toLowerCase().includes("criollo")) {
      base *= 0.9;
    }

    const generated = MONTHS.map((_, i) => {
      const seasonal = Math.sin((i / 12) * Math.PI * 2 - 1.5) * 0.9 + 1.4;

      const randomVariation = Math.random() * 0.4;

      return Number((base * seasonal + randomVariation).toFixed(1));
    });

    setHarvestValues(generated);
  }, [cultivo]);

  // ─────────────────────────────────────────────
  // IA RECOMENDACIONES — refresca cada 2 minutos
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!cultivo?.hectareas) return;

    generateRecommendations();

    const interval = setInterval(
      () => {
        generateRecommendations();
      },
      1 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [cultivo]);

  // ─────────────────────────────────────────────
  // GEMINI IA
  // ─────────────────────────────────────────────
  const generateRecommendations = async () => {
    try {
      setLoadingAI(true);

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      console.log("API KEY:", apiKey);

      if (!apiKey) {
        throw new Error("No existe API KEY");
      }

      const prompt = `
Eres un ingeniero agrónomo especializado en cacao.

Genera EXACTAMENTE 3 recomendaciones agrícolas inteligentes y técnicas.

DATOS:
- Hectáreas: ${cultivo.hectareas}
- Variedad: ${cultivo.variedad}
- Región: ${cultivo.region}
- Fecha de siembra: ${cultivo.fechaSiembra}
- Plantas estimadas: ${plantas}

RESPONDE SOLO EN JSON.

Formato:
[
  {
    "priority":"Alta",
    "title":"Título",
    "desc":"Descripción"
  }
]
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],

            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 300,
            },
          }),
        },
      );

      const data = await response.json();

      console.log("RESPUESTA GEMINI:", data);

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("Gemini no devolvió texto");
      }

      // ─────────────────────────────────────────
      // LIMPIAR JSON
      // ─────────────────────────────────────────
      const cleaned = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      let parsed;

      try {
        parsed = JSON.parse(cleaned);
      } catch (err) {
        console.error("ERROR PARSE:", cleaned);

        parsed = [
          {
            priority: "Alta",
            title: "Monitoreo fitosanitario",
            desc: "Realiza inspecciones semanales para detectar enfermedades tempranas.",
          },
          {
            priority: "Media",
            title: "Control de humedad",
            desc: "Mantén drenajes limpios para evitar hongos.",
          },
          {
            priority: "Baja",
            title: "Sensores ambientales",
            desc: "Integra sensores IoT para monitorear temperatura y humedad.",
          },
        ];
      }

      // ─────────────────────────────────────────
      // MAPEAR
      // ─────────────────────────────────────────
      const mapped = parsed.map((r) => ({
        priority: r.priority || "Media",

        title: r.title || "Recomendación",

        desc: r.desc || "Sin descripción",

        colorCls:
          r.priority === "Alta"
            ? "bg-red-500/15 text-red-400"
            : r.priority === "Media"
              ? "bg-[#CC9633]/15 text-[#CC9633]"
              : "bg-[#2E6B45]/20 text-[#4CAF7D]",
      }));

      setAiRecs(mapped);
    } catch (error) {
      console.error("ERROR IA:", error);

      setAiRecs([
        {
          priority: "Alta",
          colorCls: "bg-red-500/15 text-red-400",
          title: "Monitoreo fitosanitario",
          desc: "Realiza inspecciones semanales para detectar enfermedades tempranas.",
        },

        {
          priority: "Media",
          colorCls: "bg-[#CC9633]/15 text-[#CC9633]",
          title: "Control de humedad",
          desc: "Mantén drenajes limpios para evitar exceso de humedad.",
        },

        {
          priority: "Baja",
          colorCls: "bg-[#2E6B45]/20 text-[#4CAF7D]",
          title: "Sensores ambientales",
          desc: "Integra sensores para monitorear variables del cultivo.",
        },
      ]);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* ───────────────── KPIS ───────────────── */}
      <div className="grid grid-cols-4 lg:grid-cols-4 gap-4 auto-rows-[160px]">
        <StatCard
          label="Hectáreas registradas"
          value={cultivo.hectareas || "—"}
          unit={cultivo.hectareas ? "ha" : ""}
          icon={
            <svg
              className="w-10 h-10 bg-[#2E6B45]/70 rounded-xl text-amber-50 p-1.5"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z" />
              <path d="M7 16v6" />
              <path d="M13 19v3" />
              <path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5" />
            </svg>
          }
          sub={cultivo.hectareas ? "Activo" : "Sin datos"}
          subUp={!!cultivo.hectareas}
        />

        <StatCard
          label="Plantas estimadas"
          value={plantas ? plantas.toLocaleString() : "—"}
          unit={plantas ? "plantas" : ""}
          icon={
            <svg
              className="w-10 h-10 bg-[#2E6B45]/70 rounded-xl text-amber-50 p-1.5"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 20a10 10 0 0010-10 25.9 25.9 0 00-1.04-7.281 1 1 0 00-1.755-.325C15.833 5.5 13 5.5 9.8 6.1A7 7 0 0011 20" />
              <path d="M2 21a5 5 0 012.911-4.544C7.613 15.212 8.351 15.24 11 13" />
            </svg>
          }
          sub={plantas ? "6 m² c/u" : "Registra datos"}
          subUp={!!plantas}
        />

        <StatCard
          label="Variedad"
          value={cultivo.variedad || "—"}
          icon={
            <svg
            className="w-10 h-10 bg-[#2E6B45]/70 rounded-xl text-amber-50 p-1.5"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3" />
              <path d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4" />
              <path d="M5 21h14" />
            </svg>
          }
          sub={cultivo.variedad ? "Registrada" : "Sin datos"}
          subUp={!!cultivo.variedad}
        />

        <StatCard
          label="Fecha de siembra"
          value={cultivo.fechaSiembra || "—"}
          icon={
            <svg
              className="w-10 h-10 bg-[#2E6B45]/70 rounded-xl text-amber-50 p-1.5"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M8 2v3" />
              <path d="M16 2v3" />
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18" />
              <path d="M8 13h.01" />
              <path d="M12 13h.01" />
              <path d="M16 13h.01" />
              <path d="M8 17h.01" />
              <path d="M12 17h.01" />
              <path d="M16 17h.01" />
            </svg>
          }
          sub={cultivo.fechaSiembra ? "Programada" : "Sin datos"}
          subUp={!!cultivo.fechaSiembra}
        />
      </div>

      {/* ───────────────── SIN DATOS ───────────────── */}
      {!cultivo.hectareas && (
        <div
          className="stat-card rounded-xl p-5 flex items-center gap-4"
          style={{
            border: "1px solid rgba(204,150,51,0.3)",
            background: "rgba(204,150,51,0.05)",
          }}
        >
          <span className="text-2xl">⚠️</span>

          <div className="flex-1">
            <p className="text-[#CC9633] font-semibold text-sm">
              No tienes datos de cultivo registrados
            </p>

            <p className="text-white/40 text-xs mt-0.5">
              Ingresa los datos de tu finca para ver estadísticas y
              recomendaciones personalizadas.
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

      {/* ───────────────── GRID ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ───────────────── GRÁFICA ───────────────── */}
        <div className="stat-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-white text-lg">
              Producción mensual estimada
            </h3>

            <span className="text-white/30 text-xs">t/ha</span>
          </div>

          <div className="flex items-end gap-1.5" style={{ height: 110 }}>
            {harvestValues.map((val, i) => {
              const h = (val / maxH) * 100;

              const peak = val === maxH;

              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div className="w-full flex items-end" style={{ height: 90 }}>
                    <div
                      className="w-full rounded-t-sm transition-all duration-500"
                      style={{
                        height: `${h}%`,
                        minHeight: 4,

                        background: peak ? "#CC9633" : "rgba(46,107,69,0.5)",
                      }}
                    />
                  </div>

                  <span className="text-white/30 text-[9px]">{MONTHS[i]}</span>
                </div>
              );
            })}
          </div>

          <div
            className="flex gap-4 mt-3 pt-3"
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{
                  background: "rgba(46,107,69,0.5)",
                }}
              />

              <span className="text-white/40 text-xs">Producción</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#CC9633]" />

              <span className="text-white/40 text-xs">Pico máximo</span>
            </div>
          </div>
        </div>

        {/* ───────────────── IA ───────────────── */}
        <div className="stat-card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[#CC9633]/15 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#CC9633"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>

            <h3 className="font-serif text-white text-lg">
              Recomendaciones IA
            </h3>
          </div>

          {!cultivo.hectareas ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="text-3xl mb-3">🤖</span>

              <p className="text-white/40 text-sm">
                Registra los datos de tu cultivo para recibir recomendaciones
                personalizadas.
              </p>

              <button
                onClick={() => onGoTo("cultivo")}
                className="mt-3 text-[#CC9633] text-xs hover:underline"
              >
                Ir a Mi Cultivo →
              </button>
            </div>
          ) : loadingAI ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl animate-pulse"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {aiRecs.map((r, i) => (
                <RecCard key={i} {...r} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
