import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { SectionHeader } from "./shared";
import { FileDown, Calendar, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import logo from "../../../assets/cultiva-preciso-logo.png";

const CATEGORY_LABELS = {
  general: "General",
  siembra: "Siembra",
  poda: "Poda",
  cosecha: "Cosecha",
  riego: "Riego",
  plagas: "Plagas / Enf.",
  nutricion: "Nutrición",
};

const CATEGORY_COLORS = {
  general: "#B3B3B3",
  siembra: "#2E6B45",
  poda: "#CC9633",
  cosecha: "#CC9633",
  riego: "#6BAED6",
  plagas: "#F87171",
  nutricion: "#2E6B45",
};

export default function ViewReports({ cultivo, user }) {
  const ha = parseFloat(cultivo.hectareas) || 0;
  const plantas = ha ? Math.floor((ha * 10000) / 6) : 0;
  const today = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const [notes, setNotes] = useState({});
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      setLoadingNotes(false);
      return;
    }
    getDoc(doc(db, "calendar", user.uid))
      .then((snap) => {
        if (snap.exists()) setNotes(snap.data().calendarNotes ?? {});
      })
      .catch(console.error)
      .finally(() => setLoadingNotes(false));
  }, [user?.uid]);

  const sortedNotes = Object.entries(notes)
    .filter(([, arr]) => arr.length > 0)
    .sort(([a], [b]) => new Date(b) - new Date(a));

  const handleExportPDF = () => {
    setExporting(true);
    try {
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const W = 210,
        ml = 15,
        mr = 15,
        cw = W - ml - mr;
      let y = 0;

      const newPage = () => {
        pdf.addPage();
        y = 20;
      };
      const checkY = (needed = 10) => {
        if (y + needed > 275) newPage();
      };

      const GREEN = [46, 107, 69];
      const GOLD = [180, 120, 30];
      const DARK = [26, 17, 13];
      const DARKER = [18, 12, 8];
      const WHITE = [255, 255, 255];
      const BLACK = [30, 30, 30];
      const GRAY1 = [90, 90, 90];
      const GRAY2 = [140, 140, 140];
      const GRAY3 = [220, 220, 220];

      // ── HEADER oscuro ────────────────────────────────────────────────────────
      pdf.setFillColor(...DARKER);
      pdf.rect(0, 0, W, 42, "F");

      pdf.setFillColor(...GREEN);
      pdf.rect(0, 0, 6, 42, "F");

      // Logo círculo
      pdf.setFillColor(...WHITE);
      pdf.circle(ml + 10, 16, 9, "F");
      const imgSize = 14;

      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...WHITE);
      pdf.addImage(
        logo,
        "PNG",
        ml + 10 - imgSize / 2,
        16 - imgSize / 2,
        imgSize,
        imgSize,
      );

      // Nombre app
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...WHITE);
      pdf.text("CultivaPreciso", ml + 20, 15);

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(180, 180, 180);
      pdf.text("Reporte Técnico de Planificación de Cacao", ml + 20, 21);

      pdf.setDrawColor(...GOLD);
      pdf.setLineWidth(0.4);
      pdf.line(ml + 20, 24, W - mr, 24);

      pdf.setFontSize(8);
      pdf.setTextColor(180, 180, 180);
      pdf.text(`Finca: ${cultivo.nombre || "No especificada"}`, ml + 20, 29);
      pdf.text(
        `Municipio: ${cultivo.region || "No especificado"}`,
        ml + 20,
        34,
      );
      pdf.text(
        `Variedad: ${cultivo.variedad || "No especificada"}`,
        ml + 100,
        29,
      );
      pdf.text(
        `Fecha siembra: ${cultivo.fechaSiembra || "No definida"}`,
        ml + 100,
        34,
      );

      y = 52;

      // ── RESUMEN TÉCNICO ──────────────────────────────────────────────────────
      checkY(40);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...GOLD);
      pdf.text("RESUMEN TÉCNICO DE SIEMBRA", ml, y);
      y += 2;
      pdf.setDrawColor(...GOLD);
      pdf.setLineWidth(0.3);
      pdf.line(ml, y, ml + cw, y);
      y += 6;

      // Tarjetas blancas con borde
      const cardW = (cw - 8) / 3;
      const cards = [
        {
          title: "PLANTAS A SEMBRAR",
          value: plantas.toLocaleString(),
          sub: "Densidad Óptima",
        },
        {
          title: "ÁREA DEL LOTE",
          value: `${cultivo.hectareas} ha`,
          sub: `${(ha * 10000).toLocaleString()} m² Calculados`,
        },
        {
          title: "MARCO DE PLANTACIÓN",
          value: "6 m²",
          sub: "Distancia: 3m × 2m",
        },
      ];

      cards.forEach((card, i) => {
        const cx = ml + i * (cardW + 4);
        pdf.setFillColor(248, 248, 248);
        pdf.roundedRect(cx, y, cardW, 26, 2, 2, "F");
        pdf.setDrawColor(...GRAY3);
        pdf.setLineWidth(0.3);
        pdf.roundedRect(cx, y, cardW, 26, 2, 2, "S");
        // Borde superior verde
        pdf.setFillColor(...GREEN);
        pdf.rect(cx, y, cardW, 1.5, "F");
        // Título
        pdf.setFontSize(6.5);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...GOLD);
        pdf.text(card.title, cx + cardW / 2, y + 8, { align: "center" });
        // Valor
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...BLACK);
        pdf.text(card.value, cx + cardW / 2, y + 18, { align: "center" });
        // Sub
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...GRAY2);
        pdf.text(card.sub, cx + cardW / 2, y + 23, { align: "center" });
      });

      y += 34;

      // ── ESPECIFICACIONES ─────────────────────────────────────────────────────
      checkY(50);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...GOLD);
      pdf.text("ESPECIFICACIONES DE CULTIVO", ml, y);
      y += 2;
      pdf.setDrawColor(...GOLD);
      pdf.line(ml, y, ml + cw, y);
      y += 5;

      // Cabecera tabla verde
      pdf.setFillColor(...GREEN);
      pdf.rect(ml, y, cw, 7, "F");
      pdf.setFontSize(7.5);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...WHITE);
      pdf.text("VARIABLE DE CONTROL", ml + 3, y + 4.5);
      pdf.text("ESPECIFICACIÓN", ml + cw * 0.38, y + 4.5);
      pdf.text("ESTADO / DETALLE", ml + cw * 0.72, y + 4.5);
      y += 7;

      const specRows = [
        [
          "Variedad de Cacao",
          cultivo.variedad || "No especificada",
          "Clon de Alta Productividad",
        ],
        [
          "Separación Recomendada",
          "3 m entre filas × 2 m entre plantas",
          "Estándar Técnico Eficiente",
        ],
        [
          "Ubicación de Referencia",
          cultivo.region || "No especificada",
          "Zona del Catatumbo",
        ],
        ["Fecha de Siembra", cultivo.fechaSiembra || "No definida", "Estimada"],
        [
          "Plantas Estimadas",
          plantas.toLocaleString(),
          "Marco 6 m² por planta",
        ],
        [
          "Hoyos a Preparar",
          plantas.toLocaleString(),
          "Igual a plantas estimadas",
        ],
      ];

      specRows.forEach((row, i) => {
        checkY(8);
        pdf.setFillColor(
          i % 2 === 0 ? 255 : 245,
          i % 2 === 0 ? 255 : 247,
          i % 2 === 0 ? 255 : 245,
        );
        pdf.rect(ml, y, cw, 7, "F");
        pdf.setDrawColor(...GRAY3);
        pdf.setLineWidth(0.1);
        pdf.line(ml, y + 7, ml + cw, y + 7);
        pdf.setFontSize(7.5);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...BLACK);
        pdf.text(row[0], ml + 3, y + 4.5);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...GRAY1);
        pdf.text(row[1], ml + cw * 0.38, y + 4.5);
        pdf.setTextColor(...GRAY2);
        pdf.text(row[2], ml + cw * 0.72, y + 4.5);
        y += 7;
      });

      y += 8;

      // ── INSUMOS ──────────────────────────────────────────────────────────────
      checkY(40);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...GOLD);
      pdf.text("PROYECCIÓN DE INSUMOS (PRIMER MES)", ml, y);
      y += 2;
      pdf.setDrawColor(...GOLD);
      pdf.line(ml, y, ml + cw, y);
      y += 5;

      pdf.setFillColor(...GREEN);
      pdf.rect(ml, y, cw, 7, "F");
      pdf.setFontSize(7.5);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...WHITE);
      pdf.text("TIPO DE INSUMO", ml + 3, y + 4.5);
      pdf.text("FUNCIÓN TÉCNICA", ml + cw * 0.32, y + 4.5);
      pdf.text("CANTIDAD", ml + cw * 0.82, y + 4.5);
      y += 7;

      const insumos = [
        [
          "Abono orgánico base",
          "Nutrición radicular inicial durante el trasplante",
          `${(plantas * 2).toLocaleString()} kg`,
        ],
        [
          "Fungicida preventivo",
          "Protección fitosanitaria preventiva",
          `${(ha * 1.5).toFixed(1)} L`,
        ],
        [
          "Agua primer mes",
          "Riego localizado asistido para establecimiento óptimo",
          `${(ha * 500).toLocaleString()} L`,
        ],
      ];

      insumos.forEach((row, i) => {
        checkY(8);
        pdf.setFillColor(
          i % 2 === 0 ? 255 : 245,
          i % 2 === 0 ? 255 : 247,
          i % 2 === 0 ? 255 : 245,
        );
        pdf.rect(ml, y, cw, 7, "F");
        pdf.setDrawColor(...GRAY3);
        pdf.setLineWidth(0.1);
        pdf.line(ml, y + 7, ml + cw, y + 7);
        pdf.setFontSize(7.5);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...GREEN);
        pdf.text(row[0], ml + 3, y + 4.5);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...GRAY1);
        const funcLines = pdf.splitTextToSize(row[1], cw * 0.48);
        pdf.text(funcLines[0], ml + cw * 0.32, y + 4.5);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...BLACK);
        pdf.text(row[2], ml + cw * 0.82, y + 4.5);
        y += 7;
      });

      y += 8;

      // ── OBSERVACIONES ────────────────────────────────────────────────────────
      if (cultivo.notas) {
        checkY(20);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...GOLD);
        pdf.text("OBSERVACIONES", ml, y);
        y += 2;
        pdf.setDrawColor(...GOLD);
        pdf.line(ml, y, ml + cw, y);
        y += 5;

        const notasLines = pdf.splitTextToSize(cultivo.notas, cw - 6);
        pdf.setFillColor(248, 248, 248);
        pdf.setDrawColor(...GRAY3);
        pdf.roundedRect(ml, y - 2, cw, notasLines.length * 5 + 6, 2, 2, "FD");
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...GRAY1);
        pdf.text(notasLines, ml + 3, y + 3);
        y += notasLines.length * 5 + 10;
      }

      // ── BITÁCORA ─────────────────────────────────────────────────────────────
      if (sortedNotes.length > 0) {
        checkY(20);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...GOLD);
        pdf.text("NOTAS ADICIONALES DEL CALENDARIO", ml, y);
        y += 2;
        pdf.setDrawColor(...GOLD);
        pdf.line(ml, y, ml + cw, y);
        y += 6;

        sortedNotes.forEach(([fecha, arr]) => {
          const fechaFormateada = new Date(
            fecha + "T12:00:00",
          ).toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          });

          arr.forEach((n) => {
            checkY(18);
            const cat = CATEGORY_LABELS[n.cat] || n.cat;

            // Fila de encabezado nota
            pdf.setFillColor(240, 245, 240);
            pdf.rect(ml, y - 1, cw, 7, "F");
            pdf.setFontSize(8);
            pdf.setFont("helvetica", "bold");
            pdf.setTextColor(...GREEN);
            pdf.text(cat, ml + 3, y + 4);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(...GOLD);
            pdf.text(fechaFormateada, ml + cw - 3, y + 4, { align: "right" });
            y += 8;

            // Texto nota
            const noteLines = pdf.splitTextToSize(n.text, cw - 6);
            const noteH = noteLines.length * 4.5 + 6;
            pdf.setFillColor(250, 250, 250);
            pdf.setDrawColor(...GRAY3);
            pdf.setLineWidth(0.2);
            pdf.rect(ml, y - 2, cw, noteH, "FD");
            // Línea verde izquierda
            pdf.setFillColor(...GREEN);
            pdf.rect(ml, y - 2, 2, noteH, "F");
            pdf.setFontSize(7.5);
            pdf.setFont("helvetica", "normal");
            pdf.setTextColor(...GRAY1);
            pdf.text(noteLines, ml + 5, y + 2);
            y += noteH + 5;
          });
        });
      }

      // ── PIE DE PÁGINA oscuro ─────────────────────────────────────────────────
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFillColor(...DARKER);
        pdf.rect(0, 283, W, 14, "F");
        pdf.setDrawColor(...GREEN);
        pdf.setLineWidth(0.4);
        pdf.line(0, 283, W, 283);
        pdf.setFontSize(7);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(140, 140, 140);
        pdf.text("CultivaPreciso - Reporte Oficial de Plataforma Web", ml, 290);
        pdf.text(`Página ${i} de ${pageCount}`, W - mr, 290, {
          align: "right",
        });
      }

      const fileName = `reporte-${(cultivo.nombre || "finca").replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);
    } finally {
      setExporting(false);
    }
  };

  // ── Helper hex a rgb ───────────────────────────────────────────────────────
  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-3xl">
      <SectionHeader
        title="Reportes"
        sub="Resumen técnico de tu finca y bitácora de campo."
      />

      {!cultivo.hectareas ? (
        <div className="stat-card rounded-xl p-10 text-center">
          <span className="text-3xl">📋</span>
          <p className="text-white/40 text-sm mt-3">
            Registra los datos de tu cultivo para generar el reporte.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* ── Reporte técnico ── */}
          <div className="stat-card rounded-xl p-6 space-y-5">
            <div
              className="flex items-start justify-between pb-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div>
                <h3 className="font-serif text-white text-xl">
                  {cultivo.nombre || "Mi Finca"}
                </h3>
                <p className="text-white/40 text-sm mt-0.5">
                  Reporte técnico · {today}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-full text-xs font-bold text-[#4CAF7D] bg-[#2E6B45]/20">
                  Activo
                </div>
                <button
                  onClick={handleExportPDF}
                  disabled={exporting || loadingNotes}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                  style={{
                    background: "rgba(107,174,214,0.12)",
                    border: "1px solid rgba(107,174,214,0.25)",
                    color: "#6BAED6",
                  }}
                >
                  {exporting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />{" "}
                      Generando...
                    </>
                  ) : (
                    <>
                      <FileDown size={15} /> Exportar PDF
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Tabla */}
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-3">
                Datos del cultivo
              </p>
              <div className="space-y-1.5">
                {[
                  {
                    label: "Área total",
                    value: `${cultivo.hectareas} hectáreas`,
                  },
                  {
                    label: "Variedad",
                    value: cultivo.variedad || "No especificada",
                  },
                  {
                    label: "Región",
                    value: cultivo.region || "No especificada",
                  },
                  {
                    label: "Fecha de siembra",
                    value: cultivo.fechaSiembra || "No definida",
                  },
                  {
                    label: "Plantas estimadas",
                    value: plantas.toLocaleString(),
                  },
                  {
                    label: "Marco de plantación",
                    value: "3 m × 2 m (6 m² por planta)",
                  },
                  {
                    label: "Hoyos a preparar",
                    value: plantas.toLocaleString(),
                  },
                  {
                    label: "Abono orgánico req.",
                    value: `${(plantas * 2).toLocaleString()} kg`,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-2 px-3 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <span className="text-white/50 text-sm">{row.label}</span>
                    <span className="text-white text-sm font-semibold">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {cultivo.notas && (
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">
                  Observaciones
                </p>
                <div
                  className="p-3 rounded-lg text-white/60 text-sm leading-relaxed"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  {cultivo.notas}
                </div>
              </div>
            )}

            <p
              className="text-white/20 text-xs pt-2"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              Generado por CultivaPreciso · {today}
            </p>
          </div>

          {/* ── Bitácora ── */}
          <div className="stat-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <Calendar size={16} className="text-[#CC9633]" />
              <p className="text-white font-semibold text-sm">
                Bitácora de campo
              </p>
              {!loadingNotes && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full ml-auto"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.3)",
                  }}
                >
                  {sortedNotes.reduce((acc, [, arr]) => acc + arr.length, 0)}{" "}
                  notas
                </span>
              )}
            </div>

            {loadingNotes ? (
              <div className="flex items-center justify-center py-10 gap-2 text-white/30">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-sm">Cargando notas...</span>
              </div>
            ) : sortedNotes.length === 0 ? (
              <div className="text-center py-10">
                <span className="text-3xl">📓</span>
                <p className="text-white/30 text-sm mt-3">
                  Aún no hay notas registradas.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedNotes.map(([fecha, arr]) => {
                  const fechaFormateada = new Date(
                    fecha + "T12:00:00",
                  ).toLocaleDateString("es-CO", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  });
                  return (
                    <div key={fecha}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-white/30 capitalize">
                          {fechaFormateada}
                        </span>
                        <div
                          className="flex-1 h-px"
                          style={{ background: "rgba(255,255,255,0.05)" }}
                        />
                      </div>
                      <div className="space-y-2">
                        {arr.map((n) => (
                          <div
                            key={n.id}
                            className="flex gap-3 p-3 rounded-lg"
                            style={{
                              background: "rgba(255,255,255,0.02)",
                              borderLeft: `3px solid ${CATEGORY_COLORS[n.cat] || "#B3B3B3"}`,
                            }}
                          >
                            <span
                              className="text-xs px-2 py-0.5 rounded-full h-fit mt-0.5 shrink-0 font-medium"
                              style={{
                                background: `${CATEGORY_COLORS[n.cat]}18`,
                                color: CATEGORY_COLORS[n.cat] || "#B3B3B3",
                              }}
                            >
                              {CATEGORY_LABELS[n.cat] || n.cat}
                            </span>
                            <p className="text-white/60 text-sm leading-relaxed">
                              {n.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
