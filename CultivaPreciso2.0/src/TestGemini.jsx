// Componente TEMPORAL para ver qué modelos tienes disponibles
// Úsalo una vez, luego bórralo

import { useState } from "react";

export default function TestGeminiModels() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchModels = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      const data = await res.json();
      console.log("Todos los modelos:", data);
      // Filtra solo los que soportan generateContent
      const compatibles = (data.models || []).filter((m) =>
        m.supportedGenerationMethods?.includes("generateContent")
      );
      setModels(compatibles);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, color: "white", background: "#111", borderRadius: 12 }}>
      <button onClick={fetchModels} style={{ background: "#2E6B45", padding: "8px 16px", borderRadius: 8, color: "white", marginBottom: 16 }}>
        {loading ? "Cargando..." : "Ver modelos disponibles"}
      </button>
      {error && <p style={{ color: "red" }}>⚠️ {error}</p>}
      <ul>
        {models.map((m) => (
          <li key={m.name} style={{ marginBottom: 8, fontSize: 13 }}>
            <strong style={{ color: "#4CAF7D" }}>{m.name}</strong> — {m.displayName}
          </li>
        ))}
      </ul>
    </div>
  );
}