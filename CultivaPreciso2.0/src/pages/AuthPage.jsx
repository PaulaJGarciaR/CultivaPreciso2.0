import { useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  CheckSquare,
  Leaf,
} from "lucide-react";

export default function AuthPage() {
  const [tab, setTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="flex min-h-screen font-sans">
      {/* Panel izquierdo */}
      <div className="relative hidden md:flex flex-1 items-end p-10">
        <img
          src="https://tienda.marassinaperu.com/wp-content/uploads/2025/05/Cacao-en-polvo-Natural-Marassinaperu.webp"
          alt="Campo"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient from-green-950/20 to-green-950/75" />
        <div className="relative text-white">
          <div className="flex items-center gap-2 mb-4">
            <Leaf size={20} />
            <span className="text-sm font-medium">AgroPrecisión</span>
          </div>
          <h2 className="text-3xl font-bold leading-tight max-w-xs mb-3">
            Agricultura inteligente para cultivos sostenibles
          </h2>
          <p className="text-sm text-white/80 max-w-xs leading-relaxed">
            Optimiza tus cultivos de cacao con análisis de datos, mapeo
            inteligente y recomendaciones basadas en inteligencia artificial.
          </p>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="w-[50%] bg-[#55362E] flex flex-col justify-center px-8 py-10 overflow-y-auto">
        <div className="bg-[#382615]/40 px-4 py-10 rounded-2xl">
          {/* Heading dinámico */}
          {tab === "login" ? (
            <>
            <div className="flex justify-center">
                 <div className="w-[90%]" >
                 <h1 className="text-2xl font-bold text-white mb-1">
                Bienvenido de vuelta
              </h1>
              <p className="text-sm text-gray-200 mb-5">
                Ingresa tus credenciales para acceder a tu cuenta
              </p>
            </div>

            </div>
        
             
            </>
          ) : (
            <>
            <div className="flex justify-center">
                <div className="w-[90%]">
                     <h1 className="text-2xl font-bold text-white mb-1">
                Crear cuenta
              </h1>
              <p className="text-sm text-gray-200 mb-5">
                Completa tus datos para empezar a usar AgroPrecisión
              </p>
                </div>
            </div>
             
            </>
          )}

          {/* Tabs */}
          <div className="flex justify-center">
            <div className="flex bg-[#55362E] rounded-lg p-1 mb-5 w-[90%]">
              {[
                { key: "login", label: "Iniciar Sesión" },
                { key: "register", label: "Registrarse" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex-1 py-2 text-sm rounded-md font-medium transition-all ${
                    tab === key
                      ? "bg-[#CC9633] text-gray-900 shadow-sm"
                      : "text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── FORMULARIO LOGIN ── */}
          {tab === "login" && (
            <div className="flex justify-center">
              <div className="flex flex-col gap-2 w-[90%] justify-center">
                <div className="space-y-0.5">
                  <label className="text-white text-sm font-medium">
                    Correo electrónico
                  </label>
                  <div className="relative my-2">
                    <Mail className="text-white absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cream/30" />
                    <input
                      type="email"
                      className="w-full pl-10 text-white bg-[#55362E] focus:border-gold/40 focus:ring-gold/20 h-11 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-0.5">
                  <label className="text-white text-sm font-medium">
                    Contraseña
                  </label>
                  <div className="relative my-2">
                    <Lock className="text-white absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cream/30" />
                    <input
                      type="password"
                      className="w-full pl-10 text-white bg-[#55362E] border-cream/10 text-cream focus:border-gold/40 focus:ring-gold/20 h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <a
                    href="#"
                    className="text-xs text-[#CC9633] font-bold hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <button className="w-full py-3 bg-[#CC9633] hover:bg-[#B5832D] text-black text-sm font-medium rounded-lg transition-colors">
                  Iniciar Sesión
                </button>
                <div className="flex justify-center">
                  <button
                    type="button"
                    className="w-[40%] mt-4 rounded-2xl text-xs font-bold flex justify-center gap-2 border border-[#CC9633] text-white p-2 mr-2 cursor-pointer hover:bg-[#CC9633] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      x="0px"
                      y="0px"
                      width="18"
                      height="18 "
                      viewBox="0 0 48 48"
                    >
                      <path
                        fill="#FFC107"
                        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                      ></path>
                      <path
                        fill="#FF3D00"
                        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                      ></path>
                      <path
                        fill="#4CAF50"
                        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                      ></path>
                      <path
                        fill="#1976D2"
                        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                      ></path>
                    </svg>
                    Continúa con Google
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── FORMULARIO REGISTER ── */}
          {tab === "register" && (
           <div className="flex justify-center">
             <div className="flex flex-col gap-3 w-[90%]">
              <div className="flex gap-3">
                <div className="flex flex-col w-[50%]">
                  <label className=" text-white text-sm font-medium">
                    Nombre
                  </label>
                  <div className="relative mt-2">
                    <User className="text-white absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cream/30" />
                    <input
                      className="w-full pl-10 text-white bg-[#55362E] border-cream/10 text-cream focus:border-gold/40 focus:ring-gold/20 h-11 rounded-xl"
                      type="text"
                    />
                  </div>
                </div>
                <div className="flex flex-col w-[50%]">
                  <label className="text-white text-sm font-medium">
                    Apellido
                  </label>
                  <div className="relative mt-2">
                    <User className="text-white absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cream/30" />
                    <input
                      type="text"
                      className=" w-full pl-10 text-white bg-[#55362E] border-cream/10 text-cream focus:border-gold/40 focus:ring-gold/20 h-11 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className=" text-white text-sm font-medium">
                  Correo electrónico
                </label>
                <div className="relative mt-2">
                  <Mail className="text-white absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cream/30" />
                  <input
                    type="email"
                    className="w-full pl-10 text-white bg-[#55362E] border-cream/10 text-cream focus:border-gold/40 focus:ring-gold/20 h-11 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className=" text-white text-sm font-medium">
                  Contraseña
                </label>
                <div className="relative mt-2">
                  <Lock className="text-white absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cream/30" />
                  <input
                    type="password"
                    className="w-full pl-10 text-white bg-[#55362E] border-cream/10 text-cream focus:border-gold/40 focus:ring-gold/20 h-11 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className=" text-white text-sm font-medium">
                  Confirmar contraseña
                </label>
                <div className="relative mt-2">
                  <Lock className="text-white absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cream/30" />
                  <input
                    type="password"
                    className="w-full pl-10 text-white bg-[#55362E] border-cream/10 text-cream focus:border-gold/40 focus:ring-gold/20 h-11 rounded-xl"
                  />
                </div>
              </div>
              <button className="w-full py-3 bg-[#CC9633] hover:bg-[#B5832D] text-black text-sm font-medium rounded-lg transition-colors">
                Crear cuenta
              </button>
            </div>
           </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Componentes auxiliares ── */

function InputField({ icon, type, placeholder, rightIcon }) {
  return (
    <div className="flex items-center border border-gray-200 rounded-lg px-3 h-11 gap-2 w-full">
      {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
      <input
        type={type}
        placeholder={placeholder}
        className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder:text-gray-400 min-w-0"
      />
      {rightIcon}
    </div>
  );
}
