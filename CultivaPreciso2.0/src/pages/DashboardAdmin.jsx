import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFirestore, collection, getDocs,
  doc, updateDoc, deleteDoc
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth } from "../firebase.js";
import Swal from "sweetalert2";
import { 
  Users, LogOut, Search, Edit2, 
  Trash2, Save, X, Shield
} from "lucide-react";

const db = getFirestore();

export default function DashboardAdmin({ user }) {
  const navigate = useNavigate();
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData]   = useState({});

  // ── Cargar usuarios ───────────────────────────────────────────────────────
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(list);
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error al cargar usuarios",
        text: e.message, background: "#1A110D", color: "#fff",
        confirmButtonColor: "#CC9633" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // ── Editar ────────────────────────────────────────────────────────────────
  const startEdit = (u) => {
    setEditingId(u.id);
    setEditData({ firstName: u.firstName, lastName: u.lastName, role: u.role || "agricultor" });
  };

  const cancelEdit = () => { setEditingId(null); setEditData({}); };

  const handleSave = async (id) => {
    if (!editData.firstName?.trim() || !editData.lastName?.trim()) {
      return Swal.fire({ icon: "warning", title: "Campos requeridos",
        text: "Nombre y apellido son obligatorios.",
        background: "#1A110D", color: "#fff", confirmButtonColor: "#CC9633" });
    }
    try {
      await updateDoc(doc(db, "users", id), {
        firstName: editData.firstName.trim(),
        lastName:  editData.lastName.trim(),
        role:      editData.role,
      });
      setUsers((prev) => prev.map((u) =>
        u.id === id ? { ...u, ...editData } : u
      ));
      setEditingId(null);
      Swal.fire({ icon: "success", title: "Usuario actualizado",
        timer: 1200, showConfirmButton: false,
        background: "#1A110D", color: "#fff" });
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: e.message,
        background: "#1A110D", color: "#fff", confirmButtonColor: "#CC9633" });
    }
  };

  // ── Eliminar ──────────────────────────────────────────────────────────────
  const handleDelete = async (id, email) => {
  if (email === user?.email) {
    return Swal.fire({ icon: "warning", title: "No puedes eliminarte a ti mismo",
      background: "#1A110D", color: "#fff", confirmButtonColor: "#CC9633" });
  }

  const confirmed = await Swal.fire({
    icon: "warning",
    title: "¿Eliminar usuario?",
    text: `Se eliminará ${email} y todos sus datos permanentemente.`,
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#EF4444",
    cancelButtonColor: "#CC9633",
    background: "#1A110D", color: "#fff",
  });
  if (!confirmed.isConfirmed) return;

  try {
    // 1. Borrar documento de users
    await deleteDoc(doc(db, "users", id));

    // 2. Borrar documento de cultivos
    await deleteDoc(doc(db, "cultivos", id));

    // 3. Borrar documento de calendar
    await deleteDoc(doc(db, "calendar", id));

    setUsers((prev) => prev.filter((u) => u.id !== id));

    Swal.fire({ icon: "success", title: "Usuario eliminado",
      text: "Se borraron sus datos de cultivo y calendario.",
      timer: 1500, showConfirmButton: false,
      background: "#1A110D", color: "#fff" });
  } catch (e) {
    Swal.fire({ icon: "error", title: "Error", text: e.message,
      background: "#1A110D", color: "#fff", confirmButtonColor: "#CC9633" });
  }
};

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // ── Filtro búsqueda ───────────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(q) ||
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q)
    );
  });

  const roleColor = (role) =>
    role === "admin"
      ? { background: "rgba(204,150,51,0.12)", color: "#CC9633", border: "1px solid rgba(204,150,51,0.3)" }
      : { background: "rgba(46,107,69,0.12)",  color: "#4CAF7D", border: "1px solid rgba(46,107,69,0.3)"  };

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#1A110D", fontFamily: "'Lato', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@300;400;700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .table-row:hover { background: rgba(255,255,255,0.03); }
      `}</style>

      {/* Header */}
      <header className="h-16 flex items-center justify-between px-8 shrink-0"
        style={{ background: "#120C08", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#CC9633] flex items-center justify-center">
            <Shield size={16} className="text-black" />
          </div>
          <span className="font-serif text-white text-lg">
            Cultiva<span className="text-[#CC9633]">Preciso</span>
            <span className="text-white/30 text-sm font-sans ml-2">Admin</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/40 text-sm">
            Hola, <span className="text-white/70 font-semibold">{user?.email}</span>
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm
              text-white/40 hover:text-red-400 transition-colors"
          >
            <LogOut size={15} /> Salir
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 p-8">

        {/* Título + stats */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-serif text-white text-2xl">Gestión de usuarios</h1>
            <p className="text-white/30 text-sm mt-0.5">
              {users.length} usuarios registrados
            </p>
          </div>
          <div className="flex gap-3">
            {/* Stat admins */}
            <div className="px-4 py-2 rounded-xl text-sm"
              style={{ background: "rgba(204,150,51,0.08)", border: "1px solid rgba(204,150,51,0.15)" }}>
              <span className="text-[#CC9633] font-semibold">
                {users.filter((u) => u.role === "admin").length}
              </span>
              <span className="text-white/30 ml-1.5">admins</span>
            </div>
            {/* Stat agricultores */}
            <div className="px-4 py-2 rounded-xl text-sm"
              style={{ background: "rgba(46,107,69,0.08)", border: "1px solid rgba(46,107,69,0.15)" }}>
              <span className="text-[#4CAF7D] font-semibold">
                {users.filter((u) => u.role !== "admin").length}
              </span>
              <span className="text-white/30 ml-1.5">agricultores</span>
            </div>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative mb-5 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="w-full pl-9 pr-4 h-10 rounded-xl text-sm text-white outline-none
              placeholder:text-white/20"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          />
        </div>

        {/* Tabla */}
        <div className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}>

          {/* Cabecera */}
          <div className="grid grid-cols-[1fr_1fr_2fr_120px_100px] gap-4 px-5 py-3 text-xs uppercase tracking-widest text-white/25"
            style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span>Nombre</span>
            <span>Apellido</span>
            <span>Correo</span>
            <span>Rol</span>
            <span className="text-right">Acciones</span>
          </div>

          {/* Filas */}
          {loading ? (
            <div className="py-16 text-center text-white/30 text-sm">Cargando...</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-white/30 text-sm">No se encontraron usuarios.</div>
          ) : (
            filtered.map((u) => (
              <div key={u.id}
                className="grid grid-cols-[1fr_1fr_2fr_120px_100px] gap-4 px-5 py-3 items-center"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>

                {editingId === u.id ? (
                  <>
                    {/* Nombre editable */}
                    <input
                      value={editData.firstName}
                      onChange={(e) => setEditData((p) => ({ ...p, firstName: e.target.value }))}
                      className="h-8 px-2 rounded-lg text-sm text-white outline-none"
                      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                    />
                    {/* Apellido editable */}
                    <input
                      value={editData.lastName}
                      onChange={(e) => setEditData((p) => ({ ...p, lastName: e.target.value }))}
                      className="h-8 px-2 rounded-lg text-sm text-white outline-none"
                      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                    />
                    {/* Correo (no editable) */}
                    <span className="text-white/30 text-sm truncate">{u.email}</span>
                    {/* Rol editable */}
                    <select
                      value={editData.role}
                      onChange={(e) => setEditData((p) => ({ ...p, role: e.target.value }))}
                      className="h-8 px-2 rounded-lg text-sm text-white outline-none"
                      style={{ background: "#1A110D", border: "1px solid rgba(255,255,255,0.15)" }}
                    >
                      <option value="agricultor">Agricultor</option>
                      <option value="admin">Admin</option>
                    </select>
                    {/* Botones guardar/cancelar */}
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => handleSave(u.id)}
                        className="p-1.5 rounded-lg text-green-400 hover:bg-green-400/10 transition-colors">
                        <Save size={15} />
                      </button>
                      <button onClick={cancelEdit}
                        className="p-1.5 rounded-lg text-white/30 hover:bg-white/5 transition-colors">
                        <X size={15} />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-white text-sm truncate">{u.firstName || "—"}</span>
                    <span className="text-white text-sm truncate">{u.lastName  || "—"}</span>
                    <span className="text-white/50 text-sm truncate">{u.email}</span>
                    <span className="text-xs px-2.5 py-1 rounded-full w-fit"
                      style={roleColor(u.role)}>
                      {u.role === "admin" ? "Admin" : "Agricultor"}
                    </span>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => startEdit(u)}
                        className="p-1.5 rounded-lg text-white/30 hover:text-[#CC9633] hover:bg-[#CC9633]/10 transition-colors">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(u.id, u.email)}
                        className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}