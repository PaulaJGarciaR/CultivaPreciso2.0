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
    setSensorData({
      ...sensorData,
      [e.target.name]: e.target.value,
    });
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

    if (humedad < 40) {
      apto = false;
      estado = "Necesita agua";
      recomendaciones.push("El suelo está seco. Aumenta el riego.");
    } else if (humedad > 70) {
      apto = false;
      estado = "Saturado";
      recomendaciones.push("El suelo está muy húmedo. Reduce el riego y mejora el drenaje.");
    }

    if (ph < 5.5) {
      apto = false;
      if (estado === "Óptimo") estado = "Ácido";
      recomendaciones.push("El suelo es muy ácido. Aplica cal agrícola para neutralizar.");
    } else if (ph > 6.5) {
      apto = false;
      if (estado === "Óptimo") estado = "Alcalino";
      recomendaciones.push("El suelo es muy alcalino. Aplica azufre o materia orgánica.");
    }

    if (temp < 20) {
      apto = false;
      if (estado === "Óptimo") estado = "Frío";
      recomendaciones.push("La temperatura es baja. Considera protección térmica.");
    } else if (temp > 30) {
      apto = false;
      if (estado === "Óptimo") estado = "Caliente";
      recomendaciones.push("La temperatura es alta. Aumenta sombrío y riego.");
    }

    if (nivelAgua < 50) {
      apto = false;
      if (estado === "Óptimo") estado = "Bajo nivel de agua";
      recomendaciones.push("Nivel de agua bajo. Aumenta el riego.");
    } else if (nivelAgua > 80) {
      apto = false;
      if (estado === "Óptimo") estado = "Exceso de agua";
      recomendaciones.push("Nivel de agua muy alto. Mejora el drenaje.");
    }

    if (conductividad > 2) {
      apto = false;
      if (estado === "Óptimo") estado = "Salino";
      recomendaciones.push("Alta salinidad. Aplica lavado de suelo con agua de buena calidad.");
    }

    if (n < 20) recomendaciones.push("Bajo nivel de nitrógeno. Aplica fertilizante nitrogenado.");
    if (p < 15) recomendaciones.push("Bajo nivel de fósforo. Aplica fertilizante fosfatado.");
    if (k < 15) recomendaciones.push("Bajo nivel de potasio. Aplica fertilizante potásico.");

    setResult({
      apto,
      estado,
      recomendaciones,
      puntuacion: calcularPuntuacion(humedad, ph, temp, nivelAgua, conductividad, n, p, k),
    });
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
    setSensorData({
      humedadSuelo: "",
      ph: "",
      temperatura: "",
      nivelAgua: "",
      conductividad: "",
      nitrogeno: "",
      fosforo: "",
      potasio: "",
    });
    setResult(null);
  };

  // ── Tokens de color ──────────────────────────────────────────────
  const green = {
    bg: "#EAF3DE",
    border: "#C0DD97",
    text: "#3B6D11",
    darkText: "#27500A",
  };
  const amber = {
    bg: "#FAEEDA",
    border: "#FAC775",
    text: "#854F0B",
  };

  const isOk = result?.apto && result?.puntuacion >= 70;
  const scoreOk = result?.puntuacion >= 70;

  return (
    <div className="space-y-4">
      {/* ── Tarjeta de entrada ── */}
      <div
        style={{
          background: "#ffffff",
          border: "0.5px solid #e2e8e0",
          borderRadius: 12,
          padding: "1.25rem",
        }}
      >
        {/* Encabezado */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "1.25rem" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: green.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke={green.text} strokeWidth="2" style={{ width: 20, height: 20 }}>
              <path d="M12 22V12M12 12C12 7 7 4 2 5c0 5 3 9 10 7M12 12c0-5 5-8 10-7 0 5-3 9-10 7" />
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 500, fontSize: 16, color: "#111" }}>
              Panel de lectura manual
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
              Registra cada variable y calcula una estimación del estado del suelo
            </p>
          </div>
        </div>

        {/* Grid de campos */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 12,
            marginBottom: "1.25rem",
          }}
        >
          {[
            { label: "Humedad del suelo (%)", name: "humedadSuelo", placeholder: "40–70", min: 0, max: 100, step: 1 },
            { label: "pH del suelo", name: "ph", placeholder: "5.5–6.5", min: 0, max: 14, step: 0.1 },
            { label: "Temperatura (°C)", name: "temperatura", placeholder: "20–30", min: 0, max: 50, step: 1 },
            { label: "Nivel de agua (%)", name: "nivelAgua", placeholder: "50–80", min: 0, max: 100, step: 1 },
            { label: "Conductividad (dS/m)", name: "conductividad", placeholder: "< 2", min: 0, max: 10, step: 0.1 },
            { label: "Nitrógeno (mg/kg)", name: "nitrogeno", placeholder: "> 20", min: 0, step: 1 },
            { label: "Fósforo (mg/kg)", name: "fosforo", placeholder: "> 15", min: 0, step: 1 },
            { label: "Potasio (mg/kg)", name: "potasio", placeholder: "> 15", min: 0, step: 1 },
          ].map(({ label, name, placeholder, min, max, step }) => (
            <div key={name}>
              <label
                style={{ display: "block", fontSize: 12, color: "#6b7280", marginBottom: 5 }}
              >
                {label}
              </label>
              <input
                type="number"
                name={name}
                value={sensorData[name]}
                onChange={handleChange}
                placeholder={placeholder}
                min={min}
                max={max}
                step={step}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "8px 10px",
                  fontSize: 14,
                  borderRadius: 8,
                  border: "0.5px solid #d1d5db",
                  background: "#f9fafb",
                  color: "#111",
                  outline: "none",
                }}
              />
            </div>
          ))}
        </div>

        {/* Botones */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={calcular}
            style={{
              flex: 1,
              padding: "10px 18px",
              borderRadius: 8,
              border: "none",
              background: green.darkText,
              color: "#fff",
              fontWeight: 500,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Calcular estado del suelo
          </button>
          <button
            onClick={limpiar}
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              border: `0.5px solid ${green.border}`,
              background: green.bg,
              color: green.darkText,
              fontWeight: 500,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* ── Tarjeta de resultados ── */}
      {result && (
        <div
          style={{
            background: "#ffffff",
            border: "0.5px solid #e2e8e0",
            borderRadius: 12,
            padding: "1.25rem",
          }}
        >
          <p style={{ margin: "0 0 12px", fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Resultados del análisis
          </p>

          {/* Estado y puntuación */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1rem" }}>
            {[
              { label: "Estado del suelo", value: result.estado, ok: isOk },
              { label: "Puntuación", value: `${result.puntuacion}/100`, ok: scoreOk },
            ].map(({ label, value, ok }) => (
              <div
                key={label}
                style={{
                  background: ok ? green.bg : amber.bg,
                  border: `0.5px solid ${ok ? green.border : amber.border}`,
                  borderRadius: 8,
                  padding: "12px 14px",
                }}
              >
                <p style={{ margin: "0 0 4px", fontSize: 11, color: ok ? green.text : amber.text, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {label}
                </p>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 500, color: ok ? green.text : amber.text }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Recomendaciones */}
          <p style={{ margin: "0 0 10px", fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Recomendaciones
          </p>

          {result.recomendaciones.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {result.recomendaciones.map((rec, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    gap: 8,
                    fontSize: 13,
                    color: "#374151",
                    padding: "6px 0",
                    borderBottom: i < result.recomendaciones.length - 1 ? "0.5px solid #e5e7eb" : "none",
                  }}
                >
                  <span style={{ color: amber.text, flexShrink: 0 }}>•</span>
                  {rec}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: 13, color: green.text, margin: 0 }}>
              El suelo está en condiciones óptimas para el cultivo.
            </p>
          )}

          {/* Aviso */}
          <div
            style={{
              marginTop: "1rem",
              background: "#f9fafb",
              border: "0.5px solid #e5e7eb",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 12,
              color: "#6b7280",
            }}
          >
            ⚠️ Este análisis es orientativo. Para un diagnóstico definitivo, consulta con un agrónomo certificado.
          </div>
        </div>
      )}
    </div>
  );
}