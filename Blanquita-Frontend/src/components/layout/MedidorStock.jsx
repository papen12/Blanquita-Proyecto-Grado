import { cn } from "@/lib/utils";
import { estadoStock, RELLENO_STOCK } from "@/utils/stock";

const numero = (valor) => Number(valor || 0).toLocaleString("es-BO");

export function MedidorStock({ cantidad, StockMinimo = null, StockPreventivo = null, className }) {
  const valor = Number(cantidad || 0);
  const estado = estadoStock(valor, { StockMinimo, StockPreventivo });
  const conUmbral = StockMinimo !== null;
  const conPreventivo = conUmbral && StockPreventivo !== null;

  if (!conUmbral) {
    return <div className={cn("text-[11.5px] text-slate-400", className)}>Sin alerta de stock configurada</div>;
  }

  const referencia = conPreventivo ? StockPreventivo : StockMinimo;
  const tope = Math.max(valor, referencia * 2, 1);
  const porcentaje = (v) => `${Math.min((v / tope) * 100, 100)}%`;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full transition-all", RELLENO_STOCK[estado])} style={{ width: porcentaje(valor) }} />
        <div className="absolute inset-y-0 w-0.5 bg-red-400" style={{ left: porcentaje(StockMinimo) }} />
        {conPreventivo && (
          <div className="absolute inset-y-0 w-0.5 bg-amber-400" style={{ left: porcentaje(StockPreventivo) }} />
        )}
      </div>
      <div className="text-[11.5px] text-slate-500">
        Mínimo {numero(StockMinimo)} · {conPreventivo ? `Preventivo ${numero(StockPreventivo)}` : "Sin preventivo"}
      </div>
    </div>
  );
}
