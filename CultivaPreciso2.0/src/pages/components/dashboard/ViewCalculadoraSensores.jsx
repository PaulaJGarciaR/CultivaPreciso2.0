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

    let apto = true;
    let recomendaciones = [];
    let estado = "Óptimo";

    // Análisis de humedad del suelo (ideal: 40-70%)
    if (humedad < 40) {
      apto = false;
      estado = "Necesita agua";
      recomendaciones.push("El suelo está seco. Aumenta el riego.");
    } else if (humedad > 70) {
      apto = false;
      estado = "Saturado";
      recomendaciones.push("El suelo está muy húmedo. Reduce el riego y mejora el drenaje.");
    }

    // Análisis de pH (ideal: 5.5-6.5 para cacao)
    if (ph < 5.5) {
      apto = false;
      if (estado === "Óptimo") estado = "Ácido";
      recomendaciones.push("El suelo es muy ácido. Aplica cal agrícola para neutralizar.");
    } else if (ph > 6.5) {
      apto = false;
      if (estado === "Óptimo") estado = "Alcalino";
      recomendaciones.push("El suelo es muy alcalino. Aplica azufre o materia orgánica.");
    }

    // Análisis de temperatura (ideal: 20-30°C para cacao)
    if (temp < 20) {
      apto = false;
      if (estado === "Óptimo") estado = "Frío";
      recomendaciones.push("La temperatura es baja. Considera protección térmica.");
    } else if (temp > 30) {
      apto = false;
      if (estado === "Óptimo") estado = "Caliente";
      recomendaciones.push("La temperatura es alta. Aumenta sombrío y riego.");
    }

    // Análisis de nivel de agua (ideal: 50-80%)
    if (nivelAgua < 50) {
      apto = false;
      if (estado === "Óptimo") estado = "Bajo nivel de agua";
      recomendaciones.push("Nivel de agua bajo. Aumenta el riego.");
    } else if (nivelAgua > 80) {
      apto = false;
      if (estado === "Óptimo") estado = "Exceso de agua";
      recomendaciones.push("Nivel de agua muy alto. Mejora el drenaje.");
    }

    // Análisis de conductividad (ideal: < 2 dS/m)
    if (conductividad > 2) {
      apto = false;
      if (estado === "Óptimo") estado = "Salino";
      recomendaciones.push("Alta salinidad. Aplica lavado de suelo con agua de buena calidad.");
    }

    // Análisis de nutrientes
    if (n < 20) {
      recomendaciones.push("Bajo nivel de nitrógeno. Aplica fertilizante nitrogenado.");
    }
    if (p < 15) {
      recomendaciones.push("Bajo nivel de fósforo. Aplica fertilizante fosfatado.");
    }
    if (k < 15) {
      recomendaciones.push("Bajo nivel de potasio. Aplica fertilizante potásico.");
    }

    setResult({
      apto,
      estado,
      recomendaciones,
      puntuacion: calcularPuntuacion(humedad, ph, temp, nivelAgua, conductividad, n, p, k),
    });
  };

  const calcularPuntuacion = (humedad, ph, temp, nivelAgua, conductividad, n, p, k) => {
    let score = 100;
    
    // Penalizaciones
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

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="stat-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#2E6B45]/15 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#4CAF7D" strokeWidth="2" className="w-5 h-5">
              <path d="M12 22V12M12 12C12 7 7 4 2 5c0 5 3 9 10 7M12 12c0-5 5-8 10-7 0 5-3 9-10 7" />
            </svg>
          </div>
          <div>
            <h2 className="font-serif text-white text-xl">Calculadora de Sensores</h2>
            <p className="text-white/40 text-xs">Analiza los datos de tus sensores para evaluar el estado del suelo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="field-label">Humedad del Suelo (%)</label>
            <input
              type="number"
              name="humedadSuelo"
              value={sensorData.humedadSuelo}
              onChange={handleChange}
              placeholder="40-70"
              className="form-input"
              min="0"
              max="100"
            />
          </div>
          <div>
            <label className="field-label">pH del Suelo</label>
            <input
              type="number"
              name="ph"
              value={sensorData.ph}
              onChange={handleChange}
              placeholder="5.5-6.5"
              className="form-input"
              min="0"
              max="14"
              step="0.1"
            />
          </div>
          <div>
            <label className="field-label">Temperatura (°C)</label>
            <input
              type="number"
              name="temperatura"
              value={sensorData.temperatura}
              onChange={handleChange}
              placeholder="20-30"
              className="form-input"
              min="0"
              max="50"
            />
          </div>
          <div>
            <label className="field-label">Nivel de Agua (%)</label>
            <input
              type="number"
              name="nivelAgua"
              value={sensorData.nivelAgua}
              onChange={handleChange}
              placeholder="50-80"
              className="form-input"
              min="0"
              max="100"
            />
          </div>
          <div>
            <label className="field-label">Conductividad (dS/m)</label>
            <input
              type="number"
              name="conductividad"
              value={sensorData.conductividad}
              onChange={handleChange}
              placeholder="< 2"
              className="form-input"
              min="0"
              max="10"
              step="0.1"
            />
          </div>
          <div>
            <label className="field-label">Nitrógeno (mg/kg)</label>
            <input
              type="number"
              name="nitrogeno"
              value={sensorData.nitrogeno}
              onChange={handleChange}
              placeholder="> 20"
              className="form-input"
              min="0"
            />
          </div>
          <div>
            <label className="field-label">Fósforo (mg/kg)</label>
            <input
              type="number"
              name="fosforo"
              value={sensorData.fosforo}
              onChange={handleChange}
              placeholder="> 15"
              className="form-input"
              min="0"
            />
          </div>
          <div>
            <label className="field-label">Potasio (mg/kg)</label>
            <input
              type="number"
              name="potasio"
              value={sensorData.potasio}
              onChange={handleChange}
              placeholder="> 15"
              className="form-input"
              min="0"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={calcular}
            className="flex-1 px-4 py-3 rounded-lg font-bold transition-all"
            style={{ background: "#2E6B45", color: "white" }}
          >
            Calcular Estado del Suelo
          </button>
          <button
            onClick={limpiar}
            className="px-4 py-3 rounded-lg font-bold transition-all"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            Limpiar
          </button>
        </div>
      </div>

      {result && (
        <div className="stat-card rounded-xl p-6">
          <h3 className="font-serif text-white text-lg mb-4">Resultados del Análisis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div
              className="p-4 rounded-xl"
              style={{
                background: result.apto ? "rgba(46,107,69,0.15)" : "rgba(204,150,51,0.15)",
                border: result.apto ? "1px solid rgba(76,175,125,0.3)" : "1px solid rgba(204,150,51,0.3)",
              }}
            >
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Estado del Suelo</p>
              <p
                className="text-xl font-bold"
                style={{ color: result.apto ? "#4CAF7D" : "#CC9633" }}
              >
                {result.estado}
              </p>
            </div>
            <div
              className="p-4 rounded-xl"
              style={{
                background: result.puntuacion >= 70 ? "rgba(46,107,69,0.15)" : "rgba(204,150,51,0.15)",
                border: result.puntuacion >= 70 ? "1px solid rgba(76,175,125,0.3)" : "1px solid rgba(204,150,51,0.3)",
              }}
            >
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Puntuación</p>
              <p
                className="text-xl font-bold"
                style={{ color: result.puntuacion >= 70 ? "#4CAF7D" : "#CC9633" }}
              >
                {result.puntuacion}/100
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Recomendaciones</p>
            {result.recomendaciones.length > 0 ? (
              <ul className="space-y-2">
                {result.recomendaciones.map((rec, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm"
                    style={{ color: "rgba(255,255,255,0.7)" }}
                  >
                    <span className="text-[#CC9633] mt-0.5">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm" style={{ color: "rgba(76,175,125,0.8)" }}>
                ¡El suelo está en condiciones óptimas para el cultivo!
              </p>
            )}
          </div>

          <div
            className="p-4 rounded-xl"
            style={{
              background: "rgba(204,150,51,0.1)",
              border: "1px solid rgba(204,150,51,0.2)",
            }}
          >
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              ⚠️ Este análisis es orientativo. Para un diagnóstico definitivo, consulta con un agrónomo certificado.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
