import { useState, useMemo } from "react";
import { X, Loader2, PackageMinus, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { corregirInventarioProductoTerminado } from "../../services/Inventario/Inventario";
import { MotivosCorreccionProductoTerminado } from "@/constants/OperadorConfig";
import { aEntero } from "@/utils/validators";
import {
  descripcionContenido,
  BadgeEstado,
  ControlCantidad,
  PildorasLinea,
  SinLineaSeleccionada,
  OpcionPresentacion,
  ResumenStock,
} from "./comunes";

const CANTIDAD_MAXIMA_CORRECCION = 50;

const construirObservacion = ({ cantidad, nombreProducto, codigo, motivo }) =>
  `Corrección de ingreso: ${cantidad} ${nombreProducto} (${codigo}). Motivo: ${motivo}`;

function CardCorreccion({
  presentacion,
  valor,
  maximo,
  motivo,
  invalido,
  onCantidad,
  onMotivo,
  onQuitar,
}) {
  const cantidad = aEntero(valor);
  const actual = Number(presentacion.CantidadActual || 0);

  return (
    <div
      className={cn(
        "flex flex-col gap-3.5 rounded-2xl border-2 bg-white p-4 shadow-sm",
        cantidad > 0 ? "border-red-300" : "border-slate-200",
      )}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[16px] font-extrabold text-c3">
              {presentacion.CodigoPresentacion}
            </span>
            <BadgeEstado cantidad={presentacion.CantidadActual} />
          </div>
          <div className="text-[13px] font-semibold text-slate-900">
            {presentacion.NombreProducto}
          </div>
          <div className="text-[12.5px] text-slate-600">
            {presentacion.TipoContenedor} · {descripcionContenido(presentacion)}
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={onQuitar}
          aria-label={`Quitar ${presentacion.CodigoPresentacion}`}
          className="h-9 w-9 shrink-0 p-0 text-slate-400 hover:text-red-600"
        >
          <X size={17} strokeWidth={2.75} />
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[12px] font-bold uppercase tracking-wide text-slate-500">
            Cantidad a descontar
          </div>
          <div className="text-[12px] font-semibold text-slate-400">
            Máx. {maximo}
          </div>
        </div>
        <ControlCantidad
          valor={valor}
          onChange={onCantidad}
          maximo={maximo}
          tono="correccion"
          autoFocus
          invalido={invalido}
          etiqueta="Cantidad a descontar"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="text-[12px] font-bold uppercase tracking-wide text-slate-500">
          Motivo
        </div>
        <div className="flex flex-wrap gap-2">
          {MotivosCorreccionProductoTerminado.map((m) => {
            const activo = motivo === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => onMotivo(m)}
                aria-pressed={activo}
                className={cn(
                  "min-h-10 rounded-xl border-2 px-3 py-1.5 text-left text-[13px] font-bold transition-colors",
                  activo
                    ? "border-red-400 bg-red-50 text-red-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                  invalido && !motivo && "border-red-300",
                )}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      <ResumenStock
        actual={actual}
        nuevo={cantidad > 0 ? actual - cantidad : null}
        tono="correccion"
      />
    </div>
  );
}

export default function CorreccionProductoTerminado({ inventario, onStockActualizado }) {
  const [linea, setLinea] = useState("");
  const [idSeleccionada, setIdSeleccionada] = useState(null);
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [tocado, setTocado] = useState(false);

  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const lineas = useMemo(
    () => Array.from(new Set(inventario.map((p) => p.NombreProducto))),
    [inventario],
  );

  const presentacionesLinea = useMemo(
    () => inventario.filter((p) => p.NombreProducto === linea),
    [inventario, linea],
  );

  const seleccionada =
    idSeleccionada === null
      ? null
      : inventario.find((p) => p.IdPresentacion === idSeleccionada) ?? null;

  const actual = Number(seleccionada?.CantidadActual || 0);
  const maximo = Math.min(actual, CANTIDAD_MAXIMA_CORRECCION);
  const cantidadNum = aEntero(cantidad);
  const observacion = seleccionada
    ? construirObservacion({
        cantidad: cantidadNum,
        nombreProducto: seleccionada.NombreProducto,
        codigo: seleccionada.CodigoPresentacion,
        motivo,
      })
    : "";

  const seleccionar = (presentacion) => {
    if (Number(presentacion.CantidadActual || 0) === 0) return;
    setIdSeleccionada(presentacion.IdPresentacion);
    setCantidad("");
    setMotivo("");
    setTocado(false);
  };

  const limpiar = () => {
    setIdSeleccionada(null);
    setCantidad("");
    setMotivo("");
    setTocado(false);
  };

  const solicitarConfirmacion = () => {
    setTocado(true);
    if (!seleccionada) return;
    if (cantidadNum === 0) {
      toast.error("Ingresa la cantidad a descontar");
      return;
    }
    if (cantidadNum > maximo) {
      toast.error(`La cantidad máxima a descontar es ${maximo}`);
      return;
    }
    if (!motivo) {
      toast.error("Selecciona el motivo de la corrección");
      return;
    }
    setConfirmando(true);
  };

  const confirmarCorreccion = async () => {
    setEnviando(true);
    try {
      const respuesta = await corregirInventarioProductoTerminado(
        seleccionada.IdPresentacion,
        cantidadNum,
        observacion,
      );
      onStockActualizado([respuesta]);
      toast.success(
        `Corrección registrada: -${respuesta.CantidadAplicada} ${respuesta.CodigoPresentacion}`,
      );
      limpiar();
      setConfirmando(false);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <PildorasLinea lineas={lineas} linea={linea} onCambio={setLinea} />

        {linea ? (
          <div className="mt-5 flex flex-col gap-2.5">
            <div className="text-[12px] font-bold uppercase tracking-wide text-slate-500">
              Presentaciones de {linea}
            </div>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {presentacionesLinea.map((p) => (
                <OpcionPresentacion
                  key={p.IdPresentacion}
                  presentacion={p}
                  tono="correccion"
                  marcada={p.IdPresentacion === idSeleccionada}
                  textoMarcada="Seleccionada"
                  deshabilitada={Number(p.CantidadActual || 0) === 0}
                  onSeleccionar={seleccionar}
                />
              ))}
            </div>
          </div>
        ) : (
          <SinLineaSeleccionada />
        )}
      </section>

      {seleccionada && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1">
            <ListChecks size={17} strokeWidth={2.5} className="text-c3" />
            <h2 className="text-[15px] font-extrabold text-slate-900">
              Corrección a registrar
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <CardCorreccion
              key={seleccionada.IdPresentacion}
              presentacion={seleccionada}
              valor={cantidad}
              maximo={maximo}
              motivo={motivo}
              invalido={tocado}
              onCantidad={setCantidad}
              onMotivo={setMotivo}
              onQuitar={limpiar}
            />
          </div>

          <div className="mt-2 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-[14px] font-extrabold text-slate-900">
                {cantidadNum > 0
                  ? `-${cantidadNum} u. de ${seleccionada.CodigoPresentacion}`
                  : seleccionada.CodigoPresentacion}
                <span className="ml-2 text-[12px] font-semibold text-slate-400">
                  Una presentación por corrección
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={limpiar}
                  className="h-11 font-bold text-slate-500 hover:text-slate-900"
                >
                  Limpiar
                </Button>
                <Button
                  onClick={solicitarConfirmacion}
                  className="h-11 gap-2 bg-red-600 font-extrabold text-white hover:bg-red-700"
                >
                  <PackageMinus size={16} strokeWidth={2.75} />
                  Registrar corrección
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      <Dialog
        open={confirmando}
        onOpenChange={(abierto) => !enviando && setConfirmando(abierto)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">
              Confirmar corrección
            </DialogTitle>
            <DialogDescription>
              Se descontarán {cantidadNum} unidades del inventario. Esta acción
              no se puede deshacer desde aquí.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-[12.5px] text-slate-600">
            <span className="font-bold text-slate-500">Observación: </span>
            {observacion}
          </div>

          {seleccionada && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3.5 py-2.5">
              <div className="flex flex-col">
                <span className="font-mono text-[13.5px] font-extrabold text-c3">
                  {seleccionada.CodigoPresentacion}
                </span>
                <span className="text-[12px] text-slate-500">
                  {seleccionada.NombreProducto}
                </span>
              </div>
              <div className="text-right">
                <div className="text-[15px] font-extrabold tabular-nums text-red-700">
                  -{cantidadNum}
                </div>
                <div className="text-[11.5px] tabular-nums text-slate-400">
                  {actual} → {actual - cantidadNum}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setConfirmando(false)}
              disabled={enviando}
              className="h-11 font-bold text-slate-500 hover:text-slate-900"
            >
              Volver
            </Button>
            <Button
              onClick={confirmarCorreccion}
              disabled={enviando}
              className="h-11 gap-2 bg-red-600 font-extrabold text-white hover:bg-red-700"
            >
              {enviando ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <PackageMinus size={16} strokeWidth={2.75} />
                  Confirmar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
