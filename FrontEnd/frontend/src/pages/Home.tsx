import { ArrowRight, Bell, Menu, Plus, Search, X } from "lucide-react";
import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type NavItem = {
  label: string;
  path?: string;
};

const navigationItems: NavItem[] = [
  { label: "Inicio", path: "/home" },
  { label: "Eventos", path: "/home" },
  { label: "Perfil", path: "/profile" },
  { label: "Tarjetas" },
  { label: "Politica de la empresa" },
  { label: "Cerrar Sesion", path: "/" },
];

const recentCollaborators = [
  { initials: "AL", bg: "bg-sky-500" },
  { initials: "JD", bg: "bg-emerald-500" },
];

const palette = ["bg-sky-900", "bg-orange-600", "bg-rose-900", "bg-emerald-700"];

export default function HomePage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventName, setEventName] = useState("");
  const [events, setEvents] = useState<string[]>([]);

  function toggleMenu() {
    setIsMenuOpen((prev) => !prev);
  }

  function handleMenuItemClick(item: NavItem) {
    if (item.path) navigate(item.path);
    setIsMenuOpen(false);
  }

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
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Cerrar menu de navegacion" : "Abrir menu de navegacion"}
          aria-expanded={isMenuOpen}
          aria-controls="sidebar-menu"
          className="inline-flex items-center justify-center rounded-md border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <div className="flex items-center gap-4">
          <ActionIcon label="Buscar">
            <Search className="h-5 w-5" />
          </ActionIcon>
          <ActionIcon label="Notificaciones">
            <Bell className="h-5 w-5" />
          </ActionIcon>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {recentCollaborators.map((collaborator) => (
                <span
                  key={collaborator.initials}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white ${collaborator.bg}`}
                >
                  {collaborator.initials}
                </span>
              ))}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">Ann Lee</span>
              <span className="text-xs text-slate-500">Coordinadora</span>
            </div>
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
                <EventButton key={`${eventLabel}-${index}`} label={eventLabel} colorClass={palette[index % palette.length]} />
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

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg bg-transparent px-4 py-2 text-sm font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center rounded-lg bg-[#037694] px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#025f76] hover:shadow-lg"
                >
                  Agregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div
        id="sidebar-menu"
        className={`fixed inset-0 z-40 flex transition ${isMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!isMenuOpen}
      >
        <aside
          role="dialog"
          aria-modal="true"
          aria-labelledby="menu-title"
          className={`relative flex h-full w-72 max-w-full flex-col bg-[#5f7f86] text-white shadow-2xl transition-transform duration-300 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <h2 id="menu-title" className="sr-only">
            Menu principal
          </h2>
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <button
              type="button"
              onClick={toggleMenu}
              aria-label="Cerrar menu"
              className="inline-flex items-center justify-center text-white transition hover:text-gray-200"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 space-y-2 px-4">
            {navigationItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleMenuItemClick(item)}
                className="group flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-base font-medium tracking-wide text-white transition hover:bg-white/10"
              >
                <span className="transition group-hover:translate-x-1">{item.label}</span>
                <ArrowRight className="h-4 w-4 text-white transition group-hover:translate-x-1" />
              </button>
            ))}
          </nav>
        </aside>

        <button
          type="button"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Cerrar menu"
          className={`h-full flex-1 bg-black/30 transition-opacity duration-300 ${isMenuOpen ? "opacity-100" : "opacity-0"}`}
        />
      </div>
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

function EventButton({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <button
      type="button"
      className={`group flex items-center justify-between rounded-2xl px-6 py-5 text-left text-white shadow-lg transition hover:translate-y-0.5 hover:shadow-xl ${colorClass}`}
    >
      <span className="text-sm font-semibold uppercase tracking-wide transition group-hover:tracking-[0.35em]">
        {label}
      </span>
      <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
    </button>
  );
}
