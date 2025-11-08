import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserPlus,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Building,
  User,
  KeyRound,
} from "lucide-react";
import { crearEmpleado } from "../../services/empleados";
import type { EmpleadoResponse } from "../../types/empleado";
import { obtenerDepartamentos, obtenerCargos, obtenerEmpresas } from "../../services/catalogos";
import type { Departamento, Cargo, Empresa } from "../../types/catalogos";

const INITIAL_FORM = {
  nombre: "",
  apellido: "",
  correo: "",
  telefono: "",
  idDepartamento: "",
  idCargo: "",
  idEmpresa: "",
  usuario: "",
  contrasena: "",
};

type FormState = typeof INITIAL_FORM;
type FormField = keyof FormState;

export default function AdminNuevoUsuario() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({ ...INITIAL_FORM });
  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdEmpleado, setCreatedEmpleado] = useState<EmpleadoResponse | null>(null);

  // Estados para los catálogos
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);

  // Cargar catálogos al montar el componente
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const [depts, crgs, emps] = await Promise.all([
          obtenerDepartamentos(),
          obtenerCargos(),
          obtenerEmpresas(),
        ]);
        setDepartamentos(depts);
        setCargos(crgs);
        setEmpresas(emps);
      } catch (error) {
        console.error("Error al cargar catálogos:", error);
        setSubmitError("No se pudieron cargar los catálogos. Intenta recargar la página.");
      } finally {
        setLoadingCatalogos(false);
      }
    };
    cargarCatalogos();
  }, []);

  const handleChange = (field: FormField) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let value = event.target.value;
    
    // Validación especial para teléfono: solo números, máximo 8 dígitos
    if (field === "telefono") {
      value = value.replace(/\D/g, "").slice(0, 8);
    }

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<FormField, string>> = {};

    if (!form.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido.";
    }

    if (!form.apellido.trim()) {
      newErrors.apellido = "El apellido es requerido.";
    }

  if (!form.correo.trim()) {
    newErrors.correo = "El correo es requerido.";
  } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(form.correo)) {
    newErrors.correo = "Ingresa un correo valido.";
  }

  if (!form.usuario.trim()) {
    newErrors.usuario = "El nombre de usuario es requerido.";
  } else if (form.usuario.trim().length < 4) {
    newErrors.usuario = "Debe tener al menos 4 caracteres.";
  }

  if (!form.contrasena) {
    newErrors.contrasena = "La contraseña es requerida.";
  } else if (form.contrasena.length < 5) {
    newErrors.contrasena = "La contraseña debe tener al menos 5 caracteres.";
  }

    ["idDepartamento", "idCargo", "idEmpresa"].forEach((fieldKey) => {
      const value = form[fieldKey as FormField].trim();
      if (!value) {
        newErrors[fieldKey as FormField] = "Este campo es requerido.";
        return;
      }
      const numericValue = Number(value);
      if (!Number.isFinite(numericValue) || numericValue <= 0) {
        newErrors[fieldKey as FormField] = "Debe ser un numero mayor a cero.";
      }
    });

    // Validación mejorada para teléfono: debe tener exactamente 8 dígitos
    if (form.telefono) {
      if (form.telefono.length !== 8) {
        newErrors.telefono = "El teléfono debe tener exactamente 8 dígitos.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetState = () => {
    setForm({ ...INITIAL_FORM });
    setErrors({});
    setSubmitError(null);
    setIsSubmitting(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        correo: form.correo.trim(),
        telefono: form.telefono.trim(),
        idDepartamento: Number(form.idDepartamento),
        idCargo: Number(form.idCargo),
        idEmpresa: Number(form.idEmpresa),
        usuario: form.usuario.trim(),
        contrasena: form.contrasena,
      };

      const empleado = await crearEmpleado(payload);
      setCreatedEmpleado(empleado);
      resetState();
    } catch (error) {
      console.error("Error al crear empleado:", error);
      setSubmitError(
        error instanceof Error ? error.message : "No se pudo crear el usuario. Intenta de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="bg-white rounded-xl shadow-lg p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.nombre}
            onChange={handleChange("nombre")}
            placeholder="Nombre del empleado"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.nombre ? "border-red-500" : "border-slate-300"
            }`}
          />
          {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Apellido <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.apellido}
            onChange={handleChange("apellido")}
            placeholder="Apellido del empleado"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.apellido ? "border-red-500" : "border-slate-300"
            }`}
          />
          {errors.apellido && <p className="mt-1 text-sm text-red-600">{errors.apellido}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Correo <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={form.correo}
              onChange={handleChange("correo")}
              placeholder="usuario@empresa.com"
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.correo ? "border-red-500" : "border-slate-300"
              }`}
            />
          </div>
          {errors.correo && <p className="mt-1 text-sm text-red-600">{errors.correo}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Telefono</label>
          <div className="relative">
            <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              value={form.telefono}
              onChange={handleChange("telefono")}
              placeholder="70000000"
              maxLength={8}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.telefono ? "border-red-500" : "border-slate-300"
              }`}
            />
        </div>
        <p className="mt-1 text-xs text-slate-500">Solo números, exactamente 8 dígitos</p>
        {errors.telefono && <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Nombre de usuario <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={form.usuario}
            onChange={handleChange("usuario")}
            placeholder="usuario.dato"
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.usuario ? "border-red-500" : "border-slate-300"
            }`}
          />
        </div>
        {errors.usuario && <p className="mt-1 text-sm text-red-600">{errors.usuario}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Contraseña temporal <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <KeyRound className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="password"
            value={form.contrasena}
            onChange={handleChange("contrasena")}
            placeholder="Contraseña inicial"
            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.contrasena ? "border-red-500" : "border-slate-300"
            }`}
          />
        </div>
        {errors.contrasena && <p className="mt-1 text-sm text-red-600">{errors.contrasena}</p>}
      </div>
      </section>

      <section className="bg-white rounded-xl shadow-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
          Configuracion de acceso
        </h2>
        <p className="text-sm text-slate-500">
          Selecciona el departamento, cargo y empresa del empleado.
        </p>

        {loadingCatalogos ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-slate-600">Cargando opciones...</span>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Departamento <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={form.idDepartamento}
                  onChange={handleChange("idDepartamento")}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white ${
                    errors.idDepartamento ? "border-red-500" : "border-slate-300"
                  }`}
                >
                  <option value="">Selecciona un departamento</option>
                  {departamentos.map((dept) => (
                    <option key={dept.idDepartamento} value={dept.idDepartamento}>
                      {dept.nombreDepart}
                      {dept.descripcion ? ` - ${dept.descripcion}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              {errors.idDepartamento && (
                <p className="mt-1 text-sm text-red-600">{errors.idDepartamento}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cargo <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Briefcase className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={form.idCargo}
                  onChange={handleChange("idCargo")}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white ${
                    errors.idCargo ? "border-red-500" : "border-slate-300"
                  }`}
                >
                  <option value="">Selecciona un cargo</option>
                  {cargos.map((cargo) => (
                    <option key={cargo.idCargo} value={cargo.idCargo}>
                      {cargo.nombre}
                      {cargo.descripcion ? ` - ${cargo.descripcion}` : ""}
                    </option>
                  ))}
                </select>
              </div>
              {errors.idCargo && <p className="mt-1 text-sm text-red-600">{errors.idCargo}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Empresa <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={form.idEmpresa}
                  onChange={handleChange("idEmpresa")}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white ${
                    errors.idEmpresa ? "border-red-500" : "border-slate-300"
                  }`}
                >
                  <option value="">Selecciona una empresa</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.idEmpresa} value={empresa.idEmpresa}>
                      {empresa.nombreEmpresa}
                    </option>
                  ))}
                </select>
              </div>
              {errors.idEmpresa && <p className="mt-1 text-sm text-red-600">{errors.idEmpresa}</p>}
            </div>
          </>
        )}
      </section>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">No se pudo completar la operacion</p>
            <p className="text-sm">{submitError}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate("/admin/usuarios")}
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creando...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Crear usuario
            </>
          )}
        </button>
      </div>
    </form>
  );

  const renderSuccess = () => (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-full bg-emerald-500 text-white flex items-center justify-center">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Usuario creado correctamente</h2>
          <p className="text-sm text-slate-500">
            El empleado fue registrado y ya puede autenticarse con las credenciales asignadas en Keycloak.
          </p>
        </div>
      </div>

        {createdEmpleado && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Nombre completo</p>
              <p className="text-lg font-semibold text-slate-900">
                {createdEmpleado.nombre} {createdEmpleado.apellido}
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Correo</p>
              <p className="text-lg font-semibold text-slate-900">{createdEmpleado.correo}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Usuario</p>
              <p className="text-lg font-semibold text-slate-900">{createdEmpleado.usuario}</p>
            </div>
            {createdEmpleado.telefono && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide">Telefono</p>
                <p className="text-lg font-semibold text-slate-900">{createdEmpleado.telefono}</p>
              </div>
            )}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide">ID Empleado</p>
              <p className="text-lg font-semibold text-slate-900">{createdEmpleado.idEmpleado}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide">ID Departamento</p>
              <p className="text-lg font-semibold text-slate-900">{createdEmpleado.idDepartamento}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide">ID Cargo</p>
              <p className="text-lg font-semibold text-slate-900">{createdEmpleado.idCargo}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-xs text-slate-500 uppercase tracking-wide">ID Empresa</p>
              <p className="text-lg font-semibold text-slate-900">{createdEmpleado.idEmpresa}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 md:col-span-2">
              <p className="text-xs text-slate-500 uppercase tracking-wide">ID Keycloak</p>
              <p className="text-sm font-semibold text-slate-900 break-all">{createdEmpleado.keycloakId}</p>
            </div>
          </div>
        )}

      <div className="mt-8 flex flex-wrap gap-4">
        <button
          onClick={() => {
            setCreatedEmpleado(null);
            resetState();
          }}
          className="px-5 py-2 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
        >
          Crear otro usuario
        </button>
        <button
          onClick={() => navigate("/admin/usuarios")}
          className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Ver listado de usuarios
        </button>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 shadow-lg border-b border-slate-700">
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/admin/usuarios")}
            className="inline-flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white transition"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Volver a usuarios</span>
          </button>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-300" />
            Nuevo usuario
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4" />
            Solo administradores
          </div>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-xl border border-blue-100 p-6 shadow">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              Registro de nuevo empleado
            </h2>
            <p className="text-sm text-slate-500">
              Completa la informacion basica del empleado. Los identificadores deben existir previamente en la base de datos segun el modelo de Empleado.
            </p>
          </div>
          {createdEmpleado ? renderSuccess() : renderForm()}
        </div>
      </div>
    </main>
  );
}

