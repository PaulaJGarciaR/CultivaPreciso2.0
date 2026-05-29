import { useState } from "react";

export default function ViewCalculadoraSensores() {
  const [sensorData, setSensorData] = useState({
    humedadSuelo: "",
    ph: "",
    temperatura: "",
    nivelAgua: "",
    conductividad: "",
    nitrogeno: "",
    fosforo: "",
    potasio: "",
  });

  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setSensorData({ ...sensorData, [e.target.name]: e.target.value });
  };

  const calcular = () => {
    const humedad = parseFloat(sensorData.humedadSuelo);
    const ph = parseFloat(sensorData.ph);
    const temp = parseFloat(sensorData.temperatura);
    const nivelAgua = parseFloat(sensorData.nivelAgua);
    const conductividad = parseFloat(sensorData.conductividad);
    const n = parseFloat(sensorData.nitrogeno);
    const p = parseFloat(sensorData.fosforo);
    const k = parseFloat(sensorData.potasio);

    if ([humedad, ph, temp, nivelAgua, conductividad, n, p, k].some(Number.isNaN)) {
      setResult({
        apto: false,
        estado: "Datos incompletos",
        recomendaciones: ["Completa todos los campos de la calculadora para generar un análisis confiable."],
        puntuacion: 0,
      });
      return;
    }

    let apto = true;
    let recomendaciones = [];
    let estado = "Óptimo";

    if (humedad < 40) { apto = false; estado = "Necesita agua"; recomendaciones.push("El suelo está seco. Aumenta el riego."); }
    else if (humedad > 70) { apto = false; estado = "Saturado"; recomendaciones.push("El suelo está muy húmedo. Reduce el riego y mejora el drenaje."); }

    if (ph < 5.5) { apto = false; if (estado === "Óptimo") estado = "Ácido"; recomendaciones.push("El suelo es muy ácido. Aplica cal agrícola para neutralizar."); }
    else if (ph > 6.5) { apto = false; if (estado === "Óptimo") estado = "Alcalino"; recomendaciones.push("El suelo es muy alcalino. Aplica azufre o materia orgánica."); }

    if (temp < 20) { apto = false; if (estado === "Óptimo") estado = "Frío"; recomendaciones.push("La temperatura es baja. Considera protección térmica."); }
    else if (temp > 30) { apto = false; if (estado === "Óptimo") estado = "Caliente"; recomendaciones.push("La temperatura es alta. Aumenta sombrío y riego."); }

    if (nivelAgua < 50) { apto = false; if (estado === "Óptimo") estado = "Bajo nivel de agua"; recomendaciones.push("Nivel de agua bajo. Aumenta el riego."); }
    else if (nivelAgua > 80) { apto = false; if (estado === "Óptimo") estado = "Exceso de agua"; recomendaciones.push("Nivel de agua muy alto. Mejora el drenaje."); }

    if (conductividad > 2) { apto = false; if (estado === "Óptimo") estado = "Salino"; recomendaciones.push("Alta salinidad. Aplica lavado de suelo con agua de buena calidad."); }

    if (n < 20) recomendaciones.push("Bajo nivel de nitrógeno. Aplica fertilizante nitrogenado.");
    if (p < 15) recomendaciones.push("Bajo nivel de fósforo. Aplica fertilizante fosfatado.");
    if (k < 15) recomendaciones.push("Bajo nivel de potasio. Aplica fertilizante potásico.");

    setResult({ apto, estado, recomendaciones, puntuacion: calcularPuntuacion(humedad, ph, temp, nivelAgua, conductividad, n, p, k) });
  };

  const calcularPuntuacion = (humedad, ph, temp, nivelAgua, conductividad, n, p, k) => {
    let score = 100;
    if (humedad < 40 || humedad > 70) score -= 15;
    if (ph < 5.5 || ph > 6.5) score -= 15;
    if (temp < 20 || temp > 30) score -= 10;
    if (nivelAgua < 50 || nivelAgua > 80) score -= 10;
    if (conductividad > 2) score -= 15;
    if (n < 20) score -= 10;
    if (p < 15) score -= 10;
    if (k < 15) score -= 10;
    return Math.max(0, score);
  };

  const limpiar = () => {
    setSensorData({ humedadSuelo: "", ph: "", temperatura: "", nivelAgua: "", conductividad: "", nitrogeno: "", fosforo: "", potasio: "" });
    setResult(null);
  };

  // ── Paleta oscura cacao ──────────────────────────────────────────
  const gold = "#CC9633";
  const green = "#4CAF7D";
  const cardBg = "rgba(255,255,255,0.03)";
  const cardBorder = "rgba(255,255,255,0.07)";
  const inputBg = "rgba(255,255,255,0.04)";
  const inputBorder = "rgba(255,255,255,0.10)";
  const labelColor = "rgba(255,255,255,0.35)";
  const textPrimary = "rgba(255,255,255,0.85)";
  const textSecondary = "rgba(255,255,255,0.52)";
  const divider = "rgba(255,255,255,0.06)";

  const isOk = result?.apto && result?.puntuacion >= 70;
  const scoreOk = (result?.puntuacion ?? 0) >= 70;

  const statusColor = isOk ? green : gold;
  const scoreColor = scoreOk ? green : gold;

  return (
    <div className="space-y-3">
      <style>{`
        .calc-input::placeholder { color: rgba(255,255,255,0.18); }
        .calc-input:focus { outline: none; border-color: rgba(204,150,51,0.45) !important; box-shadow: 0 0 0 3px rgba(204,150,51,0.08); }
        .calc-btn-primary:hover { opacity: 0.88; }
        .calc-btn-secondary:hover { opacity: 0.8; }
      `}</style>

      {/* ── Tarjeta de entrada ── */}
      <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: "1.25rem" }}>

        {/* Encabezado */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.25rem" }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: `${gold}14`, border: `1px solid ${gold}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" style={{ width: 18, height: 18 }}>
              <path d="M12 22V12M12 12C12 7 7 4 2 5c0 5 3 9 10 7M12 12c0-5 5-8 10-7 0 5-3 9-10 7" />
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 15, color: textPrimary }}>
              Panel de lectura manual
            </p>
            <p style={{ margin: 0, fontSize: 12, color: labelColor }}>
              Registra cada variable y calcula el estado del suelo
            </p>
          </div>
        </div>

        {/* Separador */}
        <div style={{ height: 1, background: divider, marginBottom: "1.25rem" }} />

        {/* Grid de campos */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(138px, 1fr))", gap: 10, marginBottom: "1.25rem" }}>
          {[
            { label: "Humedad suelo (%)", name: "humedadSuelo", placeholder: "40–70" },
            { label: "pH del suelo", name: "ph", placeholder: "5.5–6.5" },
            { label: "Temperatura (°C)", name: "temperatura", placeholder: "20–30" },
            { label: "Nivel de agua (%)", name: "nivelAgua", placeholder: "50–80" },
            { label: "Conductividad (dS/m)", name: "conductividad", placeholder: "< 2" },
            { label: "Nitrógeno (mg/kg)", name: "nitrogeno", placeholder: "> 20" },
            { label: "Fósforo (mg/kg)", name: "fosforo", placeholder: "> 15" },
            { label: "Potasio (mg/kg)", name: "potasio", placeholder: "> 15" },
          ].map(({ label, name, placeholder }) => (
            <div key={name}>
              <label style={{ display: "block", fontSize: 11, color: labelColor, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {label}
              </label>
              <input
                type="number"
                name={name}
                value={sensorData[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className="calc-input"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "8px 10px",
                  fontSize: 13,
                  borderRadius: 8,
                  border: `1px solid ${inputBorder}`,
                  background: inputBg,
                  color: textPrimary,
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
              />
            </div>
          ))}
        </div>

        {/* Botones */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={calcular}
            className="calc-btn-primary"
            style={{ flex: 1, padding: "10px 18px", borderRadius: 8, border: "none", background: gold, color: "#1a0f00", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "opacity 0.2s", letterSpacing: "0.02em" }}
          >
            Calcular estado del suelo
          </button>
          <button
            onClick={limpiar}
            className="calc-btn-secondary"
            style={{ padding: "10px 18px", borderRadius: 8, border: `1px solid rgba(204,150,51,0.28)`, background: `${gold}10`, color: gold, fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "opacity 0.2s" }}
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* ── Tarjeta de resultados ── */}
      {result && (
        <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, padding: "1.25rem", animation: "fadeSlide 0.3s ease forwards" }}>
          <style>{`@keyframes fadeSlide { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }`}</style>

          <p style={{ margin: "0 0 12px", fontSize: 11, color: labelColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Resultados del análisis
          </p>

          {/* Estado y puntuación */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1.1rem" }}>
            {[
              { label: "Estado del suelo", value: result.estado, color: statusColor },
              { label: "Puntuación", value: `${result.puntuacion}/100`, color: scoreColor },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: `${color}10`, border: `1px solid ${color}28`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: 10, color, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>{label}</p>
                </div>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color, fontFamily: "'Playfair Display', serif" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Recomendaciones */}
          <p style={{ margin: "0 0 10px", fontSize: 11, color: labelColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Recomendaciones
          </p>

          {result.recomendaciones.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {result.recomendaciones.map((rec, i) => (
                <li key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: textSecondary, padding: "7px 0", borderBottom: i < result.recomendaciones.length - 1 ? `1px solid ${divider}` : "none", alignItems: "flex-start" }}>
                  <span style={{ color: gold, flexShrink: 0, marginTop: 1 }}>•</span>
                  {rec}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: 13, color: green, margin: 0 }}>
              ✓ El suelo está en condiciones óptimas para el cultivo.
            </p>
          )}

          {/* Aviso */}
          <div style={{ marginTop: "1rem", background: "rgba(255,255,255,0.02)", border: `1px solid ${divider}`, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: labelColor }}>
            ⚠️ Este análisis es orientativo. Para un diagnóstico definitivo, consulta con un agrónomo certificado.
          </div>
        </div>
      )}
    </div>
  );
}