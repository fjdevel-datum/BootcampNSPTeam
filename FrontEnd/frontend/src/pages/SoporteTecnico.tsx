import { ArrowLeft, Mail, Phone, MessageCircle, Clock, MapPin, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SoporteTecnicoPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="px-6 py-12 max-w-4xl mx-auto">
        {/* Título */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-4">
            <HelpCircle className="h-8 w-8 text-sky-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Soporte Técnico</h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Estamos aquí para ayudarte. Si experimentas algún problema o tienes alguna pregunta, 
            no dudes en contactarnos a través de cualquiera de los siguientes canales.
          </p>
        </div>

        {/* Cards de Contacto */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Email */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-sky-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Correo Electrónico</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Envíanos un correo y te responderemos en menos de 24 horas.
                </p>
                <a 
                  href="mailto:soporte@datumtravels.com"
                  className="text-sky-600 hover:text-sky-700 font-medium text-sm inline-flex items-center gap-1 hover:underline"
                >
                  soporte@datumtravels.com
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </a>
              </div>
            </div>
          </div>

          {/* Teléfono */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Phone className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Teléfono</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Llámanos de lunes a viernes durante horario laboral.
                </p>
                <a 
                  href="tel:+50322001234"
                  className="text-emerald-600 hover:text-emerald-700 font-medium text-sm inline-flex items-center gap-1 hover:underline"
                >
                  +503 2200-1234
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </a>
              </div>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">WhatsApp</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Chatea con nosotros para soporte rápido y directo.
                </p>
                <a 
                  href="https://wa.me/50370001234"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 font-medium text-sm inline-flex items-center gap-1 hover:underline"
                >
                  +503 7000-1234
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </a>
              </div>
            </div>
          </div>

          {/* Horarios */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Horario de Atención</h3>
                <p className="text-sm text-slate-600 mb-2">
                  <span className="font-medium">Lunes a Viernes:</span> 8:00 AM - 6:00 PM
                </p>
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Sábados:</span> 9:00 AM - 1:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Oficina */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Nuestra Oficina</h3>
              <p className="text-slate-600 mb-4">
                Si prefieres visitarnos en persona, te esperamos en nuestra oficina central.
              </p>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-sm font-medium text-slate-900 mb-1">Datum Travels - Oficina Principal</p>
                <p className="text-sm text-slate-600">Boulevard Universitario, Edificio Innovación</p>
                <p className="text-sm text-slate-600">San Salvador, El Salvador</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Preguntas Frecuentes */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-2xl p-8 border border-sky-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-3">¿Tienes una pregunta rápida?</h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Antes de contactarnos, revisa nuestra sección de preguntas frecuentes. 
              Puede que ya tengamos la respuesta que buscas.
            </p>
            <button
              onClick={() => navigate("/home")}
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-medium px-6 py-3 rounded-lg transition shadow-lg shadow-sky-600/25"
            >
              <HelpCircle className="h-5 w-5" />
              Ver Preguntas Frecuentes
            </button>
          </div>
        </div>

        {/* Botón Regresar */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/home")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver al Inicio
          </button>
        </div>
      </div>
    </main>
  );
}
