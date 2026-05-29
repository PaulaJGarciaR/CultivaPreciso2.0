import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import { signOut } from "firebase/auth";
import { auth } from "../firebase.js";
import Swal from "sweetalert2";
import {
  User, Mail, Phone, MapPin, Briefcase,
  BookOpen, Save, LogOut, Leaf, Camera
} from "lucide-react";

function SectionCard({ title, icon, children }) {
  return (
    <div className="rounded-2xl p-6 flex flex-col gap-5"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center gap-2">
        <span className="text-[#CC9633]">{icon}</span>
        <h2 className="text-white font-semibold text-sm">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-white/40 text-xs uppercase tracking-widest">
        {label} {required && <span className="text-[#CC9633]">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ icon, type = "text", value, onChange, placeholder, disabled }) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">{icon}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full ${icon ? "pl-10" : "pl-4"} pr-4
          h-11 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-colors
          ${disabled
            ? "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
            : "bg-white/5 border border-white/10 focus:border-[#2E6B45]/60"
          }`}
      />
    </div>
  );
}

function Textarea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-white/20
        outline-none transition-colors bg-white/5 border border-white/10
        focus:border-[#2E6B45]/60 resize-none"
    />
  );
}

const ESPECIALIDADES = [
  "Agronomía",
  "Fitosanidad",
  "Suelos y fertilización",
  "Agricultura de precisión",
  "Agroecología",
  "Extensión rural",
  "Biotecnología agrícola",
  "Otra",
];

export default function DashboardProfesional({ user }) {
  const navigate  = useNavigate();
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [userData, setUserData] = useState(null);

  const [form, setForm] = useState({
    titulo:        "",
    especialidad:  "",
    experiencia:   "",
    institucion:   "",
    bio:           "",
    telefono:      "",
    ciudad:        "",
    pais:          "Colombia",
    sitioWeb:      "",
    linkedin:      "",
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // ── Cargar datos ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }

    const cargar = async () => {
      try {
        const [userSnap, profSnap] = await Promise.all([
          getDoc(doc(db, "users",         user.uid)),
          getDoc(doc(db, "profesionales", user.uid)),
        ]);
        if (userSnap.exists()) setUserData(userSnap.data());
        if (profSnap.exists()) {
          const data = profSnap.data();
          setForm({
            titulo:       data.titulo       || "",
            especialidad: data.especialidad || "",
            experiencia:  data.experiencia  || "",
            institucion:  data.institucion  || "",
            bio:          data.bio          || "",
            telefono:     data.telefono     || "",
            ciudad:       data.ciudad       || "",
            pais:         data.pais         || "Colombia",
            sitioWeb:     data.sitioWeb     || "",
            linkedin:     data.linkedin     || "",
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [user?.uid]);

  // ── Guardar ───────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.titulo.trim() || !form.especialidad.trim()) {
      return Swal.fire({ icon: "warning", title: "Campos requeridos",
        text: "El título y la especialidad son obligatorios.",
        background: "#1A110D", color: "#fff", confirmButtonColor: "#CC9633" });
    }

    setSaving(true);
    try {
      await setDoc(doc(db, "profesionales", user.uid), {
        ...form,
        uid:         user.uid,
        email:       user.email,
        updatedAt:   serverTimestamp(),
      }, { merge: true });

      Swal.fire({ icon: "success", title: "Perfil guardado",
        timer: 1500, showConfirmButton: false,
        background: "#1A110D", color: "#fff" });
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.message,
        background: "#1A110D", color: "#fff", confirmButtonColor: "#CC9633" });
    } finally {
      setSaving(false);
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await signOut(auth);
    Swal.fire({ icon: "success", title: "Sesión terminada",
      timer: 1500, showConfirmButton: false,
      background: "#1A110D", color: "#fff" });
    navigate("/");
  };

  const displayName = userData
    ? `${userData.firstName || ""} ${userData.lastName || ""}`.trim()
    : user?.email?.split("@")[0];

  const initials = userData?.firstName && userData?.lastName
    ? `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase()
    : "PR";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "#1A110D" }}>
        <p className="text-white/30 text-sm">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col"
      style={{ background: "#1A110D", fontFamily: "'Lato', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@300;400;700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>

      {/* ── Header ── */}
      <header className="h-16 flex items-center justify-between px-8 shrink-0"
        style={{ background: "#120C08", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2E6B45] flex items-center justify-center">
            <Leaf size={16} className="text-white" />
          </div>
          <span className="font-serif text-white text-lg">
            Cultiva<span className="text-[#CC9633]">Preciso</span>
            <span className="text-white/30 text-sm font-sans ml-2">Profesional</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/40 text-sm hidden sm:inline">
            Hola, <span className="text-white/70 font-semibold">{displayName}</span>
          </span>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/40 hover:text-red-400 transition-colors">
            <LogOut size={15} /> Salir
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">

          {/* Avatar + nombre */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-[#CC9633]/20 flex items-center justify-center shrink-0">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="avatar"
                    className="w-20 h-20 rounded-2xl object-cover" />
                ) : (
                  <span className="text-[#CC9633] text-2xl font-bold">{initials}</span>
                )}
              </div>
            </div>
            <div>
              <h1 className="text-white text-xl font-semibold font-serif">{displayName}</h1>
              <p className="text-white/40 text-sm mt-0.5">{user?.email}</p>
              <span className="text-xs mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ background: "rgba(204,150,51,0.1)", color: "#CC9633", border: "1px solid rgba(204,150,51,0.2)" }}>
                Profesional
              </span>
            </div>
          </div>

          {/* ── Información profesional ── */}
          <SectionCard title="Información profesional" icon={<Briefcase size={16} />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Título / Profesión" required>
                <Input
                  icon={<Briefcase size={15} />}
                  value={form.titulo}
                  onChange={(e) => set("titulo", e.target.value)}
                  placeholder="Ej: Ingeniero Agrónomo"
                />
              </Field>
              <Field label="Especialidad" required>
                <div className="relative">
                  <select
                    value={form.especialidad}
                    onChange={(e) => set("especialidad", e.target.value)}
                    className="w-full h-11 pl-4 pr-4 rounded-xl text-sm text-white outline-none
                      transition-colors bg-white/5 border border-white/10 focus:border-[#2E6B45]/60
                      appearance-none cursor-pointer"
                    style={{ backgroundImage: "none" }}
                  >
                    <option value="" style={{ background: "#1A110D" }}>Seleccionar...</option>
                    {ESPECIALIDADES.map((e) => (
                      <option key={e} value={e} style={{ background: "#1A110D" }}>{e}</option>
                    ))}
                  </select>
                </div>
              </Field>
              <Field label="Años de experiencia">
                <Input
                  icon={<BookOpen size={15} />}
                  type="number"
                  value={form.experiencia}
                  onChange={(e) => set("experiencia", e.target.value)}
                  placeholder="Ej: 5"
                />
              </Field>
              <Field label="Institución / Empresa">
                <Input
                  icon={<Briefcase size={15} />}
                  value={form.institucion}
                  onChange={(e) => set("institucion", e.target.value)}
                  placeholder="Ej: Universidad Nacional"
                />
              </Field>
            </div>
            <Field label="Descripción / Bio">
              <Textarea
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
                placeholder="Cuéntanos sobre tu experiencia, áreas de trabajo y cómo puedes ayudar a los agricultores..."
                rows={4}
              />
            </Field>
          </SectionCard>

          {/* ── Información de contacto ── */}
          <SectionCard title="Información de contacto" icon={<Phone size={16} />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Teléfono / WhatsApp">
                <Input
                  icon={<Phone size={15} />}
                  type="tel"
                  value={form.telefono}
                  onChange={(e) => set("telefono", e.target.value)}
                  placeholder="Ej: +57 300 123 4567"
                />
              </Field>
              <Field label="Ciudad">
                <Input
                  icon={<MapPin size={15} />}
                  value={form.ciudad}
                  onChange={(e) => set("ciudad", e.target.value)}
                  placeholder="Ej: Cúcuta"
                />
              </Field>
              <Field label="País">
                <Input
                  icon={<MapPin size={15} />}
                  value={form.pais}
                  onChange={(e) => set("pais", e.target.value)}
                  placeholder="Ej: Colombia"
                />
              </Field>
              <Field label="Correo electrónico">
                <Input
                  icon={<Mail size={15} />}
                  value={user?.email || ""}
                  disabled
                />
              </Field>
              <Field label="Sitio web">
                <Input
                  icon={<BookOpen size={15} />}
                  type="url"
                  value={form.sitioWeb}
                  onChange={(e) => set("sitioWeb", e.target.value)}
                  placeholder="https://mipagina.com"
                />
              </Field>
              <Field label="LinkedIn">
                <Input
                  icon={<User size={15} />}
                  type="url"
                  value={form.linkedin}
                  onChange={(e) => set("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/usuario"
                />
              </Field>
            </div>
          </SectionCard>

          {/* Botón guardar */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="self-end flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium
              bg-[#CC9633] hover:bg-[#B5832D] disabled:opacity-50 text-black transition-colors"
          >
            <Save size={15} />
            {saving ? "Guardando..." : "Guardar perfil"}
          </button>

        </div>
      </main>
    </div>
  );
}