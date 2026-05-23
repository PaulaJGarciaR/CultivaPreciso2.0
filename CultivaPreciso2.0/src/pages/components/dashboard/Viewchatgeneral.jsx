import { useState, useRef, useEffect } from "react";

function TypingDots() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
        style={{ background: "rgba(76,175,125,0.12)", border: "1px solid rgba(76,175,125,0.25)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="#4CAF7D" strokeWidth="2" className="w-3.5 h-3.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-sm"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{
                background: "#4CAF7D",
                animation: `chatBounce 1.2s ease-in-out ${i * 0.18}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Bubble({ msg }) {
  const isUser = msg.role === "user";
  
  // Función para formatear el texto eliminando markdown
  const formatText = (text) => {
    if (!text) return "";
    let formatted = text;
    // Eliminar asteriscos de negrita
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '$1');
    formatted = formatted.replace(/\*(.*?)\*/g, '$1');
    // Eliminar guiones de listas y reemplazar con viñetas normales
    formatted = formatted.replace(/^-\s/gm, '• ');
    // Eliminar múltiples espacios en blanco
    formatted = formatted.replace(/\s+/g, ' ');
    // Eliminar saltos de línea excesivos
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    return formatted;
  };

  return (
    <div className={`flex items-end gap-2 mb-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
        style={
          isUser
            ? { background: "rgba(204,150,51,0.15)", border: "1px solid rgba(204,150,51,0.3)" }
            : { background: "rgba(76,175,125,0.12)", border: "1px solid rgba(76,175,125,0.25)" }
        }
      >
        {isUser ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="#CC9633" strokeWidth="2" className="w-3 h-3">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="#4CAF7D" strokeWidth="2" className="w-3 h-3">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </div>
      <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        {msg.text && (
          <div
            className="px-3 py-2.5 text-xs leading-relaxed whitespace-pre-wrap"
            style={
              isUser
                ? {
                    background: "rgba(204,150,51,0.12)",
                    border: "1px solid rgba(204,150,51,0.22)",
                    color: "rgba(255,255,255,0.8)",
                    borderRadius: "14px 14px 4px 14px",
                  }
                : {
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.68)",
                    borderRadius: "14px 14px 14px 4px",
                  }
            }
          >
            {formatText(msg.text)}
          </div>
        )}
        <span className="text-xs px-0.5" style={{ color: "rgba(255,255,255,0.18)" }}>
          {msg.time}
        </span>
      </div>
    </div>
  );
}

export default function ChatGeneralFlotante() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hola 👋 Soy tu asistente de agricultura. Puedo ayudarte con preguntas sobre:\n\n• Cultivo de cacao y otras plantas\n• Agricultura de precisión (sensores, IoT, monitoreo)\n• Manejo de suelos y fertilización\n• Riego y manejo del agua\n• Prácticas agrícolas sostenibles\n\n¿En qué puedo ayudarte hoy?",
      time: now(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  const bottomRef = useRef(null);

  function now() {
    return new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  const send = async () => {
    if (!inputText.trim()) return;

    const userMsg = {
      role: "user",
      text: inputText.trim(),
      time: now(),
    };
    setMessages((p) => [...p, userMsg]);

    const txtSnap = inputText.trim();
    setInputText("");
    setLoading(true);

    try {
      // Sistema de rotación de API keys
      const apiKeys = [
        import.meta.env.VITE_GEMINI_API_KEY,
        import.meta.env.VITE_GEMINI_API_KEY_2,
        import.meta.env.VITE_GEMINI_API_KEY_3,
        import.meta.env.VITE_GEMINI_API_KEY_4,
      ].filter(Boolean);
      
      if (apiKeys.length === 0) {
        throw new Error("API key no configurada. Por favor configura VITE_GEMINI_API_KEY en tu archivo .env");
      }
      
      const apiKey = apiKeys[0];

      const systemPrompt = `Eres un asistente especializado en agricultura y cultivos.

TU ROL:
- Responder preguntas sobre agricultura en general
- Proporcionar información sobre cultivo de cacao y otras plantas
- Explicar conceptos de agricultura de precisión (sensores, IoT, monitoreo, automatización)
- Dar consejos sobre manejo de suelos, fertilización, riego
- Recomendar prácticas agrícolas sostenibles
- Ayudar con dudas técnicas sobre cultivo

TEMAS QUE PUEDES TRATAR:
- Cultivo de cacao (siembra, mantenimiento, cosecha)
- Otros cultivos agrícolas
- Agricultura de precisión y tecnología
- Manejo integrado de plagas (general)
- Suelos y fertilización
- Riego y manejo del agua
- Prácticas sostenibles y orgánicas
- Clima y meteorología agrícola

SI LA PREGUNTA NO ES SOBRE AGRICULTURA:
Responde cortésmente: "Lo siento, solo puedo responder preguntas relacionadas con agricultura y cultivos. Por favor formula tu pregunta dentro de estos temas."

REGLAS DE RESPUESTA:
- Responde en español
- Sé claro, conciso y accesible para agricultores
- Usa formato con viñetas cuando sea apropiado
- Proporciona información práctica y aplicable
- Si recomiendas productos o tratamientos, menciona que siempre es mejor consultar con un especialista local`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: txtSnap }],
              },
            ],
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            generationConfig: {
              maxOutputTokens: 1000,
              temperature: 0.7,
            },
          }),
        }
      );

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error.message || "Error en la API de Gemini");
      }

      const aiText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No pude procesar tu pregunta. Intenta de nuevo.";

      setMessages((p) => [
        ...p,
        { role: "assistant", text: aiText, time: now() },
      ]);
    } catch (error) {
      console.error("Error en el chat:", error);
      setMessages((p) => [
        ...p,
        { 
          role: "assistant", 
          text: `Error: ${error.message || "Error al conectar con la IA. Por favor, intenta de nuevo."}`, 
          time: now() 
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes chatBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes chatPop { from{opacity:0;transform:scale(0.92) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .chat-window { animation: chatPop 0.25s ease forwards; }
      `}</style>

      {/* ── Panel del chat ── */}
      {open && (
        <div
          className="chat-window fixed bottom-20 right-5 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
          style={{
            width: "440px",
            height: "600px",
            background: "#120C08",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(76,175,125,0.08)",
          }}
        >
          {/* Header del chat */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(76,175,125,0.12)", border: "1px solid rgba(76,175,125,0.22)" }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="#4CAF7D" strokeWidth="2" className="w-4 h-4">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-xs font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Asistente Agrícola
                </p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>En línea</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/30 hover:text-white/70 transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            {messages.map((m, i) => <Bubble key={i} msg={m} />)}
            {loading && <TypingDots />}
            <div ref={bottomRef} />
          </div>

          {/* Input área */}
          <div
            className="shrink-0 mx-3 mb-3 rounded-xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
          >
            <div className="flex items-center gap-2 px-3 py-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Escribe tu pregunta sobre agricultura..."
                className="flex-1 bg-transparent text-xs outline-none"
                style={{ color: "rgba(255,255,255,0.7)", caretColor: "#4CAF7D" }}
              />
              <button
                onClick={send}
                disabled={loading || !inputText.trim()}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0"
                style={{
                  background: inputText.trim() ? "#2E6B45" : "rgba(255,255,255,0.05)",
                  opacity: loading ? 0.5 : 1,
                  cursor: loading || !inputText.trim() ? "not-allowed" : "pointer",
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-3.5 h-3.5">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── FAB (botón flotante) ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-110 active:scale-95"
        style={{
          background: open
            ? "rgba(26,17,13,0.95)"
            : "linear-gradient(135deg, #2E6B45 0%, #1e4d30 100%)",
          border: open
            ? "1px solid rgba(255,255,255,0.12)"
            : "1px solid rgba(76,175,125,0.4)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(76,175,125,0.15)",
        }}
        title="Asistente Agrícola — preguntas generales"
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-5 h-5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
        {/* Badge */}
        {!open && (
          <span
            className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white"
            style={{ background: "#4CAF7D", fontSize: "7px", fontWeight: 700 }}
          >
            IA
          </span>
        )}
      </button>
    </>
  );
}
