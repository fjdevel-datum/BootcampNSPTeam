import { ArrowLeft, Camera, Edit2, Mail, Phone, User } from "lucide-react";
import { useState, useRef } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

type Profile = {
  username: string;
  email: string;
  phone: string;
  position: string;
  department: string;
};

const INITIAL_PROFILE: Profile = {
  username: "Ann Lee",
  email: "ann.lee@datum.com",
  phone: "+503 7889 9999",
  position: "Coordinadora",
  department: "Operaciones",
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>(INITIAL_PROFILE);
  const [isEditMode, setIsEditMode] = useState(false);
  const [tempProfile, setTempProfile] = useState<Profile>(INITIAL_PROFILE);
  const [profileImage, setProfileImage] = useState<string>(
    "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=256&q=80"
  );
  const [tempImage, setTempImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleInputChange(field: keyof Profile) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setTempProfile((prev) => ({ ...prev, [field]: event.target.value }));
    };
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTempImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleEditClick() {
    setTempProfile(profile);
    setTempImage(profileImage);
    setIsEditMode(true);
  }

  function handleCancelEdit() {
    setTempProfile(profile);
    setTempImage("");
    setIsEditMode(false);
  }

  function handleSaveEdit() {
    setProfile(tempProfile);
    if (tempImage) {
      setProfileImage(tempImage);
    }
    setIsEditMode(false);
    // TODO: Hook up API call when backend is ready.
  }

  return (
    <main className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/home")}
            className="inline-flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Regresar</span>
          </button>

          <h1 className="text-lg font-semibold text-slate-900">Mi Perfil</h1>

          <div className="w-24"></div> {/* Espaciador */}
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid md:grid-cols-[300px_1fr] gap-8">
              {/* Columna Izquierda - Foto y Botón */}
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="h-48 w-48 rounded-full overflow-hidden bg-slate-200 border-4 border-slate-100 shadow-xl">
                    <img
                      src={isEditMode && tempImage ? tempImage : profileImage}
                      alt="Foto de perfil"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  
                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 h-12 w-12 bg-sky-600 hover:bg-sky-700 rounded-full flex items-center justify-center text-white shadow-lg transition"
                      title="Cambiar foto"
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                  )}
                </div>

                <div className="text-center">
                  <h2 className="text-xl font-bold text-slate-900">{profile.username}</h2>
                  <p className="text-sm text-slate-500">{profile.position}</p>
                </div>

                {!isEditMode ? (
                  <button
                    onClick={handleEditClick}
                    className="w-full py-3 px-6 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    Editar Perfil
                  </button>
                ) : (
                  <div className="w-full space-y-3">
                    <button
                      onClick={handleSaveEdit}
                      className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition"
                    >
                      Guardar Cambios
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="w-full py-3 px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition"
                    >
                      Cancelar
                    </button>
                  </div>
                )}

                {/* Input oculto para subir imagen */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Columna Derecha - Información */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-6">
                  Información General
                </h3>

                <div className="space-y-6">
                  {/* Nombre de usuario */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
                      <User className="h-4 w-4" />
                      Nombre Completo
                    </label>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={tempProfile.username}
                        onChange={handleInputChange("username")}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-slate-50 rounded-lg text-slate-900">
                        {profile.username}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
                      <Mail className="h-4 w-4" />
                      Correo Electrónico
                    </label>
                    {isEditMode ? (
                      <input
                        type="email"
                        value={tempProfile.email}
                        onChange={handleInputChange("email")}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-slate-50 rounded-lg text-slate-900">
                        {profile.email}
                      </p>
                    )}
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
                      <Phone className="h-4 w-4" />
                      Teléfono
                    </label>
                    {isEditMode ? (
                      <input
                        type="tel"
                        value={tempProfile.phone}
                        onChange={handleInputChange("phone")}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-slate-50 rounded-lg text-slate-900">
                        {profile.phone}
                      </p>
                    )}
                  </div>

                  {/* Posición */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
                      <User className="h-4 w-4" />
                      Posición
                    </label>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={tempProfile.position}
                        onChange={handleInputChange("position")}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-slate-50 rounded-lg text-slate-900">
                        {profile.position}
                      </p>
                    )}
                  </div>

                  {/* Departamento */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
                      <User className="h-4 w-4" />
                      Departamento
                    </label>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={tempProfile.department}
                        onChange={handleInputChange("department")}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-slate-50 rounded-lg text-slate-900">
                        {profile.department}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
