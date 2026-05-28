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
  const formatBlocks = (text) =>
    (text || "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/^\s*-\s/gm, "• ")
      .replace(/\n{3,}/g, "\n\n")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

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
        {msg.imageUrl && (
          <img
            src={msg.imageUrl}
            alt="uploaded"
            className="rounded-xl max-h-32 object-cover"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          />
        )}
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
            <div className="space-y-2">
              {formatBlocks(msg.text).map((line, index) => (
                <p key={index} className={line.startsWith("•") ? "pl-2" : ""}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}
        <span className="text-xs px-0.5" style={{ color: "rgba(255,255,255,0.18)" }}>
          {msg.time}
        </span>
      </div>
    </div>
  );
}

export default function ChatEnfermedadesFlotante() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hola 👋 Soy tu asistente especializado en agricultura de precisión y enfermedades del cultivo de cacao. Puedo ayudarte con:\n\n• Diagnóstico visual de enfermedades en cacao (Moniliasis, Escoba de Bruja, Pudrición Parda, Mal de Machete, Rosellinia)\n• Preguntas sobre agricultura de precisión (sensores, IoT, monitoreo)\n• Recomendaciones de manejo integrado\n\nSube una foto de tu planta o fruto afectado para que la IA analice los síntomas. ⚠️ Recuerda: Este análisis es orientativo, siempre consulta con un agrónomo certificado para un diagnóstico definitivo.",
      time: now(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [pendingImg, setPendingImg] = useState(null);
  const [inputText, setInputText] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  function now() {
    return new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result.split(",")[1];
      setPendingImg({ url: e.target.result, base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const send = async () => {
    if (!pendingImg && !inputText.trim()) return;

    const userMsg = {
      role: "user",
      text: inputText.trim() || "Analiza esta imagen, por favor.",
      imageUrl: pendingImg?.url || null,
      time: now(),
    };
    setMessages((p) => [...p, userMsg]);

    const imgSnap = pendingImg;
    const txtSnap = inputText.trim();
    setPendingImg(null);
    setInputText("");
    setLoading(true);

    try {
      // Sistema de rotación de API keys
      const apiKeys = [
        import.meta.env.VITE_GEMINI_API_KEY,
        import.meta.env.VITE_GEMINI_API_KEY_2,
        import.meta.env.VITE_GEMINI_API_KEY_3,
        import.meta.env.VITE_GEMINI_API_KEY_4,
        import.meta.env.VITE_GEMINI_API_KEY_5,
        import.meta.env.VITE_GEMINI_API_KEY_6,
      ].filter(Boolean);
      
      if (apiKeys.length === 0) {
        throw new Error("API key no configurada. Por favor configura VITE_GEMINI_API_KEY en tu archivo .env");
      }
      
      let data = null;
      let lastError = null;

      const userContent = [];
      if (imgSnap) {
        userContent.push({
          inlineData: {
            mimeType: imgSnap.mimeType,
            data: imgSnap.base64,
          },
        });
      }
      userContent.push({
        text: txtSnap || "Analiza esta imagen de un cultivo de cacao. Identifica posibles síntomas de enfermedades o plagas.",
      });

      const systemPrompt = `Eres un asistente especializado EXCLUSIVAMENTE en agricultura de precisión y fitosanidad del cultivo de cacao.

⚠️ IMPORTANTE: AL INICIO DE CADA RESPUESTA, SIN EXCEPCIÓN, agrega este mensaje:
"⚠️ RECOMENDACIÓN IMPORTANTE: Este análisis es orientativo. Debes consultar con un agrónomo certificado o especialista en fitosanidad para un diagnóstico definitivo y tratamiento adecuado."

TU ROL ESTÁ LIMITADO A:
- Preguntas sobre agricultura de precisión (sensores, IoT, monitoreo, datos, automatización)
- Enfermedades y plagas del cultivo de cacao
- Diagnóstico visual de síntomas en plantas de cacao
- Manejo integrado de plagas y enfermedades en cacao
- Recomendaciones de cultivo para cacao

ENFERMEDADES DE CACAO QUE CONOCES:
1. MONILIASIS (Moniliophthera roreri): Síntomas - maduración temprana anormal, frutos deformados, manchas grasientas, tejido amolloso blanco que se vuelve gris. Control - recojo y entierro de frutos afectados, Triadimefon, Tebuconazol, Prochloraz entre 30-90 días del fruto.
2. ESCOBA DE BRUJA (Crinipellis perniciosa): Síntomas - brotación anormal en yemas, concentración de ramas, flores adheridas, frutos "chirimoyos". Control - retiro de material afectado, poda de ventilación, oxicloruro de cobre o caldo bordalés.
3. PUDRICIÓN PARDA DE LA MAZORCA (Phytophthora sp.): Síntomas - mancha circular parda acuosa, chancros en tronco con fluido rojizo. Control - fungicidas cúpricos (oxicloruro de cobre, caldo bordalés) con adherente.
4. MAL DE MACHETE (Ceratocystis fimbriata): Síntomas - daño en tronco y ramas, muerte del árbol, ingresa por heridas de herramientas. Control - retirar plantas enfermas, desinfectar suelo con cal agrícola, esperar 3 meses antes de resembrar.
5. ROSELLINIA (Rosellinia sp.): Síntomas - llaga estrellada, podredumbre negra de raíz, amarillamiento, marchitamiento, muerte. Control - quintozeno, tiofanato metílico, fluazinam, benomilo.

CUANDO ANALICES UNA IMAGEN, RESPONDE EN ESTE ORDEN:
1. Primero el disclaimer obligatorio (al inicio)
2. En una frase: "Basado en los síntomas visuales, la posible enfermedad es: [NOMBRE DE LA ENFERMEDAD]"
3. En una frase: "Por qué creo esto: [explicación breve de los síntomas que coinciden]"
4. Recomendaciones de manejo inicial (máximo 3 puntos)
5. NO uses asteriscos ni formato markdown, usa texto plano

SI LA PREGUNTA NO ES SOBRE AGRICULTURA DE PRECISIÓN O CACAO:
Responde cortésmente: "Lo siento, solo puedo responder preguntas relacionadas con agricultura de precisión y enfermedades del cultivo de cacao. Por favor formula tu pregunta dentro de estos temas."

REGLAS DE RESPUESTA:
- Responde en español
- Sé MUY conciso (máximo 150 palabras)
- Separa la respuesta en bloques cortos con saltos de línea
- NO uses asteriscos ni formato markdown (*, **, -, etc.)
- Usa viñetas normales con el símbolo •
- Sé específico con los nombres de las enfermedades
- Estructura clara: enfermedad -> por qué -> recomendaciones
- El disclaimer SIEMPRE va al inicio`;

      for (const apiKey of apiKeys) {
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    role: "user",
                    parts: userContent,
                  },
                ],
                systemInstruction: {
                  parts: [{ text: systemPrompt }],
                },
                generationConfig: {
                  maxOutputTokens: 700,
                  temperature: 0.35,
                  topP: 0.8,
                },
              }),
            }
          );

          const parsed = await res.json().catch(() => ({}));
          if (!res.ok || parsed.error) {
            throw new Error(parsed.error?.message || `Error HTTP ${res.status}`);
          }
          data = parsed;
          break;
        } catch (e) {
          lastError = e;
        }
      }
      
      if (!data) {
        throw lastError || new Error("No se pudo obtener respuesta de la IA");
      }
      
      if (data.error) {
        throw new Error(data.error.message || "Error en la API de Gemini");
      }

      const aiText = data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .filter(Boolean)
        .join("\n")
        ?.trim();

      if (!aiText) {
        throw new Error("No pude procesar la imagen. Intenta con otra foto más clara, enfocada y con buena iluminación.");
      }

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
          text: `No pude completar el análisis. ${error.message || "Intenta de nuevo con una imagen más clara o una descripción de los síntomas."}`, 
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
            width: "480px",
            height: "650px",
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
                  Diagnóstico IA
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

          {/* Disclaimer */}
          <div
            className="flex items-center gap-2 px-3 py-2 shrink-0"
            style={{
              background: "rgba(204,150,51,0.06)",
              borderBottom: "1px solid rgba(204,150,51,0.12)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#CC9633" strokeWidth="2" className="w-3 h-3 shrink-0">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>
              Análisis orientativo — consulta con un especialista.
            </p>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            {messages.map((m, i) => <Bubble key={i} msg={m} />)}
            {loading && <TypingDots />}
            <div ref={bottomRef} />
          </div>

          {/* Preview imagen pendiente */}
          {pendingImg && (
            <div
              className="flex items-center gap-2 px-3 py-2 mx-3 mb-2 rounded-xl shrink-0"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <img src={pendingImg.url} alt="preview" className="w-10 h-10 object-cover rounded-lg shrink-0" />
              <p className="text-xs flex-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                Imagen lista · agrega texto opcional
              </p>
              <button onClick={() => setPendingImg(null)} className="text-white/25 hover:text-red-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          )}

          {/* Input área */}
          <div
            className="shrink-0 mx-3 mb-3 rounded-xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          >
            {/* Zona de subida */}
            <div
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-white/5 transition-colors"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: dragOver ? "rgba(76,175,125,0.1)" : "transparent",
              }}
              onClick={() => fileRef.current?.click()}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"
                style={{ color: "rgba(255,255,255,0.28)" }}>
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>
                Clic o arrastra una imagen aquí
              </span>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>

            {/* Text + enviar */}
            <div className="flex items-center gap-2 px-3 py-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Comenta sobre la imagen…"
                className="flex-1 bg-transparent text-xs outline-none"
                style={{ color: "rgba(255,255,255,0.7)", caretColor: "#4CAF7D" }}
              />
              <button
                onClick={send}
                disabled={loading || (!pendingImg && !inputText.trim())}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0"
                style={{
                  background:
                    pendingImg || inputText.trim() ? "#2E6B45" : "rgba(255,255,255,0.05)",
                  opacity: loading ? 0.5 : 1,
                  cursor: loading || (!pendingImg && !inputText.trim()) ? "not-allowed" : "pointer",
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
        title="Diagnóstico IA — enfermedades del cacao"
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
            style={{ background: "#CC9633", fontSize: "7px", fontWeight: 700 }}
          >
            IA
          </span>
        )}
      </button>
    </>
  );
}