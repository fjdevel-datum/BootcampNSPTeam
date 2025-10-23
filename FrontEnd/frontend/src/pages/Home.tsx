import { ArrowRight, Bell, CreditCard, Menu, Plus, Search, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FormEvent, ReactNode } from "react";

const palette = ["bg-sky-900", "bg-orange-600", "bg-rose-900", "bg-emerald-700"];

export default function HomePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventName, setEventName] = useState("");
  const [events, setEvents] = useState<string[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = eventName.trim();
    if (!trimmed) return;

    setEvents((prev) => [...prev, trimmed.toUpperCase()]);
    setEventName("");
    setIsModalOpen(false);
  }

  const hasEvents = events.length > 0;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="flex items-center justify-between px-4 py-4 border-b border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Abrir menu de navegacion"
          className="inline-flex items-center justify-center rounded-md border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-4">
          <ActionIcon label="Buscar">
            <Search className="h-5 w-5" />
          </ActionIcon>
          <ActionIcon label="Notificaciones">
            <Bell className="h-5 w-5" />
          </ActionIcon>

          {/* Dropdown de perfil */}
          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-white text-sm font-semibold hover:bg-sky-600 transition"
            >
              AL
            </button>

            {/* Dropdown Menu */}
            {isProfileDropdownOpen && (
              <>
                {/* Overlay para cerrar al hacer click afuera */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsProfileDropdownOpen(false)}
                />
                
                {/* Menu dropdown */}
                <div className="absolute right-0 top-12 z-20 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-2">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsProfileDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 transition flex items-center gap-2"
                  >
                    <div className="h-8 w-8 flex items-center justify-center rounded-full bg-sky-500 text-white text-xs font-semibold">
                      AL
                    </div>
                    <span className="font-medium">Ver Perfil</span>
                  </button>
                  
                  <hr className="my-2 border-slate-200" />
                  
                  <button
                    onClick={() => {
                      navigate('/');
                      setIsProfileDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition font-medium"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="px-6 py-8 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Panel Principal</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-wide text-slate-900">Lista de eventos</h1>
        <p className="mt-2 text-sm text-slate-500">
          {hasEvents ? "Selecciona un evento para ver los detalles." : "No hay eventos activos por el momento. Puedes registrar uno nuevo."}
        </p>
      </section>

      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_55%)]" aria-hidden />
        <div className="px-6 pb-28 space-y-4">
          {hasEvents ? (
            <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
              {events.map((eventLabel, index) => (
                <EventButton 
                  key={`${eventLabel}-${index}`} 
                  label={eventLabel} 
                  colorClass={palette[index % palette.length]}
                  onClick={() => navigate(`/event/${encodeURIComponent(eventLabel)}`)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-8 text-center text-slate-500">
              <p className="text-sm">Aun no has agregado eventos a tu calendario.</p>
              <p className="mt-1 text-xs">Comienza registrando un nuevo evento para que aparezca aqui.</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="group absolute bottom-8 right-6 inline-flex items-center gap-3 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-600/25 transition hover:bg-sky-500"
        >
          <Plus className="h-5 w-5 transition group-hover:scale-110" />
          Registrar Nuevo Evento
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl bg-[#3d3737] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Nombre del nuevo evento</h2>
                <p className="mt-1 text-xs text-gray-300">Define un titulo breve para poder identificarlo despues.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Cerrar formulario"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-gray-200 transition hover:bg-black/50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-200">
                Evento...
                <input
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Evento..."
                  className="mt-2 w-full rounded-lg border border-transparent bg-white px-4 py-2 text-sm text-slate-900 shadow focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </label>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-lg bg-[#037694] px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#056e8b]"
                >
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}>
          <div 
            className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del sidebar */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Menú</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            {/* Contenido del sidebar */}
            <div className="p-6">
              <div className="space-y-4">
                {/* Opciones del menú */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      navigate('/home');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-slate-100 transition"
                  >
                    <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-sky-100">
                      <Search className="h-4 w-4 text-sky-600" />
                    </div>
                    <span className="font-medium text-slate-700">Inicio</span>
                    <ArrowRight className="h-4 w-4 text-slate-400 ml-auto" />
                  </button>

                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-slate-100 transition"
                  >
                    <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-purple-100">
                      <div className="flex h-full w-full items-center justify-center rounded-lg bg-sky-500 text-white text-xs font-semibold">
                        AL
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-700">Ann Lee</span>
                      <span className="text-xs text-slate-500">Ver perfil</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 ml-auto" />
                  </button>

                  <button 
                    onClick={() => {
                      navigate('/tarjetas');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-slate-100 transition"
                  >
                    <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-orange-100">
                      <CreditCard className="h-4 w-4 text-orange-600" />
                    </div>
                    <span className="font-medium text-slate-700">Tarjetas</span>
                    <ArrowRight className="h-4 w-4 text-slate-400 ml-auto" />
                  </button>

                  <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-slate-100 transition">
                    <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-100">
                      <Bell className="h-4 w-4 text-indigo-600" />
                    </div>
                    <span className="font-medium text-slate-700">Política de la empresa</span>
                    <ArrowRight className="h-4 w-4 text-slate-400 ml-auto" />
                  </button>
                </div>

                {/* Separador */}
                <hr className="border-slate-200" />

                {/* Botón de cerrar sesión */}
                <button
                  onClick={() => {
                    navigate('/');
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-red-50 text-red-600 transition"
                >
                  <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-100">
                    <ArrowRight className="h-4 w-4 text-red-600 rotate-180" />
                  </div>
                  <span className="font-medium">Cerrar sesión</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ActionIcon({ children, label }: { children: ReactNode; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}

function EventButton({ label, colorClass, onClick }: { label: string; colorClass: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between rounded-2xl px-6 py-5 text-left text-white shadow-lg transition hover:translate-y-0.5 hover:shadow-xl ${colorClass}`}
    >
      <span className="text-sm font-semibold uppercase tracking-wide">{label}</span>
      <ArrowRight className="h-5 w-5" />
    </button>
  );
}
