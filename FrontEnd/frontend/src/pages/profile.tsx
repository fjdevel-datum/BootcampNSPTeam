import { ArrowLeft, Camera, Edit2, Mail, Phone, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { obtenerPerfil, actualizarPerfil } from "../services/empleados";
import type { PerfilEmpleado, ActualizarPerfilPayload } from "../types/empleado";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PerfilEmpleado | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [tempProfile, setTempProfile] = useState<ActualizarPerfilPayload>({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
  });
  const [profileImage, setProfileImage] = useState<string>(
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80"
  );
  const [tempImage, setTempImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar perfil al montar el componente
  useEffect(() => {
    cargarPerfil();
  }, []);

  async function cargarPerfil() {
    try {
      setIsLoading(true);
      setError(null);
      const data = await obtenerPerfil();
      setProfile(data);
    } catch (err) {
      console.error("Error al cargar perfil:", err);
      setError(err instanceof Error ? err.message : "Error al cargar el perfil");
    } finally {
      setIsLoading(false);
    }
  }

  function handleInputChange(field: keyof ActualizarPerfilPayload) {
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
    if (!profile) return;
    
    setTempProfile({
      nombre: profile.nombre,
      apellido: profile.apellido,
      correo: profile.correo,
      telefono: profile.telefono || "",
    });
    setTempImage(profileImage);
    setIsEditMode(true);
    setSaveError(null);
  }

  function handleCancelEdit() {
    if (!profile) return;
    
    setTempProfile({
      nombre: profile.nombre,
      apellido: profile.apellido,
      correo: profile.correo,
      telefono: profile.telefono || "",
    });
    setTempImage("");
    setIsEditMode(false);
    setSaveError(null);
  }

  async function handleSaveEdit() {
    try {
      setSaveError(null);
      const updatedProfile = await actualizarPerfil(tempProfile);
      setProfile(updatedProfile);
      if (tempImage) {
        setProfileImage(tempImage);
      }
      setIsEditMode(false);
    } catch (err) {
      console.error("Error al actualizar perfil:", err);
      setSaveError(err instanceof Error ? err.message : "Error al actualizar el perfil");
    }
  }

  // Mostrar loading
  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-100">
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
            <div className="w-24"></div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Cargando perfil...</p>
          </div>
        </div>
      </main>
    );
  }

  // Mostrar error
  if (error || !profile) {
    return (
      <main className="min-h-screen bg-slate-100">
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
            <div className="w-24"></div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-700 font-medium mb-2">Error al cargar perfil</p>
              <p className="text-red-600 text-sm mb-4">{error || "No se pudo cargar el perfil"}</p>
              <button
                onClick={cargarPerfil}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </main>
    );
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
                  <h2 className="text-xl font-bold text-slate-900">{profile.nombre} {profile.apellido}</h2>
                  <p className="text-sm text-slate-500">{profile.cargo || "Sin cargo asignado"}</p>
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

                {saveError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{saveError}</p>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Nombre */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
                      <User className="h-4 w-4" />
                      Nombre
                    </label>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={tempProfile.nombre}
                        onChange={handleInputChange("nombre")}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-slate-50 rounded-lg text-slate-900">
                        {profile.nombre}
                      </p>
                    )}
                  </div>

                  {/* Apellido */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
                      <User className="h-4 w-4" />
                      Apellido
                    </label>
                    {isEditMode ? (
                      <input
                        type="text"
                        value={tempProfile.apellido}
                        onChange={handleInputChange("apellido")}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-slate-50 rounded-lg text-slate-900">
                        {profile.apellido}
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
                        value={tempProfile.correo}
                        onChange={handleInputChange("correo")}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-slate-50 rounded-lg text-slate-900">
                        {profile.correo}
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
                        value={tempProfile.telefono || ""}
                        onChange={handleInputChange("telefono")}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="px-4 py-3 bg-slate-50 rounded-lg text-slate-900">
                        {profile.telefono || "No especificado"}
                      </p>
                    )}
                  </div>

                  {/* Cargo - Solo lectura */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
                      <User className="h-4 w-4" />
                      Cargo
                    </label>
                    <p className="px-4 py-3 bg-slate-50 rounded-lg text-slate-900">
                      {profile.cargo || "Sin cargo asignado"}
                    </p>
                  </div>

                  {/* Departamento - Solo lectura */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-2">
                      <User className="h-4 w-4" />
                      Departamento
                    </label>
                    <p className="px-4 py-3 bg-slate-50 rounded-lg text-slate-900">
                      {profile.departamento || "Sin departamento asignado"}
                    </p>
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
