import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Minus,
  X,
  Loader2,
  ArrowDownToLine,
  Check,
  PackageCheck,
  PackageOpen,
  ListChecks,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  verInventarioProductoTerminado,
  insertarIngresoProductoTerminado,
} from "../../services/Inventario/Inventario";
import Header from "@/components/layout/Header";

const CANTIDAD_MAXIMA_INGRESO = 100;
const UMBRAL_BAJO = 10;

const estadoStock = (cantidad) => {
  const valor = Number(cantidad || 0);
  if (valor === 0) return "agotado";
  if (valor < UMBRAL_BAJO) return "bajo";
  return "disponible";
};

const ESTILO_ESTADO = {
  disponible: { texto: "Disponible", clase: "bg-emerald-50 text-emerald-700" },
  bajo: { texto: "Stock bajo", clase: "bg-amber-50 text-amber-700" },
  agotado: { texto: "Sin stock", clase: "bg-slate-100 text-slate-500" },
};

const descripcionContenido = (p) => {
  const partes = [];
  if (p.CantidadRollosUnidades) partes.push(`${p.CantidadRollosUnidades} u/paq`);
  if (p.CantidadPorUnidadTerminada)
    partes.push(
      `${p.CantidadPorUnidadTerminada} por ${(p.TipoContenedor || "unidad").toLowerCase()}`,
    );
  return partes.length > 0 ? partes.join(" · ") : "—";
};

const construirObservacion = (lineas) =>
  `Ingreso a inventario: ${lineas
    .map((l) => `${l.cantidadNum} ${l.nombreProducto} (${l.codigo})`)
    .join(", ")}`;

const aEntero = (valor) => {
  const n = Number(valor);
  return Number.isInteger(n) && n > 0 ? n : 0;
};

function ControlCantidad({ valor, onChange, autoFocus = false, invalido = false }) {
  const numero = aEntero(valor);

  const ajustar = (delta) => {
    const siguiente = Math.min(
      CANTIDAD_MAXIMA_INGRESO,
      Math.max(0, numero + delta),
    );
    onChange(siguiente === 0 ? "" : String(siguiente));
  };

  const manejarCambio = (e) => {
    const limpio = e.target.value.replace(/\D/g, "");
    if (limpio === "") return onChange("");
    onChange(String(Math.min(CANTIDAD_MAXIMA_INGRESO, Number(limpio))));
  };

  return (
    <div className="flex items-center gap-1.5">
      <Button
        type="button"
        variant="outline"
        onClick={() => ajustar(-1)}
        disabled={numero === 0}
        aria-label="Restar una unidad"
        className="h-11 w-11 shrink-0 border-2 border-slate-200 p-0 text-slate-600"
      >
        <Minus size={16} strokeWidth={3} />
      </Button>
      <Input
        inputMode="numeric"
        value={valor}
        onChange={manejarCambio}
        placeholder="0"
        autoFocus={autoFocus}
        aria-label="Cantidad a ingresar"
        className={cn(
          "h-11 w-full min-w-0 text-center text-lg font-extrabold tabular-nums",
          numero > 0 && "border-emerald-400 bg-emerald-50 text-emerald-800",
          invalido && numero === 0 && "border-red-400 ring-1 ring-red-200",
        )}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => ajustar(1)}
        disabled={numero >= CANTIDAD_MAXIMA_INGRESO}
        aria-label="Sumar una unidad"
        className="h-11 w-11 shrink-0 border-2 border-slate-200 p-0 text-slate-600"
      >
        <Plus size={16} strokeWidth={3} />
      </Button>
    </div>
  );
}

function OpcionPresentacion({ presentacion, agregada, onSeleccionar }) {
  return (
    <button
      type="button"
      onClick={() => onSeleccionar(presentacion)}
      disabled={agregada}
      className={cn(
        "flex flex-col gap-1.5 rounded-xl border-2 px-3.5 py-3 text-left transition-colors",
        agregada
          ? "cursor-default border-emerald-300 bg-emerald-50"
          : "border-slate-200 bg-white hover:border-c4 hover:bg-c4/5",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[15px] font-extrabold text-c3">
          {presentacion.CodigoPresentacion}
        </span>
        {agregada ? (
          <span className="flex items-center gap-1 text-[11.5px] font-extrabold uppercase text-emerald-700">
            <Check size={13} strokeWidth={3} />
            Agregada
          </span>
        ) : (
          <Plus size={16} strokeWidth={3} className="text-slate-400" />
        )}
      </div>
      <div className="text-[12.5px] text-slate-600">
        {presentacion.TipoContenedor} · {descripcionContenido(presentacion)}
      </div>
      <div className="text-[12px] font-semibold text-slate-400">
        Stock actual:{" "}
        <span className="font-extrabold tabular-nums text-slate-700">
          {presentacion.CantidadActual}
        </span>
      </div>
    </button>
  );
}

function CardIngreso({
  presentacion,
  valor,
  autoFocus,
  invalido,
  onChange,
  onQuitar,
}) {
  const estado = estadoStock(presentacion.CantidadActual);
  const cantidad = aEntero(valor);
  const actual = Number(presentacion.CantidadActual || 0);

  return (
    <div
      className={cn(
        "flex flex-col gap-3.5 rounded-2xl border-2 bg-white p-4 shadow-sm",
        cantidad > 0 ? "border-emerald-300" : "border-slate-200",
      )}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[16px] font-extrabold text-c3">
              {presentacion.CodigoPresentacion}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "border-0 text-[11px] font-bold",
                ESTILO_ESTADO[estado].clase,
              )}
            >
              {ESTILO_ESTADO[estado].texto}
            </Badge>
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
          onClick={() => onQuitar(presentacion.IdPresentacion)}
          aria-label={`Quitar ${presentacion.CodigoPresentacion}`}
          className="h-9 w-9 shrink-0 p-0 text-slate-400 hover:text-red-600"
        >
          <X size={17} strokeWidth={2.75} />
        </Button>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="text-[12px] font-bold uppercase tracking-wide text-slate-500">
          Cantidad a ingresar
        </div>
        <ControlCantidad
          valor={valor}
          onChange={onChange}
          autoFocus={autoFocus}
          invalido={invalido}
        />
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-100 px-4 py-3">
        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-bold uppercase tracking-wide text-slate-500">
            Stock actual
          </span>
          <span className="text-2xl font-extrabold tabular-nums leading-none text-slate-900">
            {actual}
          </span>
        </div>
        {cantidad > 0 && (
          <div className="flex flex-col items-end gap-1">
            <span className="text-[12px] font-bold uppercase tracking-wide text-emerald-700">
              Quedará en
            </span>
            <span className="text-2xl font-extrabold tabular-nums leading-none text-emerald-700">
              {actual + cantidad}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function IngresoProductoTerminado({ usuario }) {
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [linea, setLinea] = useState("");
  const [items, setItems] = useState([]);
  const [ultimoAgregado, setUltimoAgregado] = useState(null);
  const [tocado, setTocado] = useState(false);

  const [confirmando, setConfirmando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    cargarInventario();
  }, []);

  const cargarInventario = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await verInventarioProductoTerminado();
      setInventario(data);
    } catch (e) {
      setError(e.message);
      setInventario([]);
    } finally {
      setLoading(false);
    }
  };

  const lineas = useMemo(
    () => Array.from(new Set(inventario.map((p) => p.NombreProducto))),
    [inventario],
  );

  const presentacionesLinea = useMemo(
    () => inventario.filter((p) => p.NombreProducto === linea),
    [inventario, linea],
  );

  const presentacionDe = (idPresentacion) =>
    inventario.find((p) => p.IdPresentacion === idPresentacion);

  const idsAgregados = useMemo(
    () => new Set(items.map((i) => i.IdPresentacion)),
    [items],
  );

  const agregadasPorLinea = useMemo(() => {
    const conteo = new Map();
    items.forEach((i) => {
      const nombre = presentacionDe(i.IdPresentacion)?.NombreProducto;
      if (nombre) conteo.set(nombre, (conteo.get(nombre) ?? 0) + 1);
    });
    return conteo;
  }, [items, inventario]);

  const lineasValidas = items
    .map((i) => ({ ...i, cantidadNum: aEntero(i.cantidad) }))
    .filter((i) => i.cantidadNum > 0);
  const totalUnidades = lineasValidas.reduce((s, i) => s + i.cantidadNum, 0);
  const observacion = construirObservacion(
    lineasValidas.map((i) => {
      const p = presentacionDe(i.IdPresentacion);
      return {
        cantidadNum: i.cantidadNum,
        nombreProducto: p?.NombreProducto ?? "",
        codigo: p?.CodigoPresentacion ?? "",
      };
    }),
  );
  const hayIncompletas = items.length > lineasValidas.length;

  const agregarPresentacion = (presentacion) => {
    if (idsAgregados.has(presentacion.IdPresentacion)) return;
    setItems((prev) => [
      ...prev,
      { IdPresentacion: presentacion.IdPresentacion, cantidad: "" },
    ]);
    setUltimoAgregado(presentacion.IdPresentacion);
  };

  const cambiarCantidad = (idPresentacion, valor) =>
    setItems((prev) =>
      prev.map((i) =>
        i.IdPresentacion === idPresentacion ? { ...i, cantidad: valor } : i,
      ),
    );

  const quitarPresentacion = (idPresentacion) =>
    setItems((prev) => prev.filter((i) => i.IdPresentacion !== idPresentacion));

  const limpiar = () => {
    setItems([]);
    setTocado(false);
    setUltimoAgregado(null);
  };

  const solicitarConfirmacion = () => {
    setTocado(true);
    if (items.length === 0) return;
    if (hayIncompletas) {
      toast.error("Ingresa una cantidad en todas las tarjetas o quita las que no uses");
      return;
    }
    setConfirmando(true);
  };

  const confirmarIngreso = async () => {
    const texto = observacion;
    const payload = lineasValidas.map((i) => ({
      IdPresentacion: i.IdPresentacion,
      Cantidad: i.cantidadNum,
      Observacion: texto,
    }));

    setEnviando(true);
    try {
      const respuesta = await insertarIngresoProductoTerminado(payload);
      const actuales = new Map(
        respuesta.map((r) => [r.IdPresentacion, r.CantidadActual]),
      );
      setInventario((prev) =>
        prev.map((p) =>
          actuales.has(p.IdPresentacion)
            ? { ...p, CantidadActual: actuales.get(p.IdPresentacion) }
            : p,
        ),
      );
      toast.success(
        `Ingreso registrado: ${respuesta.length} presentación(es), ${totalUnidades} unidades`,
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
    <div className="contenido-con-sidebar flex min-h-screen flex-col bg-slate-50 pt-20 font-sans text-slate-900 md:pt-0">
      <Header
        titulo="Movimientos producto terminado"
        subtitulo="Registrar ingreso"
        volver={`/${usuario?.IdRol === 2 ? "encargado" : "operador"}/producto/inventario`}
        contador={
          items.length > 0
            ? {
                valor: items.length,
                singular: "seleccionada",
                plural: "seleccionadas",
              }
            : null
        }
      />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-5 sm:px-6">
        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-white p-6 text-center text-sm font-semibold text-red-600 ring-1 ring-slate-200">
            {error}
            <div className="mt-3">
              <Button variant="outline" onClick={cargarInventario}>
                Reintentar
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="flex flex-col gap-5">
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex flex-col gap-2">
                <div className="text-[12px] font-bold uppercase tracking-wide text-slate-500">
                  Línea de producto
                </div>
                <div className="flex flex-wrap gap-2">
                  {lineas.map((nombre) => {
                    const activa = linea === nombre;
                    const agregadas = agregadasPorLinea.get(nombre) ?? 0;
                    return (
                      <button
                        key={nombre}
                        type="button"
                        onClick={() => setLinea(nombre)}
                        aria-pressed={activa}
                        className={cn(
                          "flex min-h-10 items-center gap-2 rounded-full border-2 px-4 py-1.5 text-sm font-bold transition-colors",
                          activa
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
                        )}
                      >
                        {nombre}
                        {agregadas > 0 && (
                          <span
                            className={cn(
                              "min-w-5 rounded-full px-1.5 text-center text-[11.5px] font-extrabold tabular-nums",
                              activa
                                ? "bg-white/20 text-white"
                                : "bg-emerald-100 text-emerald-700",
                            )}
                          >
                            {agregadas}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {linea && (
                <div className="mt-5 flex flex-col gap-2.5">
                  <div className="text-[12px] font-bold uppercase tracking-wide text-slate-500">
                    Presentaciones de {linea}
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                    {presentacionesLinea.map((p) => (
                      <OpcionPresentacion
                        key={p.IdPresentacion}
                        presentacion={p}
                        agregada={idsAgregados.has(p.IdPresentacion)}
                        onSeleccionar={agregarPresentacion}
                      />
                    ))}
                  </div>
                </div>
              )}

              {!linea && (
                <div className="mt-5 flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
                  <PackageOpen size={26} strokeWidth={2} />
                  Selecciona una línea para ver sus presentaciones
                </div>
              )}
            </section>

            {items.length > 0 && (
              <section className="flex flex-col gap-3">
                <div className="flex items-center gap-2 px-1">
                  <ListChecks size={17} strokeWidth={2.5} className="text-c3" />
                  <h2 className="text-[15px] font-extrabold text-slate-900">
                    Ingreso a registrar
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {items.map((i) => {
                    const p = presentacionDe(i.IdPresentacion);
                    if (!p) return null;
                    return (
                      <CardIngreso
                        key={i.IdPresentacion}
                        presentacion={p}
                        valor={i.cantidad}
                        autoFocus={ultimoAgregado === i.IdPresentacion}
                        invalido={tocado}
                        onChange={(v) => cambiarCantidad(i.IdPresentacion, v)}
                        onQuitar={quitarPresentacion}
                      />
                    );
                  })}
                </div>

                <div className="mt-2 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[14px] font-extrabold text-slate-900">
                      {lineasValidas.length}{" "}
                      {lineasValidas.length === 1
                        ? "presentación"
                        : "presentaciones"}{" "}
                      · {totalUnidades} u.
                      <span className="ml-2 text-[12px] font-semibold text-slate-400">
                        Máx. {CANTIDAD_MAXIMA_INGRESO} por presentación
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
                        className="h-11 gap-2 bg-emerald-600 font-extrabold text-white hover:bg-emerald-700"
                      >
                        <ArrowDownToLine size={16} strokeWidth={2.75} />
                        Registrar ingreso
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <Dialog
        open={confirmando}
        onOpenChange={(abierto) => !enviando && setConfirmando(abierto)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold">
              Confirmar ingreso
            </DialogTitle>
            <DialogDescription>
              {lineasValidas.length}{" "}
              {lineasValidas.length === 1 ? "presentación" : "presentaciones"} ·{" "}
              {totalUnidades} unidades. Esta acción no se puede deshacer desde
              aquí.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-[12.5px] text-slate-600">
            <span className="font-bold text-slate-500">Observación: </span>
            {observacion}
          </div>

          <div className="max-h-60 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200">
            {lineasValidas.map((l) => {
              const p = presentacionDe(l.IdPresentacion);
              if (!p) return null;
              const actual = Number(p.CantidadActual || 0);
              return (
                <div
                  key={l.IdPresentacion}
                  className="flex items-center justify-between gap-3 px-3.5 py-2.5"
                >
                  <div className="flex flex-col">
                    <span className="font-mono text-[13.5px] font-extrabold text-c3">
                      {p.CodigoPresentacion}
                    </span>
                    <span className="text-[12px] text-slate-500">
                      {p.NombreProducto}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-[15px] font-extrabold tabular-nums text-emerald-700">
                      +{l.cantidadNum}
                    </div>
                    <div className="text-[11.5px] tabular-nums text-slate-400">
                      {actual} → {actual + l.cantidadNum}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

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
              onClick={confirmarIngreso}
              disabled={enviando}
              className="h-11 gap-2 bg-emerald-600 font-extrabold text-white hover:bg-emerald-700"
            >
              {enviando ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <PackageCheck size={16} strokeWidth={2.75} />
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
