import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase";

// ─── Paleta ────────────────────────────────────────────────────────────────────
const C = {
  bg: "#1A110D",
  bgDark: "#120C08",
  bgCard: "rgba(255,255,255,0.03)",
  bgSubtle: "#0D0D0D",
  green: "#2E6B45",
  greenLight: "rgba(46,107,69,0.18)",
  greenGlow: "rgba(46,107,69,0.35)",
  gold: "#CC9633",
  goldLight: "rgba(204,150,51,0.15)",
  goldGlow: "rgba(204,150,51,0.30)",
  white: "#FFFFFF",
  gray1: "#B3B3B3",
  gray2: "#666666",
  gray3: "#404040",
  border: "#1A1A1A",
  red: "#F87171",
  redLight: "rgba(248,113,113,0.15)",
  blue: "#6BAED6",
  blueLight: "rgba(107,174,214,0.18)",
  purple: "#B68FD4",
  purpleLight: "rgba(182,143,212,0.18)",
};

// ─── Constantes ────────────────────────────────────────────────────────────────
const LAT = 8.5833;
const LON = -73.1667;
const GDD_BASE = 15;
const GDD_CAP = 35;

const MONTHS = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];
const MONTHS_SHORT = [
  "Ene","Feb","Mar","Abr","May","Jun",
  "Jul","Ago","Sep","Oct","Nov","Dic",
];
const WEEKDAYS = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];

const VARIEDAD_MAP = {
  Híbrido: "CCN-51",
  "TCS (Trinitario Colombia Selection)": "FEC-2",
};
const DEFAULT_VARIETY = "CCN-51";

// ─── Iconos SVG ────────────────────────────────────────────────────────────────
const Icon = {
  // Planta / cultivo
  Plant: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V12"/><path d="M12 12C12 12 7 10 7 5a5 5 0 0 1 10 0c0 5-5 7-5 7z"/>
    </svg>
  ),
  // Semilla / siembra
  Seed: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="12" rx="5" ry="8"/><path d="M12 4V2"/><path d="M12 22v-2"/>
    </svg>
  ),
  // Vivero / plántula
  Seedling: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22V12"/><path d="M12 12s-4-2-4-6a4 4 0 0 1 8 0c0 4-4 6-4 6z"/>
      <path d="M6 18s2-3 6-3 6 3 6 3"/>
    </svg>
  ),
  // Cosecha / fruto
  Harvest: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8 2 5 6 5 10c0 5 7 12 7 12s7-7 7-12c0-4-3-8-7-8z"/>
      <path d="M12 7v5"/><circle cx="12" cy="13" r="1" fill={color}/>
    </svg>
  ),
  // Tijera / poda
  Scissors: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
      <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
      <line x1="8.12" y1="8.12" x2="12" y2="12"/>
    </svg>
  ),
  // Gota / riego
  Droplet: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
  ),
  // Lluvia
  CloudRain: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <line x1="16" y1="13" x2="16" y2="21"/><line x1="8" y1="13" x2="8" y2="21"/>
      <line x1="12" y1="15" x2="12" y2="23"/>
      <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/>
    </svg>
  ),
  // Advertencia / plagas
  AlertTriangle: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  // Nutrición / hoja
  Leaf: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-8 2s4 0 6 2c0 3-4 7-9 7"/>
    </svg>
  ),
  // General / círculo info
  Info: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  // Estrella / recomendación
  Star: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  // Flor / floración
  Flower: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 7.5a4.5 4.5 0 1 1 4.5 7.794A4.5 4.5 0 1 1 12 19.794a4.5 4.5 0 1 1-4.5-4.5A4.5 4.5 0 1 1 12 7.5z"/>
      <circle cx="12" cy="12" r="2"/>
      <path d="M12 7.5V2"/><path d="M7.5 12H2"/><path d="M12 16.5V22"/><path d="M16.5 12H22"/>
    </svg>
  ),
  // Engranaje / postcosecha
  Settings: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  // Cacao / producción continua
  Package: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  // Termómetro / temperatura
  Thermometer: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
    </svg>
  ),
  // Sol / tiempo despejado
  Sun: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  // Nublado parcial
  CloudSun: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/>
      <path d="m19.07 4.93-1.41 1.41"/>
      <path d="M15.947 12.650a4 4 0 0 0-5.925-4.128"/>
      <path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6z"/>
    </svg>
  ),
  // Nublado
  Cloud: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"/>
    </svg>
  ),
  // Tormenta
  CloudLightning: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 16.326A7 7 0 1 1 15.4 6H16a5 5 0 0 1 1 9.9"/>
      <path d="m13 12-3 5h4l-3 5"/>
    </svg>
  ),
  // Nieve
  CloudSnow: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"/>
      <line x1="8" y1="16" x2="8.01" y2="16"/><line x1="8" y1="20" x2="8.01" y2="20"/>
      <line x1="12" y1="18" x2="12.01" y2="18"/><line x1="12" y1="22" x2="12.01" y2="22"/>
      <line x1="16" y1="16" x2="16.01" y2="16"/><line x1="16" y1="20" x2="16.01" y2="20"/>
    </svg>
  ),
  // Niebla
  CloudFog: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
      <line x1="16" y1="17" x2="16" y2="17.01"/><line x1="8" y1="17" x2="12" y2="17"/>
      <line x1="16" y1="21" x2="16" y2="21.01"/><line x1="8" y1="21" x2="12" y2="21"/>
    </svg>
  ),
  // Calendario
  Calendar: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  // Portapapeles / exportar
  Clipboard: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  ),
  // Check / guardado
  Check: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  // Cerrar / X
  X: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  // Candado / bloqueado
  Lock: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  // Viento
  Wind: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
    </svg>
  ),
  // Corazón / salud
  Heart: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  // Flechas navegación
  ChevronLeft: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  ChevronRight: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  // Idea / consejo
  Lightbulb: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/>
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>
    </svg>
  ),
  // Mapa / región
  MapPin: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  // Alerta suave
  AlertCircle: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  // Tendencia / ETo
  TrendingUp: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  // Reloj
  Clock: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  // Wifi off / sin conexión
  WifiOff: ({ size = 14, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23"/>
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
      <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
    </svg>
  ),
};

// Mapa WMO code → componente icono
function WeatherIcon({ code, size = 14, color = C.gray1 }) {
  if (code === 0) return <Icon.Sun size={size} color={color} />;
  if (code <= 2) return <Icon.CloudSun size={size} color={color} />;
  if (code === 3) return <Icon.Cloud size={size} color={color} />;
  if (code <= 48) return <Icon.CloudFog size={size} color={color} />;
  if (code <= 67) return <Icon.CloudRain size={size} color={color} />;
  if (code <= 77) return <Icon.CloudSnow size={size} color={color} />;
  if (code <= 82) return <Icon.CloudRain size={size} color={color} />;
  return <Icon.CloudLightning size={size} color={color} />;
}

// ─── Icono por fase fenológica ─────────────────────────────────────────────────
function PhaseIcon({ phaseId, size = 18, color = "currentColor" }) {
  switch (phaseId) {
    case "germinacion": return <Icon.Seed size={size} color={color} />;
    case "vivero":      return <Icon.Seedling size={size} color={color} />;
    case "transplante": return <Icon.Plant size={size} color={color} />;
    case "crecimiento": return <Icon.Leaf size={size} color={color} />;
    case "floracion":   return <Icon.Flower size={size} color={color} />;
    case "desarrollo":  return <Icon.Harvest size={size} color={color} />;
    case "cosecha":     return <Icon.Harvest size={size} color={color} />;
    case "postcosecha": return <Icon.Settings size={size} color={color} />;
    case "produccion":  return <Icon.Package size={size} color={color} />;
    default:            return <Icon.Plant size={size} color={color} />;
  }
}

const VARIETIES = {
  "CCN-51": {
    label: "CCN-51 (Híbrido)",
    color: C.gold,
    gddPhases: [
      { id:"germinacion", label:"Germinación",           gddStart:0,     gddEnd:350,   color:C.green, tip:"Humedad constante 70–80%. T° óptima 25–28°C. Germina rápido: 12–15 días a 27°C." },
      { id:"vivero",      label:"Vivero",                gddStart:350,   gddEnd:2500,  color:C.green, tip:"Riego 2×/día. Sombrío 50%. Tolerante a trips." },
      { id:"transplante", label:"Trasplante",            gddStart:2500,  gddEnd:3000,  color:C.gold,  tip:"Trasplantar al inicio de lluvias. Distancia 3×3m. Plateo y tutoreo." },
      { id:"crecimiento", label:"Crecimiento vegetativo",gddStart:3000,  gddEnd:8500,  color:C.blue,  tip:"Poda de formación cada 90 días. NPK 25-4-24 al inicio de cada ciclo." },
      { id:"floracion",   label:"Floración",             gddStart:8500,  gddEnd:9500,  color:C.gold,  tip:"Floración abundante. No aplicar fungicidas sistémicos. Favorecer polinizadores." },
      { id:"desarrollo",  label:"Desarrollo del fruto",  gddStart:9500,  gddEnd:11800, color:C.gold,  tip:"Monitorear Monilia semanalmente. Tolerancia moderada." },
      { id:"cosecha",     label:"Cosecha",               gddStart:11800, gddEnd:12200, color:C.gold,  tip:"Mazorca madura: amarillo intenso. No dejar más de 3 días tras madurez." },
      { id:"postcosecha", label:"Post-cosecha",          gddStart:12200, gddEnd:14500, color:C.gray1, tip:"Poda fitosanitaria. Abono orgánico. Retirar residuos del cultivo." },
      { id:"produccion",  label:"Producción continua",   gddStart:14500, gddEnd:99999, color:C.gold,  tip:"Cosechas cada 4–5 meses. Puede producir 2.0–2.5 t/ha/año bien manejado." },
    ],
  },
  "FEC-2": {
    label: "TCS / FEC-2 (Trinitario)",
    color: C.green,
    gddPhases: [
      { id:"germinacion", label:"Germinación",           gddStart:0,     gddEnd:380,   color:C.green, tip:"Variedad adaptada al Catatumbo. Germina en 14–17 días." },
      { id:"vivero",      label:"Vivero",                gddStart:380,   gddEnd:2600,  color:C.green, tip:"Alta rusticidad. Tolera variaciones de temperatura del Catatumbo." },
      { id:"transplante", label:"Trasplante",            gddStart:2600,  gddEnd:3100,  color:C.gold,  tip:"Adaptado a suelos ácidos del Catatumbo. pH 5.5–6.5 óptimo." },
      { id:"crecimiento", label:"Crecimiento vegetativo",gddStart:3100,  gddEnd:9000,  color:C.blue,  tip:"Rústico y vigoroso. Poda de formación frecuente (cada 75 días)." },
      { id:"floracion",   label:"Floración",             gddStart:9000,  gddEnd:10000, color:C.gold,  tip:"Floración dispersa a lo largo del año. Facilita producción escalonada." },
      { id:"desarrollo",  label:"Desarrollo del fruto",  gddStart:10000, gddEnd:12500, color:C.gold,  tip:"Buen comportamiento frente a Phytophthora. Monitorear Monilia." },
      { id:"cosecha",     label:"Cosecha",               gddStart:12500, gddEnd:12900, color:C.gold,  tip:"Mazorca grande, color amarillo-verde al madurar. Rendimiento medio-alto." },
      { id:"postcosecha", label:"Post-cosecha",          gddStart:12900, gddEnd:15500, color:C.gray1, tip:"Fermentación 5–6 días. Seco rápido por baja humedad relativa del grano." },
      { id:"produccion",  label:"Producción continua",   gddStart:15500, gddEnd:99999, color:C.gold,  tip:"1.5–2.0 t/ha/año. Excelente relación costo-beneficio en el Catatumbo." },
    ],
  },
};

const CATEGORIES = {
  general:   { label:"General",       color:C.gray1, bg:`rgba(179,179,179,0.12)`, Icon: () => <Icon.Info size={10} color={C.gray1}/> },
  siembra:   { label:"Siembra",       color:C.green, bg:C.greenLight,             Icon: () => <Icon.Seed size={10} color={C.green}/> },
  poda:      { label:"Poda",          color:C.gold,  bg:C.goldLight,              Icon: () => <Icon.Scissors size={10} color={C.gold}/> },
  cosecha:   { label:"Cosecha",       color:C.gold,  bg:C.goldLight,              Icon: () => <Icon.Harvest size={10} color={C.gold}/> },
  riego:     { label:"Riego",         color:C.blue,  bg:C.blueLight,              Icon: () => <Icon.Droplet size={10} color={C.blue}/> },
  plagas:    { label:"Plagas / Enf.", color:C.red,   bg:C.redLight,               Icon: () => <Icon.AlertTriangle size={10} color={C.red}/> },
  nutricion: { label:"Nutrición",     color:C.green, bg:C.greenLight,             Icon: () => <Icon.Leaf size={10} color={C.green}/> },
};

const REC_STYLE = {
  riego:    { color:C.blue,  bg:C.blueLight,                       Icon: () => <Icon.Droplet size={10} color={C.blue}/> },
  lluvia:   { color:C.blue,  bg:"rgba(107,174,214,0.10)",          Icon: () => <Icon.CloudRain size={10} color={C.blue}/> },
  cosecha:  { color:C.gold,  bg:C.goldLight,                       Icon: () => <Icon.Harvest size={10} color={C.gold}/> },
  poda:     { color:C.gold,  bg:C.goldLight,                       Icon: () => <Icon.Scissors size={10} color={C.gold}/> },
  nutricion:{ color:C.green, bg:C.greenLight,                      Icon: () => <Icon.Leaf size={10} color={C.green}/> },
  fase:     { color:C.gold,  bg:C.goldLight,                       Icon: () => <Icon.Star size={10} color={C.gold}/> },
  plagas:   { color:C.red,   bg:C.redLight,                        Icon: () => <Icon.AlertTriangle size={10} color={C.red}/> },
};

// ─── Utilidades ────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const dk = (y,m,d) =>
  `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

function calcDayGDD(tmax,tmin){
  const avg=(Math.min(tmax,GDD_CAP)+Math.max(tmin,GDD_BASE))/2;
  return Math.max(0,avg-GDD_BASE);
}
function getAccumGDD(plantingDate,date,weatherMap){
  let gdd=0;
  for(let d=new Date(plantingDate);d<new Date(date);d.setDate(d.getDate()+1)){
    const w=weatherMap[fmtDate(d)];
    gdd+=w?calcDayGDD(w.temperature_2m_max,w.temperature_2m_min):calcDayGDD(27,20);
  }
  return Math.round(gdd);
}
function getDaysSince(plantingDate,date){
  return Math.max(0,Math.floor((new Date(date)-new Date(plantingDate))/86400000));
}
function getPhaseByGDD(accumGDD,variety){
  const phases=VARIETIES[variety]?.gddPhases||VARIETIES[DEFAULT_VARIETY].gddPhases;
  return phases.find(p=>accumGDD>=p.gddStart&&accumGDD<p.gddEnd)||phases[phases.length-1];
}
function isInWindow(daysSince,base,interval,windowDays=5){
  if(daysSince<base)return false;
  return(daysSince-base)%interval<windowDays;
}
function getRolling7DayRain(date,weatherMap){
  let total=0,count=0;
  for(let i=6;i>=0;i--){
    const d=new Date(date);d.setDate(d.getDate()-i);
    const w=weatherMap[fmtDate(d)];
    if(w){total+=w.precipitation_sum||0;count++;}
  }
  return count>0?total:null;
}
function getPlaguaRisk(weather,accumGDD,variety){
  if(!weather)return null;
  const{precipitation_sum:rain=0,temperature_2m_max:tmax=28,temperature_2m_min:tmin=20}=weather;
  const tAvg=(tmax+tmin)/2;
  const phases=VARIETIES[variety]?.gddPhases||VARIETIES[DEFAULT_VARIETY].gddPhases;
  const frutoPhase=phases.find(p=>p.id==="desarrollo");
  if(!frutoPhase||accumGDD<frutoPhase.gddStart)return{level:"bajo"};
  if(tAvg>=20&&tAvg<=28&&rain>8)return{level:"alta"};
  if(tAvg>=20&&tAvg<=28&&rain>3)return{level:"media"};
  return{level:"bajo"};
}

// ─── Motor agronómico ──────────────────────────────────────────────────────────
function getRiegoRec(daysSince,weather){
  if(!weather)return null;
  const{precipitation_sum:rain=0,et0_fao_evapotranspiration:et0=3.5,temperature_2m_max:tmax=28}=weather;
  const deficit=et0-rain;
  const calor=tmax>33?" Calor extremo — regar antes de las 7am.":tmax>30?" Regar en horas frescas.":"";
  const thresholds={0:1.0,20:1.0,150:1.5,180:2.0,540:1.5,600:2.0,760:2.5,900:2.0};
  const keys=Object.keys(thresholds).map(Number).sort((a,b)=>b-a);
  const threshold=thresholds[keys.find(k=>daysSince>=k)]??2.0;
  const litersCalc=Math.round(deficit*10.5);
  if(deficit>threshold)return{type:"riego",text:`Riego necesario. Déficit ${deficit.toFixed(1)}mm (ETo ${et0.toFixed(1)} − lluvia ${rain.toFixed(0)}mm). Dosis ~${litersCalc}L/árbol.${calor}`,urgency:deficit>5?"alta":"media"};
  if(rain>20)return{type:"lluvia",text:`Lluvia abundante (${rain.toFixed(0)}mm). Verificar drenaje. No regar hoy.`,urgency:"info"};
  if(rain>=et0*0.8)return{type:"lluvia",text:`Lluvia suficiente (${rain.toFixed(0)}mm). Sin riego adicional.`,urgency:"info"};
  return null;
}
function getPlagaRecs(daysSince,weather,rolling7,variety){
  if(!weather)return[];
  const{precipitation_sum:rain=0,temperature_2m_max:tmax=28,temperature_2m_min:tmin=20}=weather;
  const tAvg=(tmax+tmin)/2;const recs=[];
  if(daysSince<150&&rain>10&&tmax>26)recs.push({type:"plagas",urgency:"alta",text:`Riesgo damping-off. Lluvia ${rain.toFixed(0)}mm + calor. Mejorar drenaje. Aplicar Trichoderma harzianum (5g/L).`});
  if(daysSince>500&&tAvg>=20&&tAvg<=28){
    const rainRisk=rolling7!=null?rolling7:rain*3;
    if(rainRisk>25){const nivel=rainRisk>45?"alta":"media";recs.push({type:"plagas",urgency:nivel,text:`Riesgo ${nivel} Monilia (lluvia acum. 7d: ${rolling7?.toFixed(0)??"—"}mm, T ${tAvg.toFixed(0)}°C). ${nivel==="alta"?"Aplicar Cobre metalaxil 2g/L. Retirar mazorcas enfermas.":"Inspeccionar mazorcas. Poda de saneamiento al día."}`});}
  }
  if(daysSince>300&&rain>8&&tAvg>=18&&tAvg<=25)recs.push({type:"plagas",urgency:"alta",text:`Condiciones óptimas Phytophthora (lluvia ${rain.toFixed(0)}mm, T ${tAvg.toFixed(0)}°C). Metalaxil+Mancozeb 2.5g/L. Mejorar drenaje.`});
  return recs;
}
const FERTILIZATION_PLAN=[
  {fromDay:28,toDay:32,phaseIds:["vivero"],text:"Fertilización vivero día 30: DAP (18-46-0) — 1g/plántula. Estimula desarrollo radicular."},
  {fromDay:58,toDay:62,phaseIds:["vivero"],text:"Foliar vivero día 60: Urea 0.5% (5g/L). Aplicar en la mañana. Estimula brotación."},
  {fromDay:88,toDay:92,phaseIds:["vivero"],text:"Vivero día 90: NPK 10-30-10 — 2g/plántula. Favorece raíces antes del trasplante."},
  {fromDay:118,toDay:122,phaseIds:["vivero"],text:"Pre-trasplante: Urea 46% — 1.5g/plántula + Boro (Bórax 0.3g/L) foliar."},
  {fromDay:178,toDay:183,phaseIds:["transplante","crecimiento"],text:"Trasplante: Cal dolomítica 300g/hoyo. NPK 25-4-24 — 50g/árbol a los 15 días."},
  {fromDay:240,toDay:245,phaseIds:["crecimiento"],text:"Crecimiento 2°: NPK 25-4-24 + Mg — 100g/árbol en corona. No aplicar con lluvia fuerte."},
  {fromDay:300,toDay:305,phaseIds:["crecimiento"],text:"Cal dolomítica — 200g/árbol. Corrige acidez, aporta Ca y Mg. Aplicar en periodo seco."},
  {fromDay:360,toDay:365,phaseIds:["crecimiento"],text:"NPK 25-4-24 — 120g/árbol + Urea 46% — 30g/árbol. En corona, esperar 2 días post-lluvia."},
  {fromDay:420,toDay:425,phaseIds:["crecimiento"],text:"Micronutrientes foliares: Zinc (sulfato 0.3%) + Boro (Bórax 0.2%). Aplicar en la mañana."},
  {fromDay:480,toDay:485,phaseIds:["crecimiento"],text:"NPK 25-4-24 — 150g/árbol + Compost — 1kg/árbol. Antes de inicio de floración."},
  {fromDay:540,toDay:545,phaseIds:["floracion","desarrollo","cosecha","produccion"],text:"Inicio producción: NPK 17-6-18-2(Mg) — 150g/árbol. Esencial para amarre de frutos."},
];
function getNutricionRecs(daysSince,weather,phase){
  const recs=[];const rain=weather?.precipitation_sum??0;
  for(const plan of FERTILIZATION_PLAN){
    if(daysSince>=plan.fromDay&&daysSince<=plan.toDay&&plan.phaseIds.includes(phase?.id)){
      const lluvia=rain>15?" Lluvia alta hoy — esperar 2 días secos.":"";
      recs.push({type:"nutricion",urgency:"nutricion",text:plan.text+lluvia});
    }
  }
  if(daysSince>545&&isInWindow(daysSince,545,60,5)){const warn=rain>15?" Esperar días secos.":"";recs.push({type:"nutricion",urgency:"nutricion",text:`Fertilización periódica: NPK 17-6-18-2(Mg) — 150–200g/árbol. Complementar con compost 2kg/árbol.${warn}`});}
  if(daysSince>540&&isInWindow(daysSince,540,90,4))recs.push({type:"nutricion",urgency:"nutricion",text:"Foliar micronutrientes: Boro (0.2%) + Zinc (0.3%) + Magnesio (0.5%). Aplicar en la mañana, sin lluvia en 4h."});
  return recs;
}
function getPodaRecs(daysSince,weather,phase){
  const recs=[];const rain=weather?.precipitation_sum??0;const tmax=weather?.temperature_2m_max??28;
  const warn=rain>5?" Evitar podar con lluvia — riesgo de infección en cortes.":"";
  if(phase?.id==="vivero"&&isInWindow(daysSince,35,150,5))recs.push({type:"poda",urgency:"poda",text:`Poda formación vivero: eliminar brotes bajo 1° verticilo. Dejar 3–4 ramas. Tijera desinfectada.${warn}`});
  if(phase?.id==="crecimiento"&&isInWindow(daysSince,180,90,5))recs.push({type:"poda",urgency:"poda",text:`Poda formación: eliminar chupones, ramas en V y tejido muerto. 3–5 ramas estructurales. Pasta bordelesa en cortes >1cm.${warn}`});
  if((phase?.id==="postcosecha"||phase?.id==="produccion")&&isInWindow(daysSince,760,180,7))recs.push({type:"poda",urgency:"poda",text:`Poda fitosanitaria: retirar ramas enfermas, cojines secos y mazorcas momificadas. Quemar material fuera del cultivo.${warn}`});
  if(tmax>34&&daysSince>0&&phase?.id!=="produccion")recs.push({type:"poda",urgency:"media",text:`Calor extremo (${tmax}°C). Verificar sombrío temporal (50% cobertura). En vivero, usar polisombra.`});
  return recs;
}
function getCosechaRecs(daysSince,accumGDD,variety){
  const phases=VARIETIES[variety]?.gddPhases||VARIETIES[DEFAULT_VARIETY].gddPhases;
  const cosPhase=phases.find(p=>p.id==="cosecha");const recs=[];
  if(!cosPhase)return recs;
  if(accumGDD>=cosPhase.gddStart&&accumGDD<cosPhase.gddEnd){
    const cycleOffset=(daysSince-Math.round(cosPhase.gddStart/20))%180;
    if(cycleOffset<7)recs.push({type:"cosecha",urgency:"cosecha",text:"Ventana de cosecha activa. Cosechar mazorcas con cambio de color completo. Machete desinfectado, dejar pedúnculo 2cm."});
  }
  return recs;
}
function calcHealthScore(dateStr,weatherMap,daysSince,rolling7,variety,notes){
  let score=100;const w=weatherMap[dateStr];
  if(w){
    const deficit=(w.et0_fao_evapotranspiration||3.5)-(w.precipitation_sum||0);
    if(deficit>5)score-=20;else if(deficit>2)score-=10;
    const tAvg=((w.temperature_2m_max||28)+(w.temperature_2m_min||20))/2;
    if(rolling7!=null&&tAvg>=20&&tAvg<=28){if(rolling7>45)score-=25;else if(rolling7>25)score-=12;}
    if(w.temperature_2m_max>34)score-=10;
  }
  for(let i=1;i<=7;i++){const d=new Date(dateStr);d.setDate(d.getDate()-i);if(notes[fmtDate(d)]?.some(n=>n.cat==="plagas"))score-=5;}
  return Math.max(0,Math.min(100,score));
}
function buildRecommendations(cultivo,weatherMap){
  if(!cultivo?.plantDate)return{};
  const recs={};const today=new Date();
  const rangeStart=new Date(today.getFullYear(),today.getMonth()-1,1);
  const rangeEnd=new Date(today.getFullYear(),today.getMonth()+3,0);
  const planting=new Date(cultivo.plantDate);
  let accumGDD=0;const gddMap={};
  for(let d=new Date(planting);d<=rangeEnd;d.setDate(d.getDate()+1)){
    const key=fmtDate(d),w=weatherMap[key];
    accumGDD+=w?calcDayGDD(w.temperature_2m_max,w.temperature_2m_min):calcDayGDD(27,20);
    gddMap[key]=Math.round(accumGDD);
  }
  for(let d=new Date(rangeStart);d<=rangeEnd;d.setDate(d.getDate()+1)){
    const daysSince=getDaysSince(cultivo.plantDate,fmtDate(d));
    if(daysSince<0)continue;
    const key=fmtDate(d),agdd=gddMap[key]??0;
    const phase=getPhaseByGDD(agdd,cultivo.variety),weather=weatherMap[key];
    const rolling7=getRolling7DayRain(key,weatherMap),dayRecs=[];
    const phases=VARIETIES[cultivo.variety]?.gddPhases||VARIETIES[DEFAULT_VARIETY].gddPhases;
    if(phase&&agdd===phases.find(p=>p.id===phase.id)?.gddStart)dayRecs.push({type:"fase",urgency:"fase",text:`Inicio etapa: ${phase.label}. ${phase.tip}`,phase});
    const riegoRec=getRiegoRec(daysSince,weather);if(riegoRec)dayRecs.push(riegoRec);
    getPlagaRecs(daysSince,weather,rolling7,cultivo.variety).forEach(r=>dayRecs.push(r));
    getNutricionRecs(daysSince,weather,phase).forEach(r=>dayRecs.push(r));
    getPodaRecs(daysSince,weather,phase).forEach(r=>dayRecs.push(r));
    getCosechaRecs(daysSince,agdd,cultivo.variety).forEach(r=>dayRecs.push(r));
    if(dayRecs.length){if(!recs[key])recs[key]=[];recs[key].push(...dayRecs);}
  }
  return recs;
}

// ─── Hook: Clima ───────────────────────────────────────────────────────────────
function useWeather(){
  const[weatherMap,setWeatherMap]=useState(()=>{try{return JSON.parse(localStorage.getItem("cacao_weather_cache")||"{}");}catch{return{};}});
  const[weatherLoading,setWeatherLoading]=useState(false);
  const[currentWeather,setCurrentWeather]=useState(null);
  const[lastUpdated,setLastUpdated]=useState(null);
  const fetchWeather=useCallback(async(silent=false)=>{
    if(!silent)setWeatherLoading(true);
    const url=`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}`+`&daily=precipitation_sum,temperature_2m_max,temperature_2m_min,et0_fao_evapotranspiration,weathercode,windspeed_10m_max`+`&current_weather=true&timezone=auto&forecast_days=16`;
    try{
      const data=await fetch(url).then(r=>r.json());
      const map={};
      (data.daily?.time||[]).forEach((date,i)=>{map[date]={precipitation_sum:data.daily.precipitation_sum[i]??0,temperature_2m_max:data.daily.temperature_2m_max[i]??28,temperature_2m_min:data.daily.temperature_2m_min[i]??20,et0_fao_evapotranspiration:data.daily.et0_fao_evapotranspiration[i]??3.5,weathercode:data.daily.weathercode[i]??0,windspeed_10m_max:data.daily.windspeed_10m_max[i]??10};});
      setWeatherMap(prev=>{const merged={...prev,...map};try{localStorage.setItem("cacao_weather_cache",JSON.stringify(merged));}catch{}return merged;});
      if(data.current_weather)setCurrentWeather(data.current_weather);
      setLastUpdated(new Date());
    }catch(e){console.warn("No se pudo actualizar el clima.",e);}finally{setWeatherLoading(false);}
  },[]);
  useEffect(()=>{fetchWeather(false);},[fetchWeather]);
  useEffect(()=>{const id=setInterval(()=>fetchWeather(true),10*60*1000);return()=>clearInterval(id);},[fetchWeather]);
  useEffect(()=>{const onVisible=()=>{if(document.visibilityState==="visible")fetchWeather(true);};document.addEventListener("visibilitychange",onVisible);return()=>document.removeEventListener("visibilitychange",onVisible);},[fetchWeather]);
  return{weatherMap,weatherLoading,currentWeather,lastUpdated};
}

// ─── Hook: Notas ───────────────────────────────────────────────────────────────
function useNotes(user){
  const[notes,setNotes]=useState({});const[loadingNotes,setLoading]=useState(true);const saveTimeout=useRef(null);
  useEffect(()=>{if(!user?.uid){setLoading(false);return;}getDoc(doc(db,"calendar",user.uid)).then(snap=>{if(snap.exists())setNotes(snap.data().calendarNotes??{});}).catch(console.error).finally(()=>setLoading(false));},[user?.uid]);
  const persist=useCallback((next)=>{if(!user?.uid)return;clearTimeout(saveTimeout.current);saveTimeout.current=setTimeout(()=>{setDoc(doc(db,"calendar",user.uid),{calendarNotes:next},{merge:true});},800);},[user?.uid]);
  const addNote=useCallback((dateStr,cat,text)=>{const id=`n_${Date.now()}`;setNotes(prev=>{const next={...prev,[dateStr]:[...(prev[dateStr]||[]),{id,cat,text}]};persist(next);return next;});},[persist]);
  const deleteNote=useCallback((dateStr,noteId)=>{setNotes(prev=>{const next={...prev,[dateStr]:(prev[dateStr]||[]).filter(n=>n.id!==noteId)};persist(next);return next;});},[persist]);
  return{notes,loadingNotes,addNote,deleteNote};
}

// ─── Hook: Fecha de siembra ────────────────────────────────────────────────────
function usePlantDate(user,cultivoFechaDefault){
  const[localDate,setLocalDate]=useState(null);const[loadingDate,setLoading]=useState(true);
  useEffect(()=>{if(!user?.uid){setLoading(false);return;}getDoc(doc(db,"calendar",user.uid)).then(snap=>{if(snap.exists())setLocalDate(snap.data().calendarPlantDate||null);}).catch(console.error).finally(()=>setLoading(false));},[user?.uid]);
  const savePlantDate=useCallback(async(fecha)=>{setLocalDate(fecha);if(!user?.uid)return;await setDoc(doc(db,"calendar",user.uid),{calendarPlantDate:fecha},{merge:true});},[user?.uid]);
  return{localDate,effectiveDate:localDate||cultivoFechaDefault||null,loadingDate,savePlantDate};
}

// ─── WeatherChip ───────────────────────────────────────────────────────────────
function WeatherChip({currentWeather,weatherMap,weatherLoading,lastUpdated}){
  const today=fmtDate(new Date()),tw=weatherMap[today];
  const temp=currentWeather?.temperature??tw?.temperature_2m_max;
  const code=currentWeather?.weathercode??tw?.weathercode??0;
  const isOffline=!navigator.onLine;
  const ago=lastUpdated?(()=>{const m=Math.round((Date.now()-lastUpdated)/60000);return m<1?"ahora":`${m}m`;})():null;
  return(
    <div style={{display:"inline-flex",alignItems:"center",gap:6,background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:20,padding:"4px 11px 4px 8px",position:"relative"}}>
      {weatherLoading&&<span style={{position:"absolute",top:3,right:3,width:5,height:5,borderRadius:"50%",background:C.green,animation:"pulse 1s infinite"}}/>}
      {isOffline&&<span style={{position:"absolute",top:3,right:3,width:5,height:5,borderRadius:"50%",background:C.gold}} title="Sin conexión — usando caché"><Icon.WifiOff size={8} color={C.gold}/></span>}
      <span style={{display:"flex",alignItems:"center",opacity:weatherLoading&&!temp?0.5:1}}>
        <WeatherIcon code={code} size={14} color={C.gray1}/>
      </span>
      <span style={{fontSize:12,fontWeight:700,color:C.white}}>{temp!=null?`${Math.round(temp)}°C`:"—"}</span>
      <div style={{display:"flex",flexDirection:"column"}}>
        <span style={{fontSize:9,color:C.gray2,letterSpacing:".05em"}}>Tibú</span>
        {ago&&<span style={{fontSize:8,color:C.gray3}}>{ago}</span>}
      </div>
    </div>
  );
}

// ─── GraficaClima ─────────────────────────────────────────────────────────────
function GraficaClima({weatherMap}){
  const days=useMemo(()=>{const result=[];for(let i=13;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const key=fmtDate(d),w=weatherMap[key];result.push({key,label:`${d.getDate()}/${d.getMonth()+1}`,rain:w?.precipitation_sum??0,et0:w?.et0_fao_evapotranspiration??0});}return result;},[weatherMap]);
  const maxVal=Math.max(...days.map(d=>d.rain),6);
  const W=580,H=90,padL=28,padR=8,padT=8,padB=20;
  const barW=(W-padL-padR)/days.length-2;
  const xOf=(i)=>padL+i*((W-padL-padR)/days.length)+1;
  const yOf=(v)=>padT+(H-padT-padB)*(1-v/maxVal);
  return(
    <div style={{background:C.bgCard,borderRadius:10,padding:"10px 12px 6px",border:`1px solid ${C.border}`}}>
      <div style={{fontSize:9,color:C.gray2,letterSpacing:".1em",textTransform:"uppercase",marginBottom:6}}>Lluvia vs ETo — últimos 14 días</div>
      <svg width="100%" viewBox={`0 0 ${W} ${H+10}`} style={{overflow:"visible"}}>
        {days.map((d,i)=>(<rect key={i} x={xOf(i)} y={yOf(d.rain)} width={barW} height={Math.max(1,H-padB-yOf(d.rain)+padT)} fill={C.blue} opacity={d.rain>0?0.65:0.15} rx={2}/>))}
        <polyline fill="none" stroke={C.gold} strokeWidth={1.5} opacity={0.85} points={days.map((d,i)=>`${xOf(i)+barW/2},${yOf(d.et0)}`).join(" ")}/>
        {days.map((d,i)=>(<circle key={i} cx={xOf(i)+barW/2} cy={yOf(d.et0)} r={2} fill={C.gold} opacity={0.9}/>))}
        {days.filter((_,i)=>i%2===0).map((d,i)=>(<text key={i} x={xOf(i*2)+barW/2} y={H+6} textAnchor="middle" fill={C.gray3} fontSize={7}>{d.label}</text>))}
        <text x={padL-3} y={H-padB+padT+1} textAnchor="end" fill={C.gray3} fontSize={7}>0</text>
        <text x={padL-3} y={padT+4} textAnchor="end" fill={C.gray3} fontSize={7}>{Math.round(maxVal)}</text>
      </svg>
      <div style={{display:"flex",gap:12,marginTop:2}}>
        <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:C.blue,opacity:0.65,display:"inline-block"}}/><span style={{fontSize:9,color:C.gray2}}>Lluvia (mm)</span></div>
        <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:12,height:2,background:C.gold,display:"inline-block"}}/><span style={{fontSize:9,color:C.gray2}}>ETo (mm)</span></div>
      </div>
    </div>
  );
}

// ─── ScoreSalud ───────────────────────────────────────────────────────────────
function ScoreSalud({cultivoActivo,weatherMap,notes}){
  const todayStr=fmtDate(new Date());
  const score=useMemo(()=>{if(!cultivoActivo?.plantDate)return null;const daysSince=getDaysSince(cultivoActivo.plantDate,todayStr);const rolling7=getRolling7DayRain(todayStr,weatherMap);return calcHealthScore(todayStr,weatherMap,daysSince,rolling7,cultivoActivo.variety,notes);},[cultivoActivo,weatherMap,notes,todayStr]);
  if(score===null)return null;
  const getColor=(s)=>s>=75?C.green:s>=50?C.gold:C.red;
  const getLabel=(s)=>s>=75?"Bueno":s>=50?"Alerta":"Crítico";
  return(
    <div style={{background:C.bgCard,border:`1px solid ${getColor(score)}44`,borderRadius:10,padding:"8px 14px",display:"flex",alignItems:"center",gap:14}}>
      <div style={{display:"flex",alignItems:"center",gap:7}}>
        <Icon.Heart size={16} color={getColor(score)}/>
        <div>
          <div style={{fontSize:9,color:C.gray2,marginBottom:2}}>Salud del cultivo</div>
          <div style={{display:"flex",alignItems:"baseline",gap:4}}>
            <span style={{fontSize:24,fontWeight:700,color:getColor(score),lineHeight:1}}>{score}</span>
            <span style={{fontSize:9,color:C.gray2}}>/100</span>
          </div>
        </div>
      </div>
      <div style={{flex:1}}>
        <div style={{height:4,background:C.border,borderRadius:2,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${score}%`,background:getColor(score),borderRadius:2,transition:"width .5s"}}/>
        </div>
        <div style={{fontSize:9,color:getColor(score),marginTop:4}}>{getLabel(score)} · {VARIETIES[cultivoActivo.variety]?.label}</div>
      </div>
    </div>
  );
}

// ─── ConfigFecha ──────────────────────────────────────────────────────────────
function ConfigFecha({fechaInicio,onSave}){
  const[fecha,setFecha]=useState(fechaInicio||"");const[saved,setSaved]=useState(false);const[saving,setSaving]=useState(false);
  const hoy=new Date().toISOString().split("T")[0];
  const handleSave=async()=>{if(!fecha)return;setSaving(true);await onSave(fecha);setSaved(true);setSaving(false);setTimeout(()=>setSaved(false),2500);};
  return(
    <div style={{background:C.goldLight,border:`1px solid ${C.goldGlow}`,borderRadius:11,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
      <Icon.Calendar size={18} color={C.gold}/>
      <div style={{flex:1,minWidth:180}}>
        <div style={{fontSize:11,fontWeight:700,color:C.gold,marginBottom:2}}>Fecha de inicio del cultivo</div>
        <div style={{fontSize:10,color:C.gray2}}>{fechaInicio?"Puedes corregirla si es necesario.":"Registra cuándo iniciaste para activar las recomendaciones agronómicas."}</div>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <input type="date" max={hoy} value={fecha} onChange={e=>setFecha(e.target.value)} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 10px",color:C.white,fontSize:12,fontFamily:"inherit",outline:"none"}}/>
        <button onClick={handleSave} disabled={!fecha||saving} style={{padding:"6px 14px",borderRadius:8,border:"none",fontFamily:"inherit",fontSize:12,fontWeight:700,cursor:fecha&&!saving?"pointer":"not-allowed",background:saved?C.greenLight:`linear-gradient(135deg,${C.gold},#9A7020)`,color:saved?C.green:C.bg,opacity:!fecha?0.4:1,transition:"all .2s",display:"flex",alignItems:"center",gap:5}}>
          {saved?<><Icon.Check size={12} color={C.green}/>Guardado</>:saving?"...":"Guardar"}
        </button>
      </div>
    </div>
  );
}

// ─── PhaseBar ──────────────────────────────────────────────────────────────────
function PhaseBar({cultivoActivo,weatherMap}){
  const todayStr=fmtDate(new Date());
  const info=useMemo(()=>{
    if(!cultivoActivo?.plantDate)return null;
    const accumGDD=getAccumGDD(cultivoActivo.plantDate,todayStr,weatherMap);
    const phases=VARIETIES[cultivoActivo.variety]?.gddPhases||VARIETIES[DEFAULT_VARIETY].gddPhases;
    const phase=getPhaseByGDD(accumGDD,cultivoActivo.variety);
    const nextPhase=phases.find(p=>p.gddStart>accumGDD);
    const progress=nextPhase?Math.round(((accumGDD-phase.gddStart)/(nextPhase.gddStart-phase.gddStart))*100):100;
    const tw=weatherMap[todayStr],daysSince=getDaysSince(cultivoActivo.plantDate,todayStr);
    const riegoRec=tw?getRiegoRec(daysSince,tw):null;
    const plagaRisk=tw?getPlaguaRisk(tw,accumGDD,cultivoActivo.variety):null;
    const cosFase=phases.find(p=>p.id==="cosecha");
    const gddToNextHarvest=cosFase&&accumGDD<cosFase.gddStart?`~${Math.round((cosFase.gddStart-accumGDD)/20)} días`:"Activa";
    return{accumGDD,phase,nextPhase,progress,riegoRec,plagaRisk,gddToNextHarvest};
  },[cultivoActivo,weatherMap,todayStr]);
  if(!info)return null;
  const{accumGDD,phase,nextPhase,progress,riegoRec,plagaRisk,gddToNextHarvest}=info;
  return(
    <div style={css.phaseBar}>
      <div style={css.phaseLeft}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <PhaseIcon phaseId={phase.id} size={22} color={phase.color}/>
          <div>
            <div style={{fontSize:9,color:C.gray2,letterSpacing:".08em",textTransform:"uppercase"}}>{VARIETIES[cultivoActivo.variety]?.label} · {accumGDD.toLocaleString()} GDD</div>
            <div style={{fontSize:13,fontWeight:700,color:phase.color,marginTop:2}}>{phase.label}</div>
          </div>
        </div>
        <div style={{height:3,background:C.border,borderRadius:2,overflow:"hidden",marginTop:8}}>
          <div style={{height:"100%",width:`${Math.min(100,progress)}%`,background:phase.color,borderRadius:2,transition:"width .5s"}}/>
        </div>
        {nextPhase&&<div style={{fontSize:9,color:C.gray2,marginTop:4}}>{nextPhase.gddStart-accumGDD} GDD para {nextPhase.label}</div>}
        <div style={css.phaseTip}>
          <span style={{display:"inline-flex",verticalAlign:"middle",marginRight:5}}><Icon.Lightbulb size={11} color={C.gold}/></span>
          {phase.tip}
        </div>
      </div>
      <div style={css.phaseCards}>
        <MiniCard IconComp={<Icon.Package size={16} color={C.gold}/>} label="Próxima cosecha" value={gddToNextHarvest} color={C.gold}/>
        <MiniCard IconComp={<Icon.Droplet size={16} color={C.blue}/>} label="Riego hoy" value={riegoRec?.urgency==="alta"?"Urgente":riegoRec?.urgency==="media"?"Recomendado":"No necesario"} color={riegoRec?C.blue:C.green}/>
        <MiniCard IconComp={<Icon.AlertCircle size={16} color={plagaRisk?.level==="alta"?C.red:plagaRisk?.level==="media"?C.gold:C.green}/>} label="Riesgo hongos" value={plagaRisk?.level==="alta"?"Alto":plagaRisk?.level==="media"?"Moderado":"Bajo"} color={plagaRisk?.level==="alta"?C.red:plagaRisk?.level==="media"?C.gold:C.green}/>
      </div>
    </div>
  );
}

function MiniCard({IconComp,label,value,color}){
  return(
    <div style={css.miniCard}>
      {IconComp}
      <div style={{fontSize:9,color:C.gray2,marginTop:2}}>{label}</div>
      <div style={{fontSize:11,fontWeight:700,color:color||C.white,marginTop:2}}>{value}</div>
    </div>
  );
}

// ─── SinCultivo ───────────────────────────────────────────────────────────────
function SinCultivo(){
  return(
    <div style={{background:C.goldLight,border:`1px solid ${C.goldGlow}`,borderRadius:11,padding:"18px 20px",display:"flex",alignItems:"center",gap:14}}>
      <Icon.Plant size={28} color={C.gold}/>
      <div>
        <div style={{fontSize:13,fontWeight:700,color:C.gold,marginBottom:4}}>Configura tu cultivo primero</div>
        <div style={{fontSize:11,color:C.gray1,lineHeight:1.6}}>Ve a <strong style={{color:C.white}}>Mi Cultivo</strong> y registra la variedad y fecha de siembra para activar el calendario agronómico personalizado.</div>
      </div>
    </div>
  );
}

// ─── ExportBitacora ───────────────────────────────────────────────────────────
function ExportBitacora({curY,curM,notes,recommendations,cultivoActivo}){
  const[copied,setCopied]=useState(false);
  const generate=()=>{
    const dim=new Date(curY,curM+1,0).getDate();
    const variedad=VARIETIES[cultivoActivo?.variety]?.label??"—";
    const lines=[`BITÁCORA DE CULTIVO — ${MONTHS[curM].toUpperCase()} ${curY}`,`Variedad: ${variedad}`,"═".repeat(60),""];
    for(let d=1;d<=dim;d++){const key=dk(curY,curM,d),dn=notes[key]||[],dr=recommendations[key]||[];if(!dn.length&&!dr.length)continue;lines.push(`── ${d} de ${MONTHS[curM]} ──`);dr.forEach(r=>lines.push(`  [AUTO] ${r.text}`));dn.forEach(n=>lines.push(`  [${(CATEGORIES[n.cat]||CATEGORIES.general).label.toUpperCase()}] ${n.text}`));lines.push("");}
    return lines.join("\n");
  };
  const handleCopy=()=>{navigator.clipboard.writeText(generate()).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});};
  return(
    <button onClick={handleCopy} title="Exportar bitácora del mes" style={{height:30,padding:"0 12px",borderRadius:15,border:`1px solid ${C.greenGlow}`,background:C.greenLight,color:C.green,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"inherit",transition:"all .2s",display:"flex",alignItems:"center",gap:6}}>
      {copied?<><Icon.Check size={12} color={C.green}/>Copiado</>:<><Icon.Clipboard size={12} color={C.green}/>Bitácora</>}
    </button>
  );
}

// ─── VistaSemana ──────────────────────────────────────────────────────────────
function VistaSemana({weekStart,notes,recommendations,weatherMap,onSelectDate}){
  const days=useMemo(()=>{const arr=[];for(let i=0;i<7;i++){const d=new Date(weekStart);d.setDate(weekStart.getDate()+i);arr.push(d);}return arr;},[weekStart]);
  const todayStr=fmtDate(new Date());
  return(
    <div style={{display:"flex",flexDirection:"column",gap:3}}>
      {days.map(d=>{
        const key=fmtDate(d),dn=notes[key]||[],dr=recommendations[key]||[];
        const tw=weatherMap[key],isToday=key===todayStr,all=[...dn,...dr];
        return(
          <div key={key} onClick={()=>onSelectDate(key)} style={{display:"flex",gap:10,padding:"8px 10px",borderRadius:9,cursor:"pointer",background:isToday?C.goldLight:C.bgCard,border:`1px solid ${isToday?C.goldGlow:C.border}`,transition:"all .15s"}}>
            <div style={{width:40,flexShrink:0,textAlign:"center"}}>
              <div style={{fontSize:9,color:C.gray2,textTransform:"uppercase"}}>{WEEKDAYS[d.getDay()]}</div>
              <div style={{fontSize:18,fontWeight:700,color:isToday?C.gold:C.gray1,lineHeight:1.2}}>{d.getDate()}</div>
            </div>
            <div style={{flex:1,minWidth:0}}>
              {tw&&(
                <div style={{display:"flex",gap:8,fontSize:9,color:C.gray2,marginBottom:4,alignItems:"center"}}>
                  <WeatherIcon code={tw.weathercode} size={11} color={C.gray2}/>
                  <span>{Math.round(tw.temperature_2m_max)}°/{Math.round(tw.temperature_2m_min)}°C</span>
                  <Icon.Droplet size={9} color={C.blue}/>
                  <span>{tw.precipitation_sum?.toFixed(0)}mm</span>
                </div>
              )}
              <div style={{display:"flex",flexDirection:"column",gap:2}}>
                {all.slice(0,3).map((item,i)=>{
                  const cat=item.type?REC_STYLE[item.type]||REC_STYLE.fase:CATEGORIES[item.cat]||CATEGORIES.general;
                  const CatIcon=cat.Icon;
                  return(
                    <div key={i} style={{fontSize:9,padding:"2px 6px",borderRadius:4,background:cat.bg,borderLeft:`2px solid ${cat.color}`,color:C.gray1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4}}>
                      <CatIcon/>{item.text}
                    </div>
                  );
                })}
                {all.length>3&&<span style={{fontSize:9,color:C.gray2,paddingLeft:3}}>+{all.length-3} más</span>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── NoteModal ─────────────────────────────────────────────────────────────────
function NoteModal({date,notes,recs,onAdd,onDelete,onClose,isPast,weatherMap}){
  const[selCat,setSelCat]=useState("general");const[text,setText]=useState("");const[saving,setSaving]=useState(false);const taRef=useRef(null);
  const[y,m,d]=date.split("-").map((v,i)=>i===1?Number(v)-1:Number(v));
  const dayNotes=notes[date]||[],dayRecs=recs[date]||[],tw=weatherMap?.[date];
  useEffect(()=>{if(!isPast&&taRef.current)taRef.current.focus();},[isPast]);
  const handleAdd=async()=>{if(!text.trim())return;setSaving(true);await onAdd(date,selCat,text.trim());setText("");setSaving(false);};
  return(
    <div style={css.overlay} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={css.modal}>
        {/* Header */}
        <div style={css.modalHead}>
          <div>
            <div style={{fontSize:9,color:C.green,letterSpacing:".1em",textTransform:"uppercase",marginBottom:3}}>Registro</div>
            <div style={{fontSize:17,fontWeight:700,color:C.white}}>{d} de {MONTHS[m]} de {y}</div>
          </div>
          <button onClick={onClose} style={css.xBtn}><Icon.X size={12} color={C.gray2}/></button>
        </div>
        {/* Clima del día */}
        {tw&&(
          <div style={css.dayWeather}>
            <WeatherIcon code={tw.weathercode} size={20} color={C.gray1}/>
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:600,color:C.white}}>{Math.round(tw.temperature_2m_max)}° / {Math.round(tw.temperature_2m_min)}°C</div>
              <div style={{fontSize:10,color:C.gray2,display:"flex",gap:8,alignItems:"center",marginTop:2}}>
                <Icon.Droplet size={9} color={C.blue}/><span>Precip. {tw.precipitation_sum?.toFixed(0)}mm</span>
                <Icon.TrendingUp size={9} color={C.gold}/><span>ETo {tw.et0_fao_evapotranspiration?.toFixed(1)}mm</span>
                <Icon.Wind size={9} color={C.gray2}/><span>{Math.round(tw.windspeed_10m_max??0)}km/h</span>
              </div>
            </div>
          </div>
        )}
        {/* Recomendaciones automáticas */}
        {dayRecs.length>0&&(
          <div style={css.recsArea}>
            <div style={{fontSize:9,color:C.gold,letterSpacing:".1em",textTransform:"uppercase",marginBottom:7,fontWeight:700,display:"flex",alignItems:"center",gap:5}}>
              <Icon.Star size={10} color={C.gold}/>Recomendaciones automáticas
            </div>
            {dayRecs.map((r,i)=>{const rs=REC_STYLE[r.type]||REC_STYLE.fase;const RsIcon=rs.Icon;return(
              <div key={i} style={{display:"flex",alignItems:"flex-start",gap:8,padding:"7px 10px",borderRadius:8,marginBottom:5,background:rs.bg,borderLeft:`3px solid ${rs.color}`}}>
                <span style={{flexShrink:0,marginTop:1}}><RsIcon/></span>
                <span style={{fontSize:11,color:C.gray1,lineHeight:1.55}}>{r.text}</span>
              </div>
            );})}
          </div>
        )}
        {/* Notas existentes */}
        <div style={{padding:"10px 18px",maxHeight:170,overflowY:"auto",display:"flex",flexDirection:"column",gap:7}}>
          {dayNotes.length===0&&dayRecs.length===0&&(
            <div style={{textAlign:"center",padding:"14px 0",color:C.gray2,fontSize:12,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
              <Icon.Leaf size={18} color={C.gray3}/>
              <span>Sin notas registradas</span>
            </div>
          )}
          {dayNotes.map(n=>{const cat=CATEGORIES[n.cat]||CATEGORIES.general;const CatIcon=cat.Icon;return(
            <div key={n.id} style={{background:C.bgCard,borderRadius:8,padding:"9px 10px",borderLeft:`3px solid ${cat.color}`,position:"relative"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                <span style={{fontSize:9,padding:"2px 7px",borderRadius:10,fontWeight:700,background:cat.bg,color:cat.color,display:"flex",alignItems:"center",gap:4}}>
                  <CatIcon/>{cat.label}
                </span>
              </div>
              <div style={{fontSize:12,color:C.gray1,lineHeight:1.5}}>{n.text}</div>
              {!isPast&&(<button onClick={()=>onDelete(date,n.id)} style={{position:"absolute",top:7,right:7,border:"none",background:"transparent",color:C.gray2,cursor:"pointer",padding:2,display:"flex",alignItems:"center"}}><Icon.X size={10} color={C.gray2}/></button>)}
            </div>
          );})}
        </div>
        {/* Input nueva nota / bloqueo pasado */}
        {isPast?(
          <div style={{padding:"14px 18px 18px",borderTop:`1px solid ${C.border}`,textAlign:"center"}}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><Icon.Lock size={22} color={C.gray2}/></div>
            <div style={{fontSize:12,fontWeight:600,color:C.gray2,marginBottom:4}}>Día en el pasado</div>
            <div style={{fontSize:10,color:C.gray3}}>Solo puedes consultar el historial y recomendaciones generadas.</div>
          </div>
        ):(
          <div style={{padding:"12px 18px 18px",borderTop:`1px solid ${C.border}`,display:"flex",flexDirection:"column",gap:9}}>
            <div style={{fontSize:9,color:C.gray2,letterSpacing:".08em",textTransform:"uppercase"}}>Nueva nota</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {Object.entries(CATEGORIES).map(([key,cat])=>{const CatIcon=cat.Icon;return(
                <button key={key} onClick={()=>setSelCat(key)} style={{fontSize:10,padding:"4px 9px",borderRadius:18,cursor:"pointer",fontFamily:"inherit",transition:"all .15s",background:selCat===key?cat.bg:"transparent",border:`1px solid ${selCat===key?cat.color:C.border}`,color:selCat===key?cat.color:C.gray2,fontWeight:selCat===key?700:400,display:"flex",alignItems:"center",gap:4}}>
                  <CatIcon/>{cat.label}
                </button>
              );})}
            </div>
            <div style={{position:"relative"}}>
              <textarea ref={taRef} value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&(e.metaKey||e.ctrlKey))handleAdd();if(e.key==="Escape")onClose();}} placeholder="Describe el estado del cultivo, observaciones..." rows={3} style={{width:"100%",background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 11px",color:C.white,fontSize:12,fontFamily:"inherit",resize:"none",lineHeight:1.6,outline:"none",boxSizing:"border-box"}}/>
              <span style={{position:"absolute",bottom:7,right:9,fontSize:9,color:C.gray3,pointerEvents:"none"}}>⌘+Enter guardar</span>
            </div>
            <button onClick={handleAdd} disabled={saving||!text.trim()} style={{padding:"10px",background:`linear-gradient(135deg,${C.green} 0%,#1A4A2A 100%)`,border:"none",borderRadius:9,color:C.white,fontFamily:"inherit",fontSize:12,fontWeight:700,cursor:saving||!text.trim()?"not-allowed":"pointer",opacity:saving||!text.trim()?0.5:1}}>
              {saving?"Guardando...":"Guardar nota"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Componente Principal ──────────────────────────────────────────────────────
export default function CacaoCalendar({cultivo,user}){
  const today=new Date();
  const{localDate,effectiveDate,loadingDate,savePlantDate}=usePlantDate(user,cultivo?.fechaSiembra);
  const cultivoActivo=useMemo(()=>{if(!effectiveDate)return null;const variety=VARIEDAD_MAP[cultivo?.variedad]??DEFAULT_VARIETY;return{plantDate:effectiveDate,variety};},[effectiveDate,cultivo?.variedad]);
  const[curY,setCurY]=useState(today.getFullYear());const[curM,setCurM]=useState(today.getMonth());
  const[selDate,setSelDate]=useState(null);const[view,setView]=useState("month");
  const[weekStart,setWeekStart]=useState(()=>{const d=new Date(today);d.setDate(today.getDate()-today.getDay());return d;});
  const{notes,loadingNotes,addNote,deleteNote}=useNotes(user);
  const{weatherMap,weatherLoading,currentWeather,lastUpdated}=useWeather();
  const recommendations=useMemo(()=>buildRecommendations(cultivoActivo,weatherMap),[cultivoActivo,weatherMap]);
  const isPastDate=(y,m,d)=>new Date(y,m,d)<new Date(today.getFullYear(),today.getMonth(),today.getDate());
  const isToday=(y,m,d)=>y===today.getFullYear()&&m===today.getMonth()&&d===today.getDate();
  const cells=useMemo(()=>{const firstDay=new Date(curY,curM,1).getDay(),dim=new Date(curY,curM+1,0).getDate();const prevDays=new Date(curY,curM,0).getDate(),result=[];for(let i=firstDay-1;i>=0;i--)result.push({y:curM===0?curY-1:curY,m:curM===0?11:curM-1,d:prevDays-i,other:true});for(let d=1;d<=dim;d++)result.push({y:curY,m:curM,d,other:false});const rem=result.length%7===0?0:7-(result.length%7);for(let d=1;d<=rem;d++)result.push({y:curM===11?curY+1:curY,m:curM===11?0:curM+1,d,other:true});return result;},[curY,curM]);
  const prevMonth=()=>{if(curM===0){setCurM(11);setCurY(y=>y-1);}else setCurM(m=>m-1);};
  const nextMonth=()=>{if(curM===11){setCurM(0);setCurY(y=>y+1);}else setCurM(m=>m+1);};
  const prevWeek=()=>setWeekStart(d=>{const n=new Date(d);n.setDate(d.getDate()-7);return n;});
  const nextWeek=()=>setWeekStart(d=>{const n=new Date(d);n.setDate(d.getDate()+7);return n;});
  if(loadingNotes)return(<div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><p style={{color:C.gray2,fontSize:13}}>Cargando calendario...</p></div>);
  return(
    <div style={css.root}>
      <style>{`
        *{box-sizing:border-box;}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:4px}
        input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(0.4)}
        select option{background:${C.bgDark};color:${C.white}}
        .cal-day:hover{background:rgba(255,255,255,0.03)!important;}
        @media(max-width:640px){.cal-layout{flex-direction:column!important}.cal-sidebar{width:100%!important;flex-direction:row!important;flex-wrap:wrap!important;border-right:none!important;border-bottom:1px solid ${C.border}!important;padding:12px!important;gap:8px!important}.cal-legend{display:none!important}}
      `}</style>
      <div style={{position:"absolute",inset:0,backgroundImage:`radial-gradient(ellipse at 15% 70%, rgba(46,107,69,0.08) 0%, transparent 55%), radial-gradient(ellipse at 85% 10%, rgba(204,150,51,0.05) 0%, transparent 50%)`,pointerEvents:"none"}}/>
      <div className="cal-layout" style={css.layout}>
        {/* ── Sidebar ── */}
        <aside className="cal-sidebar" style={css.sidebar}>
          <div style={{display:"flex",alignItems:"center",gap:8,paddingBottom:14,borderBottom:`1px solid ${C.border}`,marginBottom:4}}>
            <Icon.Package size={20} color={C.gold}/>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:C.gold}}>{cultivo?.nombre||"Mi Cultivo"}</div>
              <div style={{fontSize:9,color:C.gray2,display:"flex",alignItems:"center",gap:3}}>
                <Icon.MapPin size={8} color={C.gray2}/>{cultivo?.region||"Catatumbo · Colombia"}
              </div>
            </div>
          </div>
          <div style={{fontSize:9,color:C.gray3,letterSpacing:".1em",marginBottom:4,paddingLeft:4}}>{curY}</div>
          <div style={{display:"flex",flexDirection:"column",gap:2}}>
            {MONTHS_SHORT.map((mn,i)=>{
              const hasItems=Object.keys({...notes,...recommendations}).some(k=>k.startsWith(`${curY}-${String(i+1).padStart(2,"0")}-`));
              const isActive=i===curM&&view==="month";
              return(
                <button key={i} onClick={()=>{setCurM(i);setView("month");}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 8px",borderRadius:7,border:"none",cursor:"pointer",fontSize:11,fontFamily:"inherit",transition:"all .15s",background:isActive?C.greenLight:"transparent",color:isActive?C.green:C.gray2,fontWeight:isActive?700:400}}>
                  <span>{mn}</span>
                  {hasItems&&!isActive&&<span style={{width:5,height:5,borderRadius:"50%",background:C.gold}}/>}
                </button>
              );
            })}
          </div>
          <div className="cal-legend" style={{marginTop:"auto",paddingTop:14,borderTop:`1px solid ${C.border}`,display:"flex",flexDirection:"column",gap:5}}>
            {Object.entries(CATEGORIES).map(([k,v])=>{const CatIcon=v.Icon;return(
              <div key={k} style={{display:"flex",alignItems:"center",gap:5,fontSize:9,color:C.gray2}}>
                <CatIcon/>{v.label}
              </div>
            );})}
            <div style={{display:"flex",alignItems:"center",gap:5,fontSize:9,color:C.gray2,marginTop:2}}>
              <Icon.Star size={9} color={C.gold}/>Recomendación automática
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main style={css.main}>
          {!cultivoActivo?<SinCultivo/>:<PhaseBar cultivoActivo={cultivoActivo} weatherMap={weatherMap}/>}
          <ConfigFecha fechaInicio={localDate||cultivo?.fechaSiembra||""} onSave={savePlantDate}/>
          {cultivoActivo&&(<><ScoreSalud cultivoActivo={cultivoActivo} weatherMap={weatherMap} notes={notes}/><GraficaClima weatherMap={weatherMap}/></>)}

          {/* Cabecera */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:26,fontWeight:700,letterSpacing:"-.02em",lineHeight:1,color:C.white}}>
                {view==="week"?`Semana del ${weekStart.getDate()} ${MONTHS_SHORT[weekStart.getMonth()]}`:MONTHS[curM]}
              </div>
              <div style={{fontSize:10,color:C.gray2,marginTop:3}}>{curY}</div>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
              <WeatherChip currentWeather={currentWeather} weatherMap={weatherMap} weatherLoading={weatherLoading} lastUpdated={lastUpdated}/>
              <div style={{display:"flex",borderRadius:8,overflow:"hidden",border:`1px solid ${C.border}`}}>
                {["month","week"].map(v=>(
                  <button key={v} onClick={()=>setView(v)} style={{padding:"5px 10px",border:"none",cursor:"pointer",fontFamily:"inherit",fontSize:10,fontWeight:600,transition:"all .15s",background:view===v?C.greenLight:"transparent",color:view===v?C.green:C.gray2}}>
                    {v==="month"?"Mes":"Semana"}
                  </button>
                ))}
              </div>
              {cultivoActivo&&<ExportBitacora curY={curY} curM={curM} notes={notes} recommendations={recommendations} cultivoActivo={cultivoActivo}/>}
              {view==="month"?(
                <>
                  <button style={css.navBtn} onClick={prevMonth}><Icon.ChevronLeft size={16} color={C.gray2}/></button>
                  <button onClick={()=>{setCurY(today.getFullYear());setCurM(today.getMonth());}} style={css.todayBtn}>Hoy</button>
                  <button style={css.navBtn} onClick={nextMonth}><Icon.ChevronRight size={16} color={C.gray2}/></button>
                </>
              ):(
                <>
                  <button style={css.navBtn} onClick={prevWeek}><Icon.ChevronLeft size={16} color={C.gray2}/></button>
                  <button onClick={()=>{const d=new Date();d.setDate(d.getDate()-d.getDay());setWeekStart(d);}} style={css.todayBtn}>Hoy</button>
                  <button style={css.navBtn} onClick={nextWeek}><Icon.ChevronRight size={16} color={C.gray2}/></button>
                </>
              )}
            </div>
          </div>

          {/* Calendario mensual / semanal */}
          {view==="month"?(
            <>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
                {WEEKDAYS.map(w=>(<div key={w} style={{textAlign:"center",fontSize:9,color:C.gray2,letterSpacing:".07em",textTransform:"uppercase",padding:"3px 0"}}>{w}</div>))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
                {cells.map(({y,m,d,other},idx)=>{
                  const key=dk(y,m,d),dn=notes[key]||[],dr=recommendations[key]||[];
                  const todayC=isToday(y,m,d),past=!other&&isPastDate(y,m,d);
                  const allItems=[...dn.map(n=>({...n,isRec:false})),...dr.map(r=>({...r,cat:r.type,isRec:true}))];
                  const colors=[...new Set(allItems.map(n=>(CATEGORIES[n.cat]||REC_STYLE[n.cat]||CATEGORIES.general).color))];
                  return(
                    <div key={idx} className="cal-day" onClick={()=>!other&&setSelDate(key)} style={{height:78,overflow:"hidden",borderRadius:9,padding:"5px 5px 4px",transition:"all .15s",position:"relative",cursor:other?"default":"pointer",opacity:other?0.12:past?0.4:1,background:todayC?C.goldLight:allItems.length?C.bgCard:"transparent",border:todayC?`1px solid ${C.goldGlow}`:allItems.length?`1px solid ${C.border}`:"1px solid transparent"}}>
                      <span style={{fontSize:11,fontWeight:500,width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%",flexShrink:0,...(todayC?{background:C.gold,color:C.bg,fontWeight:700}:{color:past?C.gray3:C.gray1})}}>{d}</span>
                      {colors.length>0&&(<div style={{display:"flex",gap:2,marginTop:2,paddingLeft:1}}>{colors.slice(0,4).map((c,i)=>(<span key={i} style={{width:4,height:4,borderRadius:"50%",background:c}}/>))}</div>)}
                      {allItems.length>0&&(
                        <div style={{display:"flex",flexDirection:"column",gap:2,marginTop:2,overflow:"hidden"}}>
                          {allItems.slice(0,2).map((n,i)=>{
                            const cat=n.isRec?REC_STYLE[n.cat]||REC_STYLE.fase:CATEGORIES[n.cat]||CATEGORIES.general;
                            const CatIcon=cat.Icon;
                            return(
                              <div key={i} style={{fontSize:8,padding:"1px 3px",borderRadius:3,background:cat.bg,borderLeft:`2px solid ${cat.color}`,display:"flex",alignItems:"center",gap:2,overflow:"hidden"}}>
                                <span style={{flexShrink:0}}><CatIcon/></span>
                                <span style={{color:C.gray1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",lineHeight:1.3}}>{n.text}</span>
                              </div>
                            );
                          })}
                          {allItems.length>2&&<span style={{fontSize:8,color:C.gray2,paddingLeft:3}}>+{allItems.length-2}</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ):(
            <VistaSemana weekStart={weekStart} notes={notes} recommendations={recommendations} weatherMap={weatherMap} onSelectDate={setSelDate}/>
          )}
        </main>
      </div>

      {selDate&&(
        <NoteModal date={selDate} notes={notes} recs={recommendations} onAdd={addNote} onDelete={deleteNote} onClose={()=>setSelDate(null)}
          isPast={isPastDate(...selDate.split("-").map((v,i)=>i===1?Number(v)-1:Number(v)))} weatherMap={weatherMap}/>
      )}
    </div>
  );
}

// ─── Estilos ───────────────────────────────────────────────────────────────────
const css={
  root:{minHeight:"100vh",background:C.bg,fontFamily:"'DM Sans', system-ui, sans-serif",color:C.white,position:"relative",overflow:"hidden"},
  layout:{display:"flex",minHeight:"100vh",position:"relative",zIndex:1},
  sidebar:{width:168,flexShrink:0,padding:"20px 12px",borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",gap:8,background:C.bgDark},
  main:{flex:1,padding:"16px 18px",display:"flex",flexDirection:"column",gap:10,minWidth:0,overflowY:"auto"},
  phaseBar:{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:12,padding:"13px 15px",display:"flex",gap:14,flexWrap:"wrap",alignItems:"flex-start"},
  phaseLeft:{flex:1,minWidth:200},
  phaseTip:{fontSize:10,color:C.gray1,lineHeight:1.55,marginTop:8,background:`rgba(0,0,0,0.2)`,borderRadius:7,padding:"6px 10px",border:`1px solid ${C.border}`},
  phaseCards:{display:"flex",gap:7,flexWrap:"wrap"},
  miniCard:{background:C.bgCard,borderRadius:9,padding:"9px 12px",border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",minWidth:90},
  overlay:{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)"},
  modal:{background:C.bgDark,border:`1px solid ${C.border}`,borderRadius:16,width:490,maxWidth:"100%",maxHeight:"92vh",overflow:"hidden",display:"flex",flexDirection:"column",boxShadow:"0 30px 100px rgba(0,0,0,0.85)"},
  modalHead:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",padding:"16px 18px 13px",borderBottom:`1px solid ${C.border}`},
  xBtn:{width:24,height:24,borderRadius:"50%",border:`1px solid ${C.border}`,background:"transparent",color:C.gray2,cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center"},
  dayWeather:{display:"flex",alignItems:"center",gap:11,padding:"9px 18px",borderBottom:`1px solid ${C.border}`,background:"rgba(0,0,0,0.25)"},
  recsArea:{padding:"11px 18px 7px",borderBottom:`1px solid ${C.border}`},
  navBtn:{width:30,height:30,borderRadius:"50%",border:`1px solid ${C.border}`,background:"transparent",color:C.gray2,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"},
  todayBtn:{height:30,padding:"0 12px",borderRadius:15,border:`1px solid ${C.greenGlow}`,background:C.greenLight,color:C.green,cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"inherit"},
};