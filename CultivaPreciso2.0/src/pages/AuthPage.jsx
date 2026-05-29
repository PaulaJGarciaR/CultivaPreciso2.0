import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Leaf,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, GoogleProvider } from "../firebase.js";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.js";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// ── Helpers de validación ──
const validators = {
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  password: (v) => v.length >= 6,
  strongPassword: (v) => ({
    length: v.length >= 8,
    upper: /[A-Z]/.test(v),
    lower: /[a-z]/.test(v),
    number: /[0-9]/.test(v),
    special: /[^A-Za-z0-9]/.test(v),
  }),
  name: (v) => v.trim().length >= 2,
  match: (a, b) => a === b && a.length > 0,
};

const getPasswordStrength = (checks) => {
  const passed = Object.values(checks).filter(Boolean).length;
  if (passed <= 1)
    return { label: "Muy débil", color: "#EF4444", width: "20%" };
  if (passed === 2) return { label: "Débil", color: "#F97316", width: "40%" };
  if (passed === 3) return { label: "Media", color: "#EAB308", width: "60%" };
  if (passed === 4) return { label: "Fuerte", color: "#22C55E", width: "80%" };
  return { label: "Muy fuerte", color: "#16A34A", width: "100%" };
};

const translateError = (code) => {
  const errors = {
    "auth/user-not-found": "No existe una cuenta con ese correo.",
    "auth/wrong-password": "Contraseña incorrecta.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/email-already-in-use": "Ese correo ya está registrado.",
    "auth/invalid-email": "El correo no es válido.",
    "auth/weak-password": "La contraseña es muy débil (mín. 6 caracteres).",
    "auth/popup-closed-by-user": "Cerraste el popup de Google.",
    "auth/too-many-requests": "Demasiados intentos. Intenta más tarde.",
    "auth/network-request-failed": "Error de red. Revisa tu conexión.",
  };
  return errors[code] || "Ocurrió un error. Intenta de nuevo.";
};

function FieldWrapper({ label, error, touched, success, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-white text-sm font-medium">{label}</label>
      {children}
      {touched && error && (
        <p className="text-xs text-red-400 flex items-center gap-1 mt-0.5">
          <XCircle size={12} /> {error}
        </p>
      )}
      {touched && success && !error && (
        <p className="text-xs text-green-400 flex items-center gap-1 mt-0.5">
          <CheckCircle size={12} /> {success}
        </p>
      )}
    </div>
  );
}

function TextInput({
  icon,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  rightIcon,
  hasError,
  hasSuccess,
  touched,
}) {
  const borderColor =
    touched && hasError
      ? "ring-1 ring-red-500"
      : touched && hasSuccess
        ? "ring-1 ring-green-500"
        : "";

  return (
    <div className={`relative mt-1 ${borderColor} rounded-xl`}>
      <span className="text-white/60 absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4">
        {icon}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 text-white bg-[#55362E] h-11 rounded-xl outline-none placeholder:text-white/25 text-sm"
      />
      {rightIcon && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {rightIcon}
        </span>
      )}
    </div>
  );
}

function PasswordStrengthBar({ password }) {
  if (!password) return null;
  const checks = validators.strongPassword(password);
  const strength = getPasswordStrength(checks);

  return (
    <div className="mt-1.5 flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: strength.width, backgroundColor: strength.color }}
          />
        </div>
        <span
          className="text-xs font-medium"
          style={{
            color: strength.color,
            minWidth: "70px",
            textAlign: "right",
          }}
        >
          {strength.label}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        {[
          { key: "length", label: "Mín. 8 caracteres" },
          { key: "upper", label: "Mayúscula" },
          { key: "lower", label: "Minúscula" },
          { key: "number", label: "Número" },
          { key: "special", label: "Carácter especial" },
        ].map(({ key, label }) => (
          <p
            key={key}
            className={`text-xs flex items-center gap-1 ${checks[key] ? "text-green-400" : "text-white/40"}`}
          >
            {checks[key] ? <CheckCircle size={10} /> : <XCircle size={10} />}
            {label}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function AuthPage() {
  const [tab, setTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [globalSuccess, setGlobalSuccess] = useState("");
  const navigate = useNavigate();

  const redirectByRole = async (uid) => {
    const snap = await getDoc(doc(db, "users", uid));
    const role = snap.data()?.role || "agricultor";
    if (role === "admin") navigate("/dashboardAdmin");
    else if (role === "profesional") navigate("/dashboardProfesional");
    else navigate("/dashboardAgricultor");
  };

  // Login
  const [login, setLogin] = useState({ email: "", password: "" });
  const [loginTouched, setLoginTouched] = useState({});
  const loginErrors = {
    email: !validators.email(login.email) ? "Ingresa un correo válido." : "",
    password: !validators.password(login.password)
      ? "La contraseña debe tener al menos 6 caracteres."
      : "",
  };
  const loginValid = Object.values(loginErrors).every((e) => !e);

  // Register
  const [reg, setReg] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    secondSurname: "",
    email: "",
    password: "",
    confirm: "",
    userType: "agricultor",
  });
  const [regTouched, setRegTouched] = useState({});
  const regErrors = {
    firstName: !validators.name(reg.firstName) ? "Mínimo 2 caracteres." : "",
    lastName: !validators.name(reg.lastName) ? "Mínimo 2 caracteres." : "",
    email: !validators.email(reg.email) ? "Ingresa un correo válido." : "",
    password: !validators.password(reg.password) ? "Mínimo 6 caracteres." : "",
    confirm: !validators.match(reg.password, reg.confirm)
      ? "Las contraseñas no coinciden."
      : "",
  };
  const regValid = Object.values(regErrors).every((e) => !e);

  const touchLoginField = (field) =>
    setLoginTouched((p) => ({ ...p, [field]: true }));
  const touchRegField = (field) =>
    setRegTouched((p) => ({ ...p, [field]: true }));
  const touchAllLogin = () => setLoginTouched({ email: true, password: true });
  const touchAllReg = () =>
    setRegTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirm: true,
    });
  const clearMessages = () => {
    setGlobalError("");
    setGlobalSuccess("");
  };

  const handleLogin = async () => {
    touchAllLogin();
    if (!loginValid) return;
    setLoading(true);
    clearMessages();
    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        login.email,
        login.password,
      );
      Swal.fire({
        icon: "success",
        title: "Bienvenido",
        text: "Inicio de sesión exitoso",
        timer: 1500,
        showConfirmButton: false,
        background: "#422D1A",
        color: "#ffffff",
      });
      await redirectByRole(userCred.user.uid);
    } catch (err) {
      setGlobalError(translateError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    touchAllReg();
    if (!regValid) return;
    setLoading(true);
    clearMessages();
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        reg.email,
        reg.password,
      );
      try {
        await setDoc(doc(db, "users", userCred.user.uid), {
          firstName: reg.firstName,
          middleName: reg.middleName || "",
          lastName: reg.lastName,
          secondSurname: reg.secondSurname || "",
          email: reg.email,
          uid: userCred.user.uid,
          role: reg.userType,
          createdAt: serverTimestamp(),
        });
      } catch (firestoreErr) {
        console.log(
          "Firestore ERROR:",
          firestoreErr.code,
          firestoreErr.message,
        );
      }
      Swal.fire({
        icon: "success",
        title: "Bienvenido",
        text: "Registro exitoso",
        timer: 1500,
        showConfirmButton: false,
        background: "#422D1A",
        color: "#ffffff",
      });
      await redirectByRole(userCred.user.uid);
    } catch (authErr) {
      console.log("Auth ERROR:", authErr.code, authErr.message);
      setGlobalError(translateError(authErr.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    clearMessages();
    try {
      const result = await signInWithPopup(auth, GoogleProvider);
      const user = result.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
          email: user.email,
          photoURL: user.photoURL,
          uid: user.uid,
          createdAt: serverTimestamp(),
          provider: "google",
        });
      }
      Swal.fire({
        icon: "success",
        title: "Bienvenido",
        text: "Inicio de sesión exitoso",
        timer: 1500,
        showConfirmButton: false,
        background: "#422D1A",
        color: "#ffffff",
      });

      await redirectByRole(result.user.uid);
    } catch (err) {
      setGlobalError(translateError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    touchLoginField("email");

    if (!validators.email(login.email)) {
      setGlobalError("Ingresa un correo válido para recuperar tu contraseña.");
      return;
    }

    clearMessages();
    setLoading(true); // ← también faltaba esto

    try {
      await sendPasswordResetEmail(auth, login.email);
      setGlobalSuccess("Correo de recuperación enviado.");
    } catch (err) {
      setGlobalError(translateError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const home = () => {
    navigate("/");
  };

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
            <span className="text-sm font-medium">CultivaPreciso</span>
          </div>
        </div>
      </div>

      {/* Panel derecho */}
      <div className="w-full md:w-[50%] bg-[#55362E] flex flex-col justify-center px-8 py-10 overflow-y-auto">
        <div className="relative bg-[#382615]/40 px-4 py-10 rounded-2xl">
          <div className="absolute -top-3 -right-3 w-12 h-12 bg-[#CC9633] rounded-full hover:bg-[#B5832D]">
            <button
              className="flex justify-center items-center h-full w-full cursor-pointer"
              onClick={home}
            >
              <svg
                class="w-6 h-6 text-[#55362E]"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fill-rule="evenodd"
                  d="M11.293 3.293a1 1 0 0 1 1.414 0l6 6 2 2a1 1 0 0 1-1.414 1.414L19 12.414V19a2 2 0 0 1-2 2h-3a1 1 0 0 1-1-1v-3h-2v3a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-6.586l-.293.293a1 1 0 0 1-1.414-1.414l2-2 6-6Z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div className="flex justify-center">
            <div className="w-[90%]">
              <h1 className="text-2xl font-bold text-white mb-1">
                {tab === "login" ? "Bienvenido de vuelta" : "Crear cuenta"}
              </h1>
              <p className="text-sm text-gray-200 mb-5">
                {tab === "login"
                  ? "Ingresa tus credenciales para acceder a tu cuenta"
                  : "Completa tus datos para empezar a usar AgroPrecisión"}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex justify-center">
            <div className="flex bg-[#55362E] rounded-lg p-1 mb-5 w-[90%]">
              {[
                { key: "login", label: "Iniciar Sesión" },
                { key: "register", label: "Registrarse" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => {
                    setTab(key);
                    clearMessages();
                    setLoginTouched({});
                    setRegTouched({});
                  }}
                  className={`flex-1 py-2 text-sm rounded-md font-medium transition-all cursor-pointer ${
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

          {/* Banners globales */}
          {globalError && (
            <div className="flex justify-center mb-3">
              <div className="w-[90%] bg-red-900/30 border border-red-500/30 text-red-300 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" /> {globalError}
              </div>
            </div>
          )}
          {globalSuccess && (
            <div className="flex justify-center mb-3">
              <div className="w-[90%] bg-green-900/30 border border-green-500/30 text-green-300 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
                <CheckCircle size={14} className="shrink-0" /> {globalSuccess}
              </div>
            </div>
          )}

          {/* ── LOGIN ── */}
          {tab === "login" && (
            <div className="flex justify-center">
              <div className="flex flex-col gap-3 w-[90%]">
                <FieldWrapper
                  label="Correo electrónico"
                  error={loginErrors.email}
                  touched={loginTouched.email}
                >
                  <TextInput
                    icon={<Mail size={16} />}
                    type="email"
                    value={login.email}
                    onChange={(e) =>
                      setLogin((p) => ({ ...p, email: e.target.value }))
                    }
                    onBlur={() => touchLoginField("email")}
                    hasError={!!loginErrors.email}
                    hasSuccess={!loginErrors.email}
                    touched={loginTouched.email}
                  />
                </FieldWrapper>

                <FieldWrapper
                  label="Contraseña"
                  error={loginErrors.password}
                  touched={loginTouched.password}
                >
                  <TextInput
                    icon={<Lock size={16} />}
                    type={showPassword ? "text" : "password"}
                    value={login.password}
                    onChange={(e) =>
                      setLogin((p) => ({ ...p, password: e.target.value }))
                    }
                    onBlur={() => touchLoginField("password")}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    hasError={!!loginErrors.password}
                    hasSuccess={!loginErrors.password}
                    touched={loginTouched.password}
                    rightIcon={
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-white/50 hover:text-white transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    }
                  />
                </FieldWrapper>

                <div className="flex justify-end -mt-1">
                  <button
                    onClick={handleForgotPassword}
                    className="text-xs text-[#CC9633] font-bold hover:underline cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full py-3 bg-[#CC9633] hover:bg-[#B5832D] disabled:opacity-60 text-black text-sm font-medium rounded-lg transition-colors cursor-pointer"
                >
                  {loading ? "Cargando..." : "Iniciar Sesión"}
                </button>

                <div className="flex justify-center">
                  <button
                    onClick={handleGoogle}
                    disabled={loading}
                    className="w-[60%] mt-2 rounded-2xl text-xs font-bold flex justify-center items-center gap-2 border border-[#CC9633] text-white p-2 cursor-pointer hover:bg-[#CC9633] transition-colors disabled:opacity-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 48 48"
                    >
                      <path
                        fill="#FFC107"
                        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                      />
                      <path
                        fill="#FF3D00"
                        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                      />
                      <path
                        fill="#4CAF50"
                        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                      />
                      <path
                        fill="#1976D2"
                        d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                      />
                    </svg>
                    Continúa con Google
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── REGISTER ── */}
          {tab === "register" && (
            <div className="flex justify-center">
              <div className="flex flex-col gap-3 w-[90%]">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <FieldWrapper
                      label="Nombre"
                      error={regErrors.firstName}
                      touched={regTouched.firstName}
                    >
                      <TextInput
                        icon={<User size={16} />}
                        value={reg.firstName}
                        onChange={(e) =>
                          setReg((p) => ({ ...p, firstName: e.target.value }))
                        }
                        onBlur={() => touchRegField("firstName")}
                        hasError={!!regErrors.firstName}
                        hasSuccess={!regErrors.firstName}
                        touched={regTouched.firstName}
                        placeholder={"Primer Apellido"}
                      />
                    </FieldWrapper>
                  </div>
                  <div className="flex-1">
                    <FieldWrapper label="Segundo nombre">
                      <TextInput
                        icon={<User size={16} />}
                        value={reg.middleName}
                        onChange={(e) =>
                          setReg((p) => ({ ...p, middleName: e.target.value }))
                        }
                        placeholder="Segundo Nombre"
                      />
                    </FieldWrapper>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <FieldWrapper
                      label="Primer apellido"
                      error={regErrors.lastName}
                      touched={regTouched.lastName}
                    >
                      <TextInput
                        icon={<User size={16} />}
                        value={reg.lastName}
                        onChange={(e) =>
                          setReg((p) => ({ ...p, lastName: e.target.value }))
                        }
                        onBlur={() => touchRegField("lastName")}
                        placeholder="Primer Apellido"
                        hasError={!!regErrors.lastName}
                        hasSuccess={!regErrors.lastName}
                        touched={regTouched.lastName}
                      />
                    </FieldWrapper>
                  </div>
                  <div className="flex-1">
                    <FieldWrapper label="Segundo apellido">
                      <TextInput
                        icon={<User size={16} />}
                        value={reg.secondSurname}
                        onChange={(e) =>
                          setReg((p) => ({
                            ...p,
                            secondSurname: e.target.value,
                          }))
                        }
                        placeholder="Segundo Apellido"
                      />
                    </FieldWrapper>
                  </div>
                </div>

                <FieldWrapper
                  label="Correo electrónico"
                  error={regErrors.email}
                  touched={regTouched.email}
                >
                  <TextInput
                    icon={<Mail size={16} />}
                    type="email"
                    value={reg.email}
                    onChange={(e) =>
                      setReg((p) => ({ ...p, email: e.target.value }))
                    }
                    onBlur={() => touchRegField("email")}
                    hasError={!!regErrors.email}
                    hasSuccess={!regErrors.email}
                    touched={regTouched.email}
                  />
                </FieldWrapper>

                <FieldWrapper
                  label="Contraseña"
                  error={regErrors.password}
                  touched={regTouched.password}
                >
                  <TextInput
                    icon={<Lock size={16} />}
                    type={showPassword ? "text" : "password"}
                    value={reg.password}
                    onChange={(e) =>
                      setReg((p) => ({ ...p, password: e.target.value }))
                    }
                    onBlur={() => touchRegField("password")}
                    hasError={!!regErrors.password}
                    hasSuccess={!regErrors.password}
                    touched={regTouched.password}
                    rightIcon={
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-white/50 hover:text-white transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    }
                  />
                  <PasswordStrengthBar password={reg.password} />
                </FieldWrapper>

                <FieldWrapper
                  label="Confirmar contraseña"
                  error={regErrors.confirm}
                  touched={regTouched.confirm}
                  success={
                    reg.confirm && !regErrors.confirm
                      ? "Las contraseñas coinciden."
                      : ""
                  }
                >
                  <TextInput
                    icon={<Lock size={16} />}
                    type={showConfirm ? "text" : "password"}
                    value={reg.confirm}
                    onChange={(e) =>
                      setReg((p) => ({ ...p, confirm: e.target.value }))
                    }
                    onBlur={() => touchRegField("confirm")}
                    onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                    hasError={!!regErrors.confirm}
                    hasSuccess={reg.confirm && !regErrors.confirm}
                    touched={regTouched.confirm}
                    rightIcon={
                      <button
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="text-white/50 hover:text-white transition-colors"
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />
                </FieldWrapper>
                {/* Tipo de usuario */}
                <div className="flex flex-col gap-1">
                  <div className="flex gap-3 mt-1">
                    {[
                      { value: "agricultor", label: "Agricultor" },
                      {
                        value: "profesional",
                        label: "Profesional",
                      },
                    ].map(({ value, label, emoji }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setReg((p) => ({ ...p, userType: value }))
                        }
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
                        style={{
                          background:
                            reg.userType === value
                              ? "rgba(204,150,51,0.2)"
                              : "rgba(255,255,255,0.05)",
                          border:
                            reg.userType === value
                              ? "1px solid #CC9633"
                              : "1px solid rgba(255,255,255,0.1)",
                          color:
                            reg.userType === value
                              ? "#CC9633"
                              : "rgba(255,255,255,0.5)",
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full py-3 bg-[#CC9633] hover:bg-[#B5832D] disabled:opacity-60 text-black text-sm font-medium rounded-lg transition-colors mt-1 cursor-pointer"
                >
                  {loading ? "Creando cuenta..." : "Crear cuenta"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
