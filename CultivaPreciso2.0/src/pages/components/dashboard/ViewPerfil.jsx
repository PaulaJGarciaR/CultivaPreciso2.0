import { useState, useEffect } from "react";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { updateProfile, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "../../../firebase.js";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { User, Mail, Trash2, Save, Lock, Eye, EyeOff } from "lucide-react";

const db = getFirestore();

const validators = {
  name: (v) => v.trim().length >= 2,
  password: (v) => v.length >= 6,
};

function SectionCard({ title, icon, children }) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-5"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center gap-2">
        <span className="text-[#CC9633]">{icon}</span>
        <h2 className="text-white font-semibold text-sm">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-white/40 text-xs uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

function Input({ icon, type = "text", value, onChange, placeholder, rightIcon, disabled }) {
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
        className={`w-full ${icon ? "pl-10" : "pl-4"} ${rightIcon ? "pr-10" : "pr-4"} 
          h-11 rounded-xl text-sm text-white placeholder:text-white/20 outline-none transition-colors
          ${disabled
            ? "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
            : "bg-white/5 border border-white/10 focus:border-[#2E6B45]/60"
          }`}
      />
      {rightIcon && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightIcon}</span>
      )}
    </div>
  );
}

export default function ViewPerfil({ user, userData, setUserData }) {
  const navigate = useNavigate();

  const [firstName,  setFirstName]  = useState(userData?.firstName || "");
  const [lastName,   setLastName]   = useState(userData?.lastName  || "");
  const [savingInfo, setSavingInfo] = useState(false);

  const [deletePass,     setDeletePass]     = useState("");
  const [showDeletePass, setShowDeletePass] = useState(false);
  const [deleting,       setDeleting]       = useState(false);

  const isGoogle = user?.providerData?.[0]?.providerId === "google.com";

  const handleSaveInfo = async () => {
    if (!validators.name(firstName) || !validators.name(lastName)) {
      return Swal.fire({ icon: "warning", title: "Datos inválidos",
        text: "Nombre y apellido deben tener al menos 2 caracteres.",
        background: "#1A110D", color: "#fff", confirmButtonColor: "#CC9633" });
    }
    setSavingInfo(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { firstName, lastName });
      await updateProfile(auth.currentUser, { displayName: `${firstName} ${lastName}` });
      setUserData((p) => ({ ...p, firstName, lastName }));
      Swal.fire({ icon: "success", title: "Información actualizada",
        timer: 1500, showConfirmButton: false, background: "#1A110D", color: "#fff" });
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.message,
        background: "#1A110D", color: "#fff", confirmButtonColor: "#CC9633" });
    } finally {
      setSavingInfo(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar cuenta?",
      text: "Esta acción es irreversible. Se borrarán todos tus datos.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#CC9633",
      background: "#1A110D", color: "#fff",
    });
    if (!confirmed.isConfirmed) return;

    if (!isGoogle && !validators.password(deletePass))
      return Swal.fire({ icon: "warning", title: "Ingresa tu contraseña para confirmar",
        background: "#1A110D", color: "#fff", confirmButtonColor: "#CC9633" });

    setDeleting(true);
    try {
      if (!isGoogle) {
        const credential = EmailAuthProvider.credential(user.email, deletePass);
        await reauthenticateWithCredential(auth.currentUser, credential);
      }
      const { deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(auth.currentUser);
      Swal.fire({ icon: "success", title: "Cuenta eliminada",
        timer: 1500, showConfirmButton: false, background: "#1A110D", color: "#fff" });
      navigate("/");
    } catch (e) {
      const msg =
        e.code === "auth/wrong-password" || e.code === "auth/invalid-credential"
          ? "Contraseña incorrecta."
          : e.code === "auth/requires-recent-login"
          ? "Por seguridad, cierra sesión, vuelve a ingresar e intenta de nuevo."
          : e.message;
      Swal.fire({ icon: "error", title: "Error", text: msg,
        background: "#1A110D", color: "#fff", confirmButtonColor: "#CC9633" });
    } finally {
      setDeleting(false);
    }
  };

  const displayName = `${firstName} ${lastName}`.trim() || user?.email?.split("@")[0];
  const initials = firstName && lastName
    ? `${firstName[0]}${lastName[0]}`.toUpperCase()
    : "US";

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 pb-10">

      {/* Avatar + nombre */}
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-[#CC9633]/20 flex items-center justify-center shrink-0">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="avatar" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <span className="text-[#CC9633] text-2xl font-bold">{initials}</span>
          )}
        </div>
        <div>
          <h1 className="text-white text-xl font-semibold">{displayName}</h1>
          <p className="text-white/40 text-sm mt-0.5">{userData?.email || user?.email}</p>
          {isGoogle && (
            <span className="text-xs mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
              <svg width="12" height="12" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-4z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C41 35.2 44 30 44 24c0-1.3-.1-2.7-.4-4z"/>
              </svg>
              Cuenta de Google
            </span>
          )}
        </div>
      </div>

      {/* Información personal */}
      <SectionCard title="Información personal" icon={<User size={16} />}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre">
            <Input
              icon={<User size={15} />}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Tu nombre"
            />
          </Field>
          <Field label="Apellido">
            <Input
              icon={<User size={15} />}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Tu apellido"
            />
          </Field>
        </div>
        <Field label="Correo electrónico">
          <Input
            icon={<Mail size={15} />}
            value={userData?.email || user?.email || ""}
            disabled
          />
        </Field>
        <button
          onClick={handleSaveInfo}
          disabled={savingInfo}
          className="self-end flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
            bg-[#2E6B45] hover:bg-[#256038] disabled:opacity-50 text-white transition-colors"
        >
          <Save size={15} />
          {savingInfo ? "Guardando..." : "Guardar cambios"}
        </button>
      </SectionCard>

      {/* Zona de peligro */}
      <SectionCard title="Zona de peligro" icon={<Trash2 size={16} className="text-red-400" />}>
        <p className="text-white/40 text-sm">
          Eliminar tu cuenta es una acción permanente. Se borrarán todos tus datos y no podrás recuperarlos.
        </p>
        {!isGoogle && (
          <Field label="Confirma tu contraseña para eliminar">
            <Input
              icon={<Lock size={15} />}
              type={showDeletePass ? "text" : "password"}
              value={deletePass}
              onChange={(e) => setDeletePass(e.target.value)}
              placeholder="••••••••"
              rightIcon={
                <button onClick={() => setShowDeletePass(!showDeletePass)}
                  className="text-white/30 hover:text-white transition-colors">
                  {showDeletePass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
          </Field>
        )}
        <button
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="self-start flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
            bg-red-500/10 hover:bg-red-500/20 border border-red-500/20
            text-red-400 disabled:opacity-50 transition-colors"
        >
          <Trash2 size={15} />
          {deleting ? "Eliminando..." : "Eliminar mi cuenta"}
        </button>
      </SectionCard>
    </div>
  );
}