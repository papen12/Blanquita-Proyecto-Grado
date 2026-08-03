import { useState, useEffect } from "react";
import { Plus, X, Loader2, Search, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  verResumenInventarioPallet,
  verDetalleInventarioPallet,
  verPalletsFueraInventario,
  reingresarPalletInventario,
  darDeBajaPallet,
} from "../../services/Pallet/Inventario";
import { dateFormatter } from "@/utils/dates";

export const ACENTOS = [
  {
    bg: "bg-c3",
    text: "text-c3",
    soft: "bg-c1/10",
    border: "border-c3",
  },
  {
    bg: "bg-lux1",
    text: "text-lux1",
    soft: "bg-lux1/10",
    border: "border-lux1",
  },
  {
    bg: "bg-mega1",
    text: "text-mega1",
    soft: "bg-mega1/10",
    border: "border-mega1",
  },
  {
    bg: "bg-eco1",
    text: "text-eco1",
    soft: "bg-eco1/10",
    border: "border-eco1",
  },
  {
    bg: "bg-serv3",
    text: "text-serv3",
    soft: "bg-serv3/10",
    border: "border-serv3",
  },
];

export const fmt = (n) =>
  Number(n ?? 0).toLocaleString("es-BO", { maximumFractionDigits: 2 });

export const nombreTipoPallet = (t) =>
  t.NumeroRodelas != null
    ? `Pallet de ${t.NumeroRodelas} rodelas`
    : (t.Descripcion ?? "Pallet sin clasificar");

export function PalletIcono({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none">
      <rect
        x="3.5"
        y="19"
        width="25"
        height="3.5"
        rx="1"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path
        d="M6.5 22.5v4M16 22.5v4M25.5 22.5v4"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <rect
        x="8"
        y="6"
        width="16"
        height="13"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="2.2"
        opacity="0.55"
      />
      <path
        d="M8 11.5h16M8 15.5h16"
        stroke="currentColor"
        strokeWidth="2"
        opacity="0.55"
      />
    </svg>
  );
}

export function FueraIcono({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none">
      <rect
        x="5"
        y="9"
        width="22"
        height="16"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path d="M5 13h22" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M12 5.5h8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MiniStat({ label, value }) {
  return (
    <div className="flex-1 rounded-lg border border-slate-200 bg-white/70 px-2.5 py-1.5">
      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="text-sm font-bold tabular-nums text-slate-900">
        {value}
      </div>
    </div>
  );
}

export function TarjetaTipoPallet({ tipo: t, activo, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col gap-3.5 rounded-2xl border-2 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        activo ? t.border : "border-slate-200",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <PalletIcono className={cn("h-8 w-8 shrink-0", t.text)} />
          <div className="text-[17px] font-extrabold text-slate-900">
            {nombreTipoPallet(t)}
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn("border-0 font-bold", t.soft, t.text)}
        >
          {t.badge}
        </Badge>
      </div>

      <div className="flex items-baseline gap-1.5">
        <div className={cn("text-4xl font-extrabold tabular-nums", t.text)}>
          {t.CantidadPallets}
        </div>
        <div className="text-sm font-semibold text-slate-500">
          pallets en almacén
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-slate-50 px-3 py-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Rodelas
          </div>
          <div className="text-sm font-bold tabular-nums text-slate-900">
            {t.NumeroRodelas != null ? t.NumeroRodelas : "—"}
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Descripción
          </div>
          <div className="truncate text-sm font-bold text-slate-900">
            {t.Descripcion ?? "—"}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex items-center justify-end gap-1.5 text-xs font-bold",
          t.text,
        )}
      >
        Ver pallets
        <ArrowRight size={14} strokeWidth={2.75} />
      </div>
    </button>
  );
}

export function TarjetaFueraInventario({ cantidad, activo, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col gap-3.5 rounded-2xl border-2 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        activo ? "border-amber-500" : "border-slate-200",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <FueraIcono className="h-8 w-8 shrink-0 text-amber-600" />
          <div className="text-[17px] font-extrabold text-slate-900">
            Fuera de inventario
          </div>
        </div>
        <Badge
          variant="outline"
          className="border-0 bg-amber-50 font-bold text-amber-700"
        >
          Revisar
        </Badge>
      </div>

      <div className="flex items-baseline gap-1.5">
        <div className="text-4xl font-extrabold tabular-nums text-amber-600">
          {cantidad}
        </div>
        <div className="text-sm font-semibold text-slate-500">
          pallets pendientes
        </div>
      </div>

      <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-[12.5px] text-slate-600">
        Pallets retirados temporalmente. Reingrésalos al almacén o retíralos de
        forma definitiva.
      </div>

      <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-amber-600">
        Ver pendientes
        <ArrowRight size={14} strokeWidth={2.75} />
      </div>
    </button>
  );
}

export function TablaPallets({ pallets, tipoSel }) {
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-5">Código</TableHead>
            <TableHead>Lote</TableHead>
            <TableHead>Recepción</TableHead>
            <TableHead className="pr-5">Proveedor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pallets.map((p) => (
            <TableRow key={p.IdPallet} className="hover:bg-slate-50">
              <TableCell
                className={cn("pl-5 font-mono font-bold", tipoSel.text)}
              >
                {p.CodigoPallet}
              </TableCell>
              <TableCell className="text-slate-600">{p.CodigoLote}</TableCell>
              <TableCell className="text-slate-600">
                {dateFormatter(p.FechaRecepcion)}
              </TableCell>
              <TableCell className="pr-5 text-slate-600">
                {p.NombreProveedor}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ListaMovilPallets({ pallets, tipoSel }) {
  return (
    <div className="flex flex-col gap-2.5 p-3.5">
      {pallets.map((p) => (
        <div
          key={p.IdPallet}
          className="flex flex-col gap-2.5 rounded-2xl border-2 border-slate-200 bg-white p-3.5"
        >
          <div
            className={cn(
              "font-mono text-[15px] font-extrabold",
              tipoSel.text,
            )}
          >
            {p.CodigoPallet}
          </div>
          <div className="flex gap-2">
            <MiniStat label="Lote" value={p.CodigoLote} />
            <MiniStat
              label="Recepción"
              value={dateFormatter(p.FechaRecepcion)}
            />
          </div>
          <div className="text-[12.5px] text-slate-600">
            {p.NombreProveedor}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function InventarioPallets({ usuario }) {
  const [tipos, setTipos] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [errorTipos, setErrorTipos] = useState("");

  const [sel, setSel] = useState(null);
  const [palletsSel, setPalletsSel] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState("");
  const [busquedaCodigo, setBusquedaCodigo] = useState("");

  const [mostrarFuera, setMostrarFuera] = useState(false);
  const [fueraInventario, setFueraInventario] = useState([]);
  const [loadingFuera, setLoadingFuera] = useState(false);
  const [errorFuera, setErrorFuera] = useState("");
  const [procesandoId, setProcesandoId] = useState(null);

  const [accion, setAccion] = useState(null);
  const [observacion, setObservacion] = useState("");

  const [modal, setModal] = useState(false);
  const [formTipo, setFormTipo] = useState(null);
  const [formCodigo, setFormCodigo] = useState("");
  const [formLote, setFormLote] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    cargarResumen();
    cargarFueraInventario();
  }, []);

  const cargarResumen = async () => {
    setLoadingTipos(true);
    setErrorTipos("");
    try {
      const data = await verResumenInventarioPallet();
      const conMeta = data.map((t, i) => ({
        ...t,
        ...ACENTOS[i % ACENTOS.length],
        badge:
          t.CantidadPallets === 0
            ? "Sin stock"
            : t.CantidadPallets < 6
              ? "Stock bajo"
              : "Disponible",
      }));
      setTipos(conMeta);
      if (conMeta.length && formTipo === null)
        setFormTipo(conMeta[0].IdTipoPallet);
    } catch (e) {
      setErrorTipos(e.message);
    } finally {
      setLoadingTipos(false);
    }
  };

  const cargarDetalle = async (idTipoPallet) => {
    setLoadingDetalle(true);
    setErrorDetalle("");
    try {
      const data = await verDetalleInventarioPallet(idTipoPallet);
      setPalletsSel(data);
    } catch (e) {
      setErrorDetalle(e.message);
      setPalletsSel([]);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const cargarFueraInventario = async () => {
    setLoadingFuera(true);
    setErrorFuera("");
    try {
      const data = await verPalletsFueraInventario();
      setFueraInventario(data);
    } catch (e) {
      setErrorFuera(e.message);
      setFueraInventario([]);
    } finally {
      setLoadingFuera(false);
    }
  };

  const tipoSel = sel ? tipos.find((t) => t.IdTipoPallet === sel) : null;
  const totalPallets = tipos.reduce((s, t) => s + t.CantidadPallets, 0);

  const palletsFiltrados = busquedaCodigo.trim()
    ? palletsSel.filter((p) =>
        p.CodigoPallet.toLowerCase().includes(
          busquedaCodigo.trim().toLowerCase(),
        ),
      )
    : palletsSel;

  const seleccionarTipo = (id) => {
    if (sel === id) {
      setSel(null);
      setPalletsSel([]);
      setBusquedaCodigo("");
      return;
    }
    setSel(id);
    setBusquedaCodigo("");
    cargarDetalle(id);
  };

  const cerrarDetalle = () => {
    setSel(null);
    setPalletsSel([]);
    setBusquedaCodigo("");
  };

  const toggleFueraInventario = () => {
    const nuevoEstado = !mostrarFuera;
    setMostrarFuera(nuevoEstado);
    if (nuevoEstado) cargarFueraInventario();
  };

  const abrirAccion = (tipo, pallet) => {
    setAccion({ tipo, pallet });
    setObservacion("");
  };

  const cerrarAccion = () => {
    setAccion(null);
    setObservacion("");
  };

  const confirmarAccion = async () => {
    if (!accion) return;
    const { tipo, pallet } = accion;
    setProcesandoId(pallet.IdPallet);
    try {
      const texto = observacion.trim() ? observacion.trim() : null;
      if (tipo === "reingresar") {
        await reingresarPalletInventario(pallet.IdPallet, texto);
        toast.success(`Pallet ${pallet.CodigoPallet} reingresado al inventario`);
        cargarResumen();
      } else {
        await darDeBajaPallet(pallet.IdPallet, texto);
        toast.success(
          `Pallet ${pallet.CodigoPallet} retirado definitivamente`,
        );
      }
      setFueraInventario((prev) =>
        prev.filter((p) => p.IdPallet !== pallet.IdPallet),
      );
      cerrarAccion();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setProcesandoId(null);
    }
  };

  const abrirIngreso = () => {
    setFormError("");
    setModal(true);
  };

  const guardarIngreso = () => {
    if (!formCodigo.trim()) {
      setFormError("Ingresa el código del pallet.");
      return;
    }
    if (!formLote.trim()) {
      setFormError("Ingresa el código de lote.");
      return;
    }
    setModal(false);
    const codigo = formCodigo.trim();
    setFormCodigo("");
    setFormLote("");
    toast.success(`Pallet ${codigo} registrado`);
  };

  return (
    <div className="mt-30 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-c3 to-c4 px-5 py-4 text-white sm:px-7">
        <div className="flex flex-col gap-0.5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
            Almacén · Materia Prima
          </div>
          <div className="text-xl font-extrabold">Inventario de Pallets</div>
        </div>
        <Button
          onClick={abrirIngreso}
          className="h-11 gap-2 bg-white font-bold text-c3 shadow-md hover:bg-slate-100"
        >
          <Plus size={16} strokeWidth={2.75} />
          Registrar ingreso
        </Button>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div className="text-sm font-bold text-slate-700">
            Catálogo por tipo de pallet
          </div>
          <div className="text-sm text-slate-500">
            Solo pallets <strong className="text-slate-700">en almacén</strong> ·{" "}
            {totalPallets} pallets
          </div>
        </div>

        {loadingTipos && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-52 rounded-2xl" />
            ))}
          </div>
        )}
        {errorTipos && (
          <div className="rounded-xl bg-red-50 p-5 text-center text-sm font-semibold text-red-600">
            {errorTipos}
          </div>
        )}

        {!loadingTipos && !errorTipos && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tipos.map((t) => (
              <TarjetaTipoPallet
                key={t.IdTipoPallet}
                tipo={t}
                activo={sel === t.IdTipoPallet}
                onClick={() => seleccionarTipo(t.IdTipoPallet)}
              />
            ))}
            <TarjetaFueraInventario
              cantidad={fueraInventario.length}
              activo={mostrarFuera}
              onClick={toggleFueraInventario}
            />
          </div>
        )}

        {tipoSel && (
          <div className="mt-7 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div
              className={cn(
                "flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4",
                tipoSel.soft,
              )}
            >
              <div className="flex flex-wrap items-center gap-3">
                <PalletIcono className={cn("h-7 w-7 shrink-0", tipoSel.text)} />
                <div className={cn("text-base font-extrabold", tipoSel.text)}>
                  Pallets · {nombreTipoPallet(tipoSel)}
                </div>
                <div className="text-sm font-semibold text-slate-500">
                  {tipoSel.CantidadPallets} en almacén
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={cerrarDetalle}
                className="h-11 gap-1.5 font-bold text-slate-500 hover:text-slate-900"
              >
                <X size={15} strokeWidth={2.75} />
                Cerrar
              </Button>
            </div>

            {!loadingDetalle && !errorDetalle && palletsSel.length > 0 && (
              <div className="border-b border-slate-100 px-5 py-3.5">
                <div className="relative max-w-xs">
                  <Search
                    size={16}
                    strokeWidth={2.5}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    value={busquedaCodigo}
                    onChange={(e) => setBusquedaCodigo(e.target.value)}
                    placeholder="Buscar por código..."
                    className="h-10 pl-9"
                  />
                  {busquedaCodigo && (
                    <button
                      onClick={() => setBusquedaCodigo("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      <X size={15} strokeWidth={2.75} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {loadingDetalle && (
              <div className="space-y-2 p-5">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            )}
            {errorDetalle && (
              <div className="p-5 text-center text-sm font-semibold text-red-600">
                {errorDetalle}
              </div>
            )}
            {!loadingDetalle && !errorDetalle && palletsSel.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-400">
                No hay pallets en almacén para este tipo.
              </div>
            )}
            {!loadingDetalle &&
              !errorDetalle &&
              palletsSel.length > 0 &&
              palletsFiltrados.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-400">
                  Ningún pallet coincide con "{busquedaCodigo}".
                </div>
              )}

            {!loadingDetalle && !errorDetalle && palletsFiltrados.length > 0 && (
              <>
                <div className="hidden md:block">
                  <TablaPallets pallets={palletsFiltrados} tipoSel={tipoSel} />
                </div>
                <div className="md:hidden">
                  <ListaMovilPallets
                    pallets={palletsFiltrados}
                    tipoSel={tipoSel}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {mostrarFuera && (
          <div className="mt-7 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-amber-50 px-5 py-4">
              <div className="text-base font-extrabold text-amber-700">
                Pallets fuera de inventario
              </div>
              <Button
                variant="ghost"
                onClick={() => setMostrarFuera(false)}
                className="h-11 gap-1.5 font-bold text-slate-500 hover:text-slate-900"
              >
                <X size={15} strokeWidth={2.75} />
                Cerrar
              </Button>
            </div>

            {loadingFuera && (
              <div className="space-y-2 p-5">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            )}
            {errorFuera && (
              <div className="p-5 text-center text-sm font-semibold text-red-600">
                {errorFuera}
              </div>
            )}
            {!loadingFuera && !errorFuera && fueraInventario.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-400">
                No hay pallets fuera de inventario.
              </div>
            )}

            {!loadingFuera && !errorFuera && fueraInventario.length > 0 && (
              <div className="flex flex-col gap-3 p-5">
                {fueraInventario.map((p) => (
                  <div
                    key={p.IdPallet}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[15px] font-extrabold text-slate-900">
                          {p.CodigoPallet}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-slate-300 font-bold text-slate-600"
                        >
                          {nombreTipoPallet(p)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[12.5px] text-slate-600">
                        <span>{p.NombreProveedor}</span>
                        <span>Recepción: {dateFormatter(p.FechaRecepcion)}</span>
                        {p.Descripcion && <span>{p.Descripcion}</span>}
                      </div>
                      {p.UltimaObservacion && (
                        <div className="text-[12.5px] italic text-slate-500">
                          "{p.UltimaObservacion}"
                        </div>
                      )}
                      {p.FechaUltimoMovimiento && (
                        <div className="text-[11px] text-slate-400">
                          Último movimiento:{" "}
                          {dateFormatter(p.FechaUltimoMovimiento)}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => abrirAccion("reingresar", p)}
                        disabled={procesandoId === p.IdPallet}
                        className="h-10 gap-2 bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                      >
                        {procesandoId === p.IdPallet ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          "Reingresar"
                        )}
                      </Button>
                      <Button
                        onClick={() => abrirAccion("baja", p)}
                        disabled={procesandoId === p.IdPallet}
                        variant="outline"
                        className="h-10 gap-2 border-red-300 font-bold text-red-600 hover:bg-red-50"
                      >
                        {procesandoId === p.IdPallet ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          "Retirar"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Dialog open={!!accion} onOpenChange={(v) => !v && cerrarAccion()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {accion?.tipo === "reingresar"
                ? "Reingresar pallet al inventario"
                : "Retirar pallet definitivamente"}
            </DialogTitle>
            <DialogDescription>
              {accion?.tipo === "reingresar"
                ? `El pallet ${accion?.pallet?.CodigoPallet} vuelve al almacén y queda disponible para producción.`
                : `El pallet ${accion?.pallet?.CodigoPallet} sale del inventario de forma permanente.`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="observacion-pallet"
                className="text-xs font-bold uppercase tracking-wide text-slate-600"
              >
                Observación (opcional)
              </Label>
              <Textarea
                id="observacion-pallet"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                placeholder="Motivo del movimiento..."
                className="min-h-24 resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={cerrarAccion}
                className="h-11 flex-1 font-bold"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmarAccion}
                disabled={procesandoId != null}
                className={cn(
                  "h-11 flex-1 font-extrabold text-white",
                  accion?.tipo === "reingresar"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700",
                )}
              >
                {procesandoId != null ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : accion?.tipo === "reingresar" ? (
                  "Reingresar"
                ) : (
                  "Retirar"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar ingreso de pallet</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Tipo de pallet
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {tipos.map((t) => (
                  <button
                    key={t.IdTipoPallet}
                    type="button"
                    onClick={() => setFormTipo(t.IdTipoPallet)}
                    className={cn(
                      "h-11 rounded-lg border-2 px-2 text-sm font-bold transition-colors",
                      formTipo === t.IdTipoPallet
                        ? cn(t.text, t.soft, t.border)
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                    )}
                  >
                    {nombreTipoPallet(t)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="codigo-pallet"
                className="text-xs font-bold uppercase tracking-wide text-slate-600"
              >
                Código de pallet
              </Label>
              <Input
                id="codigo-pallet"
                value={formCodigo}
                onChange={(e) => setFormCodigo(e.target.value)}
                placeholder="Ej. PAL-2026-0148"
                className="h-11"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="lote-pallet"
                className="text-xs font-bold uppercase tracking-wide text-slate-600"
              >
                Código de lote
              </Label>
              <Input
                id="lote-pallet"
                value={formLote}
                onChange={(e) => setFormLote(e.target.value)}
                placeholder="Ej. LT-2026-014"
                className="h-11"
              />
            </div>

            {formError && (
              <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600">
                {formError}
              </div>
            )}

            <Button
              onClick={guardarIngreso}
              className="h-12 bg-gradient-to-r from-c3 to-c4 text-base font-extrabold hover:opacity-90"
            >
              Guardar ingreso
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}