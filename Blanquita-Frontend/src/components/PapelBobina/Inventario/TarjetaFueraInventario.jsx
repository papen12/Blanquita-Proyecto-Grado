import { ArrowRight, PackageX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function TarjetaFueraInventario({ cantidad, activo, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col gap-3.5 rounded-2xl border-2 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        activo ? "border-amber-400" : "border-slate-200",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <PackageX className="h-8 w-8 shrink-0 text-amber-600" strokeWidth={2} />
          <div className="text-[17px] font-extrabold text-slate-900">
            Fuera de inventario
          </div>
        </div>
        <Badge
          variant="outline"
          className="border-0 bg-amber-100 font-bold text-amber-700"
        >
          {cantidad === 0 ? "Vacío" : "Requiere acción"}
        </Badge>
      </div>

      <div className="flex items-baseline gap-1.5">
        <div className="text-4xl font-extrabold tabular-nums text-amber-600">
          {cantidad}
        </div>
        <div className="text-sm font-semibold text-slate-500">
          bobinas dadas de baja o retiradas
        </div>
      </div>

      <div className="rounded-lg bg-amber-50 px-3 py-2.5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">
          Acciones disponibles
        </div>
        <div className="text-sm font-bold text-slate-900">
          Reingresar o retirar definitivamente
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-amber-600">
        {activo ? "Ocultar lista" : "Ver bobinas"}
        <ArrowRight size={14} strokeWidth={2.75} />
      </div>
    </button>
  );
}