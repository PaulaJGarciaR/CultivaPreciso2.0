// src/components/dashboard/ViewCultivo.jsx

import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { SectionHeader } from "./shared";

const VARIEDADES = ["Híbrido", "TCS (Trinitario Colombia Selection)"];

export default function ViewCultivo({ cultivo, setCultivo, user }) {
  const [form,    setForm]    = useState({ ...cultivo });
  const [saved,   setSaved]   = useState(false);
  const [saving,  setSaving]  = useState(false);   // ← faltaba
  const [loading, setLoading] = useState(true);    // ← faltaba
  const [unidad,  setUnidad]  = useState("ha");

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
            <input
              className="form-input" type="text"
              placeholder="Ej: Teorama, Hacarí.."
              value={form.region || ""}
              onChange={e => set("region", e.target.value)}
            />
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
            {saved  ? "✓ Guardado correctamente"
            : saving ? "Guardando..."
            :          "Guardar datos"}
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
    </div>
  );
}