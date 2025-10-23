import { ArrowLeft, CreditCard, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Tarjeta {
  id: string;
  numero: string;
  titular: string;
  vencimiento: string;
  tipo: "visa" | "mastercard" | "amex";
  color: string;
}

const tarjetasIniciales: Tarjeta[] = [
  {
    id: "1",
    numero: "4532 1234 5678 9010",
    titular: "ANN LEE",
    vencimiento: "12/26",
    tipo: "visa",
    color: "from-blue-600 to-blue-800",
  },
  {
    id: "2",
    numero: "5425 2334 3010 9903",
    titular: "ANN LEE",
    vencimiento: "08/27",
    tipo: "mastercard",
    color: "from-slate-700 to-slate-900",
  },
];

export default function TarjetasPage() {
  const navigate = useNavigate();
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>(tarjetasIniciales);
  const [isAddingCard, setIsAddingCard] = useState(false);

  const handleDeleteCard = (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta tarjeta?")) {
      setTarjetas((prev) => prev.filter((t) => t.id !== id));
    }
  };

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

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500 text-xs font-semibold text-white">
                AL
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900">Ann Lee</span>
                <span className="text-xs text-slate-500">Coordinadora</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Título */}
      <div className="bg-white px-6 py-8 text-center border-b border-slate-200">
        <div className="flex items-center justify-center gap-2 mb-2">
          <CreditCard className="h-6 w-6 text-sky-600" />
          <h1 className="text-2xl font-bold text-slate-900">Mis Tarjetas</h1>
        </div>
        <p className="text-sm text-slate-500">
          Gestiona tus tarjetas corporativas para gastos de viaje
        </p>
      </div>

      {/* Contenido */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Grid de tarjetas */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {tarjetas.map((tarjeta) => (
              <TarjetaCard
                key={tarjeta.id}
                tarjeta={tarjeta}
                onDelete={() => handleDeleteCard(tarjeta.id)}
              />
            ))}

            {/* Card para agregar nueva tarjeta */}
            <button
              onClick={() => setIsAddingCard(true)}
              className="min-h-[240px] rounded-2xl border-2 border-dashed border-slate-300 bg-white hover:bg-slate-50 hover:border-sky-400 transition flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-sky-600 group"
            >
              <div className="h-16 w-16 rounded-full bg-slate-100 group-hover:bg-sky-100 flex items-center justify-center transition">
                <Plus className="h-8 w-8" />
              </div>
              <span className="font-medium">Agregar nueva tarjeta</span>
            </button>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Información importante
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Las tarjetas corporativas están vinculadas a tu cuenta empresarial</li>
              <li>• Solo puedes usar tarjetas autorizadas para gastos de viaje</li>
              <li>• Contacta a Finanzas para solicitar una nueva tarjeta</li>
              <li>• Los gastos se reportan automáticamente a tu supervisor</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal para agregar tarjeta (placeholder) */}
      {isAddingCard && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Agregar nueva tarjeta
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Esta funcionalidad estará disponible próximamente. Por ahora, contacta al
              departamento de Finanzas para solicitar una tarjeta corporativa.
            </p>
            <button
              onClick={() => setIsAddingCard(false)}
              className="w-full py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

interface TarjetaCardProps {
  tarjeta: Tarjeta;
  onDelete: () => void;
}

function TarjetaCard({ tarjeta, onDelete }: TarjetaCardProps) {
  return (
    <div className="relative group">
      <div
        className={`rounded-2xl p-6 shadow-xl bg-gradient-to-br ${tarjeta.color} text-white min-h-[240px] flex flex-col justify-between transition-transform group-hover:scale-[1.02]`}
      >
        {/* Header de la tarjeta */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium opacity-80">Tarjeta Corporativa</p>
              <p className="text-sm font-semibold capitalize">{tarjeta.tipo}</p>
            </div>
          </div>

          {/* Botón de eliminar */}
          <button
            onClick={onDelete}
            className="opacity-0 group-hover:opacity-100 transition p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm"
            title="Eliminar tarjeta"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Chip de la tarjeta */}
        <div className="my-4">
          <div className="h-10 w-14 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-400 opacity-90"></div>
        </div>

        {/* Número de tarjeta */}
        <div className="mb-4">
          <p className="text-xl font-mono tracking-wider">{tarjeta.numero}</p>
        </div>

        {/* Footer: Titular y Vencimiento */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs opacity-70 mb-1">Titular</p>
            <p className="text-sm font-semibold tracking-wide">{tarjeta.titular}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-70 mb-1">Vence</p>
            <p className="text-sm font-semibold">{tarjeta.vencimiento}</p>
          </div>
        </div>

        {/* Logo del tipo de tarjeta */}
        <div className="absolute bottom-6 right-6">
          {tarjeta.tipo === "visa" && (
            <div className="text-2xl font-bold italic opacity-30">VISA</div>
          )}
          {tarjeta.tipo === "mastercard" && (
            <div className="flex gap-[-8px]">
              <div className="h-8 w-8 rounded-full bg-red-500 opacity-30"></div>
              <div className="h-8 w-8 rounded-full bg-orange-400 opacity-30 -ml-4"></div>
            </div>
          )}
          {tarjeta.tipo === "amex" && (
            <div className="text-xl font-bold opacity-30">AMEX</div>
          )}
        </div>
      </div>
    </div>
  );
}
