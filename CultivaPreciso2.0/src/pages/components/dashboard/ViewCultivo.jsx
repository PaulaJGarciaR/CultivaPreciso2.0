// src/components/dashboard/ViewCultivo.jsx

import { useState, useEffect, useRef } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { SectionHeader } from "./shared";

const VARIEDADES = ["Híbrido", "TCS (Trinitario Colombia Selection)"];

const MUNICIPIOS_CATATUMBO = [
  "Tibú",
  "El Tarra",
  "Sardinata",
  "Convención",
  "Teorama",
  "Hacarí",
  "San Calixto",
  "El Carmen",
  "Ocaña",
  "La Playa de Belén",
  "Ábrego",
];

export default function ViewCultivo({ cultivo, setCultivo, user }) {
  const [form,    setForm]    = useState({ ...cultivo });
  const [saved,   setSaved]   = useState(false);
  const [saving,  setSaving]  = useState(false);   // ← faltaba
  const [loading, setLoading] = useState(true);    // ← faltaba
  const [unidad,  setUnidad]  = useState("ha");
  const [show3D,  setShow3D]  = useState(false);
  const loadedRef = useRef(false);

  // ── Cargar datos desde Firestore ─────────────────────────────────────────
  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }

    const cargarDatos = async () => {
      try {
        const snap = await getDoc(doc(db, "cultivos", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          // Solo tomar los campos de ViewCultivo, ignorar lotes/calendarNotes
          const camposCultivo = {
            nombre:       data.nombre       ?? "",
            hectareas:    data.hectareas     ?? "",
            variedad:     data.variedad      ?? "",
            fechaSiembra: data.fechaSiembra  ?? "",
            region:       data.region        ?? "",
            notas:        data.notas         ?? "",
          };
          setForm(camposCultivo);
          setCultivo(camposCultivo);
        }
      } catch (err) {
        console.error("Error cargando cultivo:", err);
      } finally {
        setLoading(false);
        loadedRef.current = true;
      }
    };

    cargarDatos();
  }, [user?.uid]);

  // ── Cálculo central ───────────────────────────────────────────────────────
  const areaHa = (() => {
    const raw = parseFloat(form.hectareas) || 0;
    return unidad === "m2" ? raw / 10000 : raw;
  })();

  const plantas = areaHa ? Math.floor(areaHa * 10000 / 6) : 0;

  const insumos = plantas ? {
    abono:     Math.round(plantas * 2),
    fungicida: Math.round(areaHa * 1.5 * 10) / 10,
    agua:      Math.round(areaHa * 500),
  } : null;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!user?.uid || loading || !loadedRef.current) return;
    const areaNum = parseFloat(form.hectareas) || 0;
    const areaGuardada = unidad === "m2" && areaNum ? String(areaNum / 10000) : form.hectareas ?? "";
    const datosAGuardar = {
      nombre:       form.nombre       ?? "",
      hectareas:    areaGuardada,
      variedad:     form.variedad      ?? "",
      fechaSiembra: form.fechaSiembra  ?? "",
      region:       form.region        ?? "",
      notas:        form.notas         ?? "",
      uid:          user.uid,
      actualizadoEn: new Date().toISOString(),
    };
    setSaving(true);
    const timeout = setTimeout(async () => {
      try {
        await setDoc(doc(db, "cultivos", user.uid), datosAGuardar, { merge: true });
        setCultivo(datosAGuardar);
        setSaved(true);
        setTimeout(() => setSaved(false), 1800);
      } catch (err) {
        console.error("Error guardando cultivo:", err);
      } finally {
        setSaving(false);
      }
    }, 900);
    return () => clearTimeout(timeout);
  }, [form, unidad, user?.uid, loading, setCultivo]);

  const handleSave = async () => {
    if (!user?.uid) return;
    setSaving(true);

    const datosAGuardar = {
      nombre:       form.nombre       ?? "",
      hectareas:    areaHa ? String(areaHa) : "",
      variedad:     form.variedad      ?? "",
      fechaSiembra: form.fechaSiembra  ?? "",
      region:       form.region        ?? "",
      notas:        form.notas         ?? "",
      uid:          user.uid,
      actualizadoEn: new Date().toISOString(),
    };

    try {
      // merge: true → no sobreescribe lotes ni calendarNotes del calendario
      await setDoc(doc(db, "cultivos", user.uid), datosAGuardar, { merge: true });
      setCultivo(datosAGuardar);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error("Error guardando cultivo:", err);
      alert("Error al guardar. Revisa tu conexión.");
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-white/40 text-sm">Cargando datos de tu finca...</p>
      </div>
    );
  }

  const areaLabel       = unidad === "ha" ? "Área a sembrar (hectáreas)" : "Área a sembrar (metros cuadrados)";
  const areaPlaceholder = unidad === "ha" ? "Ej: 5.5" : "Ej: 55000";

  return (
    <div className="space-y-5 max-w-4xl">
      <SectionHeader
        title="Mi Cultivo"
        sub="Registra los datos de tu finca. Puedes ingresar el área en hectáreas o metros cuadrados."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── Formulario ── */}
        <div className="stat-card rounded-xl p-5 space-y-4">
          <h3 className="font-serif text-white text-lg mb-1">Datos de la finca</h3>

          <div>
            <label className="field-label">Nombre de la finca</label>
            <input
              className="form-input" type="text" placeholder="Ej: El Paraíso"
              value={form.nombre || ""} onChange={e => set("nombre", e.target.value)}
            />
          </div>

          <div>
            <label className="field-label">{areaLabel}</label>
            <div className="flex gap-2 mb-2">
              {["ha", "m2"].map(u => (
                <button
                  key={u}
                  onClick={() => { setUnidad(u); set("hectareas", ""); }}
                  className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: unidad === u ? "#2E6B45" : "rgba(255,255,255,0.05)",
                    color:      unidad === u ? "white"   : "rgba(255,255,255,0.4)",
                    border:     unidad === u ? "none"    : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {u === "ha" ? "Hectáreas" : "Metros²"}
                </button>
              ))}
            </div>
            <input
              className="form-input" type="number" min="0.1"
              step={unidad === "ha" ? "0.1" : "100"}
              placeholder={areaPlaceholder}
              value={form.hectareas || ""}
              onChange={e => set("hectareas", e.target.value)}
            />
            <p className="text-white/25 text-[10px] mt-1">
              Separación estándar de cacao: 6 m² por planta (3 m × 2 m)
            </p>
          </div>

          <div>
            <label className="field-label">Variedad de cacao</label>
            <select
              className="form-input"
              value={form.variedad || ""}
              onChange={e => set("variedad", e.target.value)}
            >
              <option value="">— Seleccionar variedad —</option>
              {VARIEDADES.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">Fecha estimada de siembra</label>
            <input
              className="form-input" type="date"
              value={form.fechaSiembra || ""}
              onChange={e => set("fechaSiembra", e.target.value)}
            />
          </div>

          <div>
            <label className="field-label">Municipio del Catatumbo</label>
            <select
              className="form-input"
              value={form.region || ""}
              onChange={e => set("region", e.target.value)}
            >
              <option value="">— Seleccionar municipio —</option>
              {MUNICIPIOS_CATATUMBO.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label">Notas adicionales</label>
            <textarea
              className="form-input" rows={3}
              placeholder="Condiciones especiales del terreno, observaciones..."
              value={form.notas || ""}
              onChange={e => set("notas", e.target.value)}
              style={{ resize: "vertical" }}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 rounded-lg text-sm font-bold transition-all"
            style={{
              background: saved  ? "rgba(46,107,69,0.6)"
                        : saving ? "rgba(46,107,69,0.4)"
                        :          "#2E6B45",
              color:  "white",
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saved  ? "✓ Guardado automáticamente"
            : saving ? "Guardando automáticamente..."
            :          "Guardado automático activo"}
          </button>
        </div>

        {/* ── Panel de resultados ── */}
        <div className="space-y-4">
          <div
            className="stat-card rounded-xl p-5"
            style={{ border: plantas ? "1px solid rgba(46,107,69,0.4)" : undefined }}
          >
            <h3 className="font-serif text-white text-lg mb-4">Cálculo de siembra</h3>

            {!form.hectareas ? (
              <div className="flex flex-col items-center py-10 text-center">
                <span className="text-4xl mb-3">🌱</span>
                <p className="text-white/40 text-sm">
                  Ingresa el área de tu terreno para calcular automáticamente.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {unidad === "m2" && areaHa > 0 && (
                  <div
                    className="rounded-lg px-3 py-2 text-xs text-white/50 flex items-center justify-between"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <span>{parseFloat(form.hectareas).toLocaleString()} m²</span>
                    <span className="text-white/25 mx-2">→</span>
                    <span className="text-white/70 font-semibold">{areaHa.toFixed(4)} ha</span>
                  </div>
                )}

                <div
                  className="rounded-lg p-4"
                  style={{ background: "rgba(46,107,69,0.15)", border: "1px solid rgba(46,107,69,0.3)" }}
                >
                  <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Plantas a sembrar</p>
                  <p className="font-serif text-[#4CAF7D] text-4xl font-bold">{plantas.toLocaleString()}</p>
                  <p className="text-white/30 text-xs mt-1">
                    {areaHa.toFixed(4)} ha × 10.000 m² ÷ 6 m² = {plantas.toLocaleString()} plantas
                  </p>
                  <button
                    onClick={() => setShow3D(true)}
                    className="w-full mt-3 py-2 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: "rgba(204,150,51,0.15)",
                      border: "1px solid rgba(204,150,51,0.3)",
                      color: "#CC9633",
                    }}
                  >
                    🌳 Ver modelo 3D del cultivo
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Hoyos a preparar", val: plantas.toLocaleString() },
                    { label: "Área por planta",   val: "6 m²" },
                  ].map(d => (
                    <div key={d.label} className="rounded-lg p-3 text-center"
                      style={{ background: "rgba(255,255,255,0.04)" }}>
                      <p className="text-white font-bold text-xl">{d.val}</p>
                      <p className="text-white/40 text-[10px] mt-0.5">{d.label}</p>
                    </div>
                  ))}
                </div>

                {insumos && (
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Insumos estimados</p>
                    <div className="space-y-2">
                      {[
                        { label: "Abono orgánico base",  val: `${insumos.abono.toLocaleString()} kg`, ico: "🧪" },
                        { label: "Fungicida preventivo", val: `${insumos.fungicida} L`,               ico: "💧" },
                        { label: "Agua primer mes",      val: `${insumos.agua.toLocaleString()} L`,   ico: "🚿" },
                      ].map(ins => (
                        <div key={ins.label}
                          className="flex items-center justify-between px-3 py-2 rounded-lg"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                        >
                          <span className="text-white/60 text-xs flex items-center gap-2">
                            <span>{ins.ico}</span>{ins.label}
                          </span>
                          <span className="text-white text-xs font-semibold">{ins.val}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-white/20 text-[10px] mt-2">* Estimados referenciales. Consultar con agrónomo.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="stat-card rounded-xl p-4">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Marco de plantación recomendado</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Entre filas",   val: "3 m"  },
                { label: "Entre plantas", val: "2 m"  },
                { label: "Área/planta",   val: "6 m²" },
              ].map(d => (
                <div key={d.label} className="rounded-lg py-3 px-2"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  <p className="text-[#CC9633] font-bold text-base">{d.val}</p>
                  <p className="text-white/35 text-[10px] mt-0.5 leading-tight">{d.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal Visualizador 3D ── */}
      {show3D && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={() => setShow3D(false)}
        >
          <div
            className="rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh]"
            style={{ background: "#1A110D", border: "1px solid rgba(255,255,255,0.1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <h3 className="font-serif text-white text-xl">Modelo 3D del Cultivo</h3>
                <p className="text-white/50 text-xs mt-1">
                  {plantas.toLocaleString()} plantas en {areaHa.toFixed(4)} hectáreas
                </p>
              </div>
              <button
                onClick={() => setShow3D(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-auto" style={{ maxHeight: "calc(90vh - 80px)" }}>
              <PlantVisualization3D plantas={plantas} areaHa={areaHa} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Componente Visualizador 3D ─────────────────────────────────────────────
function PlantVisualization3D({ plantas, areaHa }) {
  // Calcular filas y columnas basado en el área
  const filas = Math.ceil(Math.sqrt(plantas));
  const columnas = Math.ceil(plantas / filas);

  // Limitar para rendimiento visual
  const maxFilas = Math.min(filas, 30);
  const maxColumnas = Math.min(columnas, 30);
  const plantasMostrar = Math.min(plantas, maxFilas * maxColumnas);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
          <p className="text-white/50 text-xs">Filas</p>
          <p className="text-white font-bold text-lg">{filas}</p>
        </div>
        <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
          <p className="text-white/50 text-xs">Columnas</p>
          <p className="text-white font-bold text-lg">{columnas}</p>
        </div>
        <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
          <p className="text-white/50 text-xs">Separación</p>
          <p className="text-white font-bold text-lg">3m × 2m</p>
        </div>
      </div>

      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          height: "400px",
          background: "linear-gradient(135deg, #1a3d28 0%, #2d5a3f 50%, #1a3d28 100%)",
          border: "1px solid rgba(76,175,125,0.3)",
        }}
      >
        {/* Grid isométrico simulado */}
        <svg
          viewBox={`0 0 ${maxColumnas * 40} ${maxFilas * 35}`}
          className="w-full h-full"
          style={{ margin: "20px auto" }}
        >
          {/* Líneas de guía */}
          {[...Array(maxFilas)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={i * 35}
              x2={maxColumnas * 40}
              y2={i * 35}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.5"
            />
          ))}
          {[...Array(maxColumnas)].map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * 40}
              y1="0"
              x2={i * 40}
              y2={maxFilas * 35}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.5"
            />
          ))}

          {/* Plantas */}
          {[...Array(plantasMostrar)].map((_, i) => {
            const fila = Math.floor(i / maxColumnas);
            const columna = i % maxColumnas;
            const x = columna * 40 + 20;
            const y = fila * 35 + 17;

            return (
              <g key={i}>
                {/* Sombra */}
                <ellipse
                  cx={x}
                  cy={y + 8}
                  rx="8"
                  ry="4"
                  fill="rgba(0,0,0,0.3)"
                />
                {/* Tronco */}
                <rect
                  x={x - 2}
                  y={y - 5}
                  width="4"
                  height="10"
                  fill="#8B4513"
                />
                {/* Copa del árbol */}
                <circle
                  cx={x}
                  cy={y - 8}
                  r="10"
                  fill="#4CAF7D"
                  stroke="#2E6B45"
                  strokeWidth="1"
                />
                {/* Detalles de la copa */}
                <circle
                  cx={x - 3}
                  cy={y - 10}
                  r="4"
                  fill="#66BB6A"
                  opacity="0.7"
                />
                <circle
                  cx={x + 3}
                  cy={y - 6}
                  r="3"
                  fill="#81C784"
                  opacity="0.6"
                />
              </g>
            );
          })}
        </svg>

        {/* Leyenda */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ background: "#4CAF7D", border: "1px solid #2E6B45" }}
              />
              <span className="text-white/70 text-xs">Planta de cacao</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ background: "#8B4513" }} />
              <span className="text-white/70 text-xs">Tronco</span>
            </div>
          </div>
          {plantas > plantasMostrar && (
            <p className="text-white/50 text-xs">
              Mostrando {plantasMostrar.toLocaleString()} de {plantas.toLocaleString()} plantas
            </p>
          )}
        </div>
      </div>

      <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.03)" }}>
        <p className="text-white/40 text-xs leading-relaxed">
          <strong className="text-white/60">Nota:</strong> Esta es una representación visual simplificada del patrón de siembra.
          En la práctica, las plantas se distribuyen en un sistema de 3m entre filas y 2m entre plantas,
          lo que da un área de 6m² por planta. El modelo muestra una vista isométrica aproximada del cultivo.
        </p>
      </div>
    </div>
  );
}