// src/components/dashboard/ViewAI.jsx
import { useState, useEffect, useRef } from "react";
import { SectionHeader, RecCard } from "./Shared";

const SUGERIDAS = [
  "¿Cuándo sembrar cacao en Colombia?",
  "¿Cómo prevenir la moniliasis?",
  "¿Qué abono usar en plantas nuevas?",
  "¿Cuánto tiempo tarda el cacao en producir?",
];

export default function ViewAI({ cultivo }) {
  const [loading,  setLoading]  = useState(false);
  const [question, setQuestion] = useState("");
  const [chat,     setChat]     = useState([]);
  const chatRef = useRef(null);

  const plantas = cultivo.hectareas
    ? Math.floor(parseFloat(cultivo.hectareas) * 10000 / 6)
    : 0;

  const contextoCultivo = cultivo.hectareas
    ? `El agricultor tiene la finca "${cultivo.nombre||"sin nombre"}" con ${cultivo.hectareas} ha de cacao variedad ${cultivo.variedad||"no especificada"} en ${cultivo.region||"Colombia"}. Plantas estimadas: ${plantas.toLocaleString()} (6 m² c/u). Siembra: ${cultivo.fechaSiembra||"no definida"}. Notas: ${cultivo.notas||"ninguna"}.`
    : "El agricultor aún no ha registrado datos de su cultivo.";

  const aiRecs = cultivo.hectareas ? [
    { priority:"Alta",  colorCls:"bg-red-500/15 text-red-400",
      title:"Gestión de sombra",
      desc:`Para ${plantas.toLocaleString()} plantas de ${cultivo.variedad||"cacao"}, instala sombrío provisional con plátano a densidad 1:4.` },
    { priority:"Media", colorCls:"bg-[#CC9633]/15 text-[#CC9633]",
      title:"Control fitosanitario preventivo",
      desc:`Con ${cultivo.hectareas} ha, programa inspecciones semanales los primeros 6 meses.` },
    { priority:"Baja",  colorCls:"bg-[#2E6B45]/20 text-[#4CAF7D]",
      title:"Registro de labores",
      desc:"Documenta riegos, fertilizaciones y aplicaciones fitosanitarias para optimizar decisiones futuras." },
  ] : [];

  const sendMessage = async (msg) => {
    if (!msg.trim() || loading) return;
    const userMsg = msg.trim();
    setQuestion("");
    const newChat = [...chat, { role:"user", text:userMsg }];
    setChat(newChat);
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:`Eres un agrónomo experto en cultivo de cacao en Colombia y Latinoamérica. Das consejos prácticos y claros en español. Usa emojis agrícolas ocasionalmente. Responde conciso (máx 4 párrafos). Contexto: ${contextoCultivo}`,
          messages: newChat.map(m => ({ role: m.role==="user"?"user":"assistant", content:m.text })),
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text||"").join("") || "No se pudo obtener respuesta.";
      setChat(c => [...c, { role:"assistant", text }]);
    } catch {
      setChat(c => [...c, { role:"assistant", text:"⚠️ Error de conexión. Intenta de nuevo." }]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chat, loading]);

  return (
    <div className="space-y-5 max-w-3xl">
      <SectionHeader
        title="IA Predictiva"
        sub="Recomendaciones automáticas y consulta libre al agrónomo inteligente."
      />

      {aiRecs.length > 0 && (
        <div className="stat-card rounded-xl p-5">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Análisis automático de tu finca</p>
          <div className="space-y-2">
            {aiRecs.map((r, i) => <RecCard key={i} {...r} />)}
          </div>
        </div>
      )}

      {/* Chat */}
      <div className="stat-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-[#CC9633]/15 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#CC9633" strokeWidth="2" className="w-4 h-4">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3 className="font-serif text-white text-lg">Consulta al agrónomo IA</h3>
          <span className="text-[10px] bg-[#2E6B45]/20 text-[#4CAF7D] px-2 py-0.5 rounded-full font-semibold ml-auto">
            Powered by Claude
          </span>
        </div>

        {chat.length === 0 && (
          <div className="mb-4">
            <p className="text-white/30 text-xs mb-2">Preguntas frecuentes:</p>
            <div className="flex flex-wrap gap-2">
              {SUGERIDAS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-1.5 rounded-full text-[#CC9633] hover:bg-[#CC9633]/10 transition-colors"
                  style={{ border:"1px solid rgba(204,150,51,0.25)" }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {chat.length > 0 && (
          <div ref={chatRef} className="space-y-3 mb-4 overflow-y-auto pr-1" style={{ maxHeight:280 }}>
            {chat.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role==="user" ? "justify-end" : "justify-start"}`}>
                {m.role==="assistant" && (
                  <div className="w-7 h-7 rounded-full bg-[#CC9633]/15 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px]">🤖</span>
                  </div>
                )}
                <div
                  className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed whitespace-pre-wrap
                    ${m.role==="user" ? "rounded-tr-none text-white" : "rounded-tl-none text-white/80"}`}
                  style={{
                    background: m.role==="user" ? "#2E6B45" : "rgba(255,255,255,0.06)",
                    border:     m.role==="user" ? "none"    : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-[#CC9633]/15 flex items-center justify-center shrink-0">
                  <span className="text-[10px]">🤖</span>
                </div>
                <div
                  className="p-3 rounded-xl rounded-tl-none"
                  style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="flex gap-1 items-center h-4">
                    {[0,1,2].map(j => (
                      <div
                        key={j}
                        className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce"
                        style={{ animationDelay:`${j*0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <input
            className="form-input flex-1 text-sm"
            placeholder="Haz una pregunta sobre tu cultivo..."
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key==="Enter" && sendMessage(question)}
          />
          <button
            onClick={() => sendMessage(question)}
            disabled={loading || !question.trim()}
            className="px-4 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-40"
            style={{ background:"#2E6B45", color:"white" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}