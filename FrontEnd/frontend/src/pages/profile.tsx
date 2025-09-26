import { ArrowLeft, Camera, Share2 } from "lucide-react";
import { useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type Profile = {
  username: string;
  email: string;
  phone: string;
  password: string;
};

const INITIAL_PROFILE: Profile = {
  username: "yANCHUI",
  email: "yanchui@gmail.com",
  phone: "+14987889999",
  password: "evFTbyVVCd",
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>(INITIAL_PROFILE);

  function handleInputChange(field: keyof Profile) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setProfile((prev) => ({ ...prev, [field]: event.target.value }));
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: Hook up API call when backend is ready.
  }

  return (
    <main className="min-h-screen bg-[#f4f5f7] text-slate-900">
      <div className="relative pb-24">
        <div className="bg-[#212529] px-6 pb-20 pt-14 text-white">
          <div className="flex items-center justify-between">
            <HeaderIconButton label="Volver" onClick={() => navigate("/home")}>
              <ArrowLeft className="h-6 w-6" strokeWidth={1.75} />
            </HeaderIconButton>

            <h1 className="text-lg font-semibold tracking-wide">Editar Perfil</h1>

            <HeaderIconButton label="Compartir">
              <Share2 className="h-5 w-5" strokeWidth={1.75} />
            </HeaderIconButton>
          </div>
        </div>

        <div className="absolute left-1/2 top-full flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3">
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-[#f4f5f7] bg-white shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=256&q=80"
              alt="Foto de perfil"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              aria-label="Cambiar foto"
              className="absolute bottom-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black/80"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            className="text-sm font-semibold text-slate-800 transition hover:text-slate-950"
          >
            Change Picture
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto mt-16 w-full max-w-md space-y-6 px-6 pb-12">
        <ProfileField
          label="Username"
          value={profile.username}
          placeholder="Nombre de usuario"
          autoComplete="username"
          onChange={handleInputChange("username")}
        />

        <ProfileField
          label="Email I'd"
          value={profile.email}
          type="email"
          placeholder="correo@ejemplo.com"
          autoComplete="email"
          onChange={handleInputChange("email")}
        />

        <ProfileField
          label="Phone Number"
          value={profile.phone}
          placeholder="Numero de telefono"
          autoComplete="tel"
          onChange={handleInputChange("phone")}
        />

        <ProfileField
          label="Password"
          value={profile.password}
          type="password"
          placeholder="********"
          autoComplete="new-password"
          onChange={handleInputChange("password")}
        />

        <button
          type="submit"
          className="mt-4 w-full rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/30"
        >
          Actualizar
        </button>
      </form>
    </main>
  );
}

function HeaderIconButton({ children, label, onClick }: { children: ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center text-white transition hover:text-gray-200"
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}

type ProfileFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  autoComplete: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
};

function ProfileField({ label, value, placeholder, autoComplete, onChange, type = "text" }: ProfileFieldProps) {
  return (
    <label className="block text-left text-sm font-semibold text-slate-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-[#212529] focus:outline-none focus:ring-2 focus:ring-[#343a40]/40"
      />
    </label>
  );
}
