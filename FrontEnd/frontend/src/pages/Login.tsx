import { useState } from "react";
import type { FormEvent } from "react";
import type { ReactElement } from "react";
import { User, Lock } from "lucide-react";

import datumLogo from "../assets/datumredsoft.png"; 
import googleLogo from "../assets/google.png";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // TODO: Integrar con Keycloak (OIDC)
      await new Promise((r) => setTimeout(r, 600));
      console.log({ username, password });
    } catch (err) {
      console.error(err);
      setError("Algo salió mal. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSignIn() {
    // TODO: Redirigir a Keycloak con IdP Google
    console.log("Google sign-in click");
  }

  return (
    <main className="min-h-screen w-full bg-[#1b2024] text-slate-100 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mx-auto mb-7 flex items-center justify-center">
          <img
            src={datumLogo}
            alt="Datum Redsoft"
            className="h-40 w-40 rounded-full bg-white p-6 shadow-2xl ring-1 ring-black/10 object-contain"
          />
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4" aria-labelledby="login-title">
          <h1 id="login-title" className="sr-only">Iniciar sesión</h1>

          <InputField
            id="username"
            type="text"
            autoComplete="username"
            placeholder="USUARIO"
            value={username}
            onChange={(v) => setUsername(v)}
            icon={<User className="h-5 w-5" aria-hidden />}
          />

          <InputField
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="CONTRASEÑA"
            value={password}
            onChange={(v) => setPassword(v)}
            icon={<Lock className="h-5 w-5" aria-hidden />}
          />

          {error && (
            <p role="alert" className="text-sm text-red-400">{error}</p>
          )}

          {/* Botón Google */}
          <GoogleButton onClick={handleGoogleSignIn} />

          {/* Botón principal */}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center rounded-md bg-white py-3 text-sm font-semibold tracking-wider text-slate-900 shadow transition active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? "INGRESANDO…" : "INGRESAR"}
          </button>
        </form>

        {/* Link de recuperación */}
        <div className="mt-5 text-center">
          <a
            href="#" // Reemplaza con la URL de recuperación de Keycloak
            className="text-sm text-slate-400 underline-offset-4 hover:text-white hover:underline"
          >
            ¿Olvidó su contraseña?
          </a>
        </div>
      </div>
    </main>
  );
}

// ————————————————————————————————————————
// Subcomponentes
// ————————————————————————————————————————

function InputField(props: {
  id: string;
  type: string;
  placeholder: string;
  value: string;
  autoComplete?: string;
  icon: ReactElement;
  onChange: (val: string) => void;
}) {
  const { id, type, placeholder, value, onChange, icon, autoComplete } = props;
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">{placeholder}</label>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        {icon}
      </span>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="h-12 w-full rounded-md border border-slate-600 bg-transparent pl-10 pr-3 text-sm tracking-wide placeholder-slate-400 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-sky-500"
      />
    </div>
  );
}

function GoogleButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-3 rounded-md border border-slate-600 bg-transparent py-3 text-sm font-semibold tracking-wide text-slate-100 shadow-sm transition hover:bg-white/5 active:scale-[0.99]"
      aria-label="Iniciar sesión con Google"
    >
      <img src={googleLogo} alt="Google" className="h-5 w-5" />
      <span>Iniciar Sesión con Google</span>
    </button>
  );
}
