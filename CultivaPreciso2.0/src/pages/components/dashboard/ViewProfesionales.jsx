import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../firebase";
import { Search, X, Mail, Phone, MapPin, Briefcase, BookOpen, Globe} from "lucide-react";

const ESPECIALIDADES = [
  "Todas",
  "Agronomía",
  "Fitosanidad",
  "Suelos y fertilización",
  "Agricultura de precisión",
  "Agroecología",
  "Extensión rural",
  "Biotecnología agrícola",
  "Otra",
];

function Avatar({ nombre, photoURL, size = "md" }) {
  const sizes = { sm: "w-10 h-10 text-sm", md: "w-14 h-14 text-lg", lg: "w-20 h-20 text-2xl" };
  const initials = nombre
    ? nombre.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
    : "PR";

  if (photoURL) {
    return (
      <img src={photoURL} alt={nombre}
        className={`${sizes[size]} rounded-full object-cover shrink-0`} />
    );
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-[#CC9633]/20 flex items-center justify-center shrink-0`}>
      <span className="text-[#CC9633] font-bold">{initials}</span>
    </div>
  );
}

function ProfesionalCard({ prof, onClick }) {
  return (
    <div
      onClick={() => onClick(prof)}
      className="rounded-2xl p-5 flex flex-col gap-3 cursor-pointer transition-all hover:scale-[1.01]"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar nombre={`${prof.firstName} ${prof.lastName}`} photoURL={prof.photoURL} />
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">
            {prof.firstName} {prof.lastName}
          </h3>
          <p className="text-[#CC9633] text-xs mt-0.5 truncate">{prof.titulo || "Profesional"}</p>
          {prof.institucion && (
            <p className="text-white/30 text-xs truncate">{prof.institucion}</p>
          )}
        </div>
      </div>

      {/* Especialidad */}
      {prof.especialidad && (
        <span className="text-xs px-2.5 py-1 rounded-full w-fit font-medium"
          style={{ background: "rgba(46,107,69,0.15)", color: "#4CAF7D", border: "1px solid rgba(46,107,69,0.25)" }}>
          {prof.especialidad}
        </span>
      )}

      {/* Bio */}
      {prof.bio && (
        <p className="text-white/40 text-xs leading-relaxed line-clamp-2">{prof.bio}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-3 text-white/25 text-xs">
          {prof.ciudad && (
            <span className="flex items-center gap-1">
              <MapPin size={10} /> {prof.ciudad}
            </span>
          )}
          {prof.experiencia && (
            <span className="flex items-center gap-1">
              <BookOpen size={10} /> {prof.experiencia} años
            </span>
          )}
        </div>
        <span className="text-[#CC9633] text-xs font-medium hover:underline">
          Ver perfil →
        </span>
      </div>
    </div>
  );
}

function Modal({ prof, onClose }) {
  if (!prof) return null;

  const fullName = `${prof.firstName || ""} ${prof.middleName ? prof.middleName + " " : ""}${prof.lastName || ""} ${prof.secondSurname || ""}`.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ background: "#120C08", border: "1px solid rgba(255,255,255,0.08)" }}>

        {/* Header modal */}
        <div className="flex items-start justify-between p-6"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-4">
            <Avatar nombre={fullName} photoURL={prof.photoURL} size="lg" />
            <div>
              <h2 className="text-white font-semibold text-lg">{fullName}</h2>
              <p className="text-[#CC9633] text-sm mt-0.5">{prof.titulo || "Profesional"}</p>
              {prof.institucion && (
                <p className="text-white/40 text-xs mt-0.5">{prof.institucion}</p>
              )}
              {prof.especialidad && (
                <span className="text-xs px-2 py-0.5 rounded-full mt-1.5 inline-block font-medium"
                  style={{ background: "rgba(46,107,69,0.15)", color: "#4CAF7D", border: "1px solid rgba(46,107,69,0.25)" }}>
                  {prof.especialidad}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose}
            className="text-white/30 hover:text-white transition-colors shrink-0 mt-1">
            <X size={18} />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-5">

          {/* Bio */}
          {prof.bio && (
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Sobre mí</p>
              <p className="text-white/60 text-sm leading-relaxed">{prof.bio}</p>
            </div>
          )}

          {/* Detalles profesionales */}
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Información profesional</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Especialidad",  value: prof.especialidad, icon: <Briefcase size={13} /> },
                { label: "Experiencia",   value: prof.experiencia ? `${prof.experiencia} años` : null, icon: <BookOpen size={13} /> },
                { label: "Institución",   value: prof.institucion,  icon: <Briefcase size={13} /> },
                { label: "Ubicación",     value: prof.ciudad && prof.pais ? `${prof.ciudad}, ${prof.pais}` : prof.ciudad || prof.pais, icon: <MapPin size={13} /> },
              ].filter((i) => i.value).map((item) => (
                <div key={item.label} className="rounded-xl px-3 py-3"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center gap-1.5 mb-1 text-white/30">
                    {item.icon}
                    <span className="text-xs uppercase tracking-widest">{item.label}</span>
                  </div>
                  <p className="text-white text-sm font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contacto */}
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Contacto</p>
            <div className="flex flex-col gap-2">
              {prof.email && (
                <a href={`mailto:${prof.email}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-white/5"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <Mail size={14} className="text-[#CC9633] shrink-0" />
                  <span className="text-white/60 text-sm">{prof.email}</span>
                </a>
              )}
              {prof.telefono && (
                <a href={`tel:${prof.telefono}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-white/5"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <Phone size={14} className="text-[#CC9633] shrink-0" />
                  <span className="text-white/60 text-sm">{prof.telefono}</span>
                </a>
              )}
              {prof.sitioWeb && (
                <a href={prof.sitioWeb} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-white/5"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <Globe size={14} className="text-[#CC9633] shrink-0" />
                  <span className="text-white/60 text-sm truncate">{prof.sitioWeb}</span>
                </a>
              )}
              {prof.Linkedin && (
                <a href={prof.Linkedin} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-white/5"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <Mail size={14} className="text-[#CC9633] shrink-0" />
                  <span className="text-white/60 text-sm truncate">LinkedIn</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ViewProfesionales() {
  const [profesionales, setProfesionales] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [filtroEsp,     setFiltroEsp]     = useState("Todas");
  const [selected,      setSelected]      = useState(null);

  // ── Cargar profesionales ──────────────────────────────────────────────────
  useEffect(() => {
    const cargar = async () => {
      try {
        // Trae usuarios con role=profesional
        const usersSnap = await getDocs(collection(db, "users"));
        const profUsers = usersSnap.docs
          .map((d) => ({ uid: d.id, ...d.data() }))
          .filter((u) => u.role === "profesional");

        // Trae info profesional de cada uno
        const profSnap = await getDocs(collection(db, "profesionales"));
        const profMap  = {};
        profSnap.docs.forEach((d) => { profMap[d.id] = d.data(); });

        // Combina ambos
        const combinados = profUsers.map((u) => ({
          ...u,
          ...(profMap[u.uid] || {}),
        }));

        setProfesionales(combinados);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  // ── Filtros ───────────────────────────────────────────────────────────────
  const filtrados = profesionales.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      p.titulo?.toLowerCase().includes(q) ||
      p.especialidad?.toLowerCase().includes(q) ||
      p.ciudad?.toLowerCase().includes(q);

    const matchEsp = filtroEsp === "Todas" || p.especialidad === filtroEsp;

    return matchSearch && matchEsp;
  });

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-5xl">

      {/* Título */}
      <div>
        <h2 className="font-serif text-white text-xl">Profesionales disponibles</h2>
        <p className="text-white/30 text-sm mt-0.5">
          Encuentra expertos que pueden ayudarte con tu cultivo.
        </p>
      </div>

      {/* Buscador */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, especialidad..."
          className="w-full pl-9 pr-4 h-10 rounded-xl text-sm text-white outline-none placeholder:text-white/20"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        />
      </div>

      {/* Filtro especialidad */}
      <div className="flex gap-2 flex-wrap">
        {ESPECIALIDADES.map((esp) => (
          <button
            key={esp}
            onClick={() => setFiltroEsp(esp)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
            style={{
              background: filtroEsp === esp ? "rgba(46,107,69,0.2)"  : "rgba(255,255,255,0.04)",
              border:     filtroEsp === esp ? "1px solid #2E6B45"    : "1px solid rgba(255,255,255,0.08)",
              color:      filtroEsp === esp ? "#4CAF7D"              : "rgba(255,255,255,0.4)",
            }}
          >
            {esp}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="py-20 text-center text-white/30 text-sm">Cargando profesionales...</div>
      ) : filtrados.length === 0 ? (
        <div className="py-20 text-center">
          <span className="text-4xl">🔬</span>
          <p className="text-white/30 text-sm mt-3">No se encontraron profesionales.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map((prof) => (
            <ProfesionalCard
              key={prof.uid}
              prof={prof}
              onClick={setSelected}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal prof={selected} onClose={() => setSelected(null)} />
    </div>
  );
}