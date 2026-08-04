import { useState, useEffect } from "react";
import { Plus, X, ArrowRight, Loader2, Search, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { iniciarProduccionPallet } from "../../services/Pallet/Produccion";
import { dateFormatter } from "@/utils/dates";
import Header from "@/components/layout/Header";

const ACENTOS = [
  {
    text: "text-c3",
    bg: "bg-c4",
    soft: "bg-c4/8",
    border: "border-c4/30",
    ring: "ring-c4/40",
  },
  {
    text: "text-serv3",
    bg: "bg-serv3",
    soft: "bg-serv3/8",
    border: "border-serv3/30",
    ring: "ring-serv3/40",
  },
  {
    text: "text-lux2",
    bg: "bg-lux1",
    soft: "bg-lux1/8",
    border: "border-lux1/30",
    ring: "ring-lux1/40",
  },
  {
    text: "text-eco2",
    bg: "bg-eco1",
    soft: "bg-eco1/8",
    border: "border-eco1/30",
    ring: "ring-eco1/40",
  },
];

const fmt = (n) =>
  Number(n || 0).toLocaleString("es-BO", { maximumFractionDigits: 1 });

function PalletIcono({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none">
      <rect
        x="3.5"
        y="10"
        width="25"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path d="M3.5 22v5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M28.5 22v5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 10v12" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M9.5 5.5h13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

function FueraIcono({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none">
      <rect x="5" y="9" width="22" height="16" rx="2.5" stroke="currentColor" strokeWidth="2.5" />
      <path d="M5 13h22" stroke="currentColor" strokeWidth="2.5" />
      <path d="M12 5.5h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function MiniStat({ label, value }) {
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

function TarjetaTipo({ tipo: t, activo, onClick }) {
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
            {t.NombreTipoPallet}
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
            Peso neto
          </div>
          <div className="text-sm font-bold tabular-nums text-slate-900">
            {fmt(t.PesoNetoTotalKg)} kg
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Peso prom.
          </div>
          <div className="text-sm font-bold tabular-nums text-slate-900">
            {fmt(t.PesoPromedioKg)} kg
          </div>
        </div>
      </div>

      <div className={cn("flex items-center justify-end gap-1.5 text-xs font-bold", t.text)}>
        Ver pallets
        <ArrowRight size={14} strokeWidth={2.75} />
      </div>
    </button>
  );
}

function TarjetaFueraInventario({ cantidad, activo, onClick }) {
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
          <FueraIcono className="h-8 w-8 shrink-0 text-amber-600" />
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
          pallets dados de baja o retirados
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
        {activo ? "Ocultar lista" : "Ver pallets"}
        <ArrowRight size={14} strokeWidth={2.75} />
      </div>
    </button>
  );
}

function TablaPallets({ pallets, tipoSel, marcadas, onToggle }) {
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-11 pl-5" />
            <TableHead>Código</TableHead>
            <TableHead>Lote</TableHead>
            <TableHead>Recepción</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead className="text-right">Cantidad tubos</TableHead>
            <TableHead className="text-right">Peso bruto</TableHead>
            <TableHead className="pr-5 text-right">Peso neto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pallets.map((p) => {
            const on = marcadas.includes(p.CodigoPallet);
            return (
              <TableRow
                key={p.IdPallet}
                onClick={() => onToggle(p.CodigoPallet)}
                className={cn("cursor-pointer", on && tipoSel.soft)}
              >
                <TableCell className="pl-5">
                  <div
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-md border-2",
                      on
                        ? cn(tipoSel.bg, "border-transparent text-white")
                        : "border-slate-300",
                    )}
                  >
                    {on && <Check size={13} strokeWidth={3.5} />}
                  </div>
                </TableCell>
                <TableCell className={cn("font-mono font-bold", tipoSel.text)}>
                  {p.CodigoPallet}
                </TableCell>
                <TableCell className="text-slate-600">{p.CodigoLote}</TableCell>
                <TableCell className="text-slate-600">
                  {dateFormatter(p.FechaRecepcion)}
                </TableCell>
                <TableCell className="text-slate-600">
                  {p.NombreProveedor}
                </TableCell>
                <TableCell className="text-right tabular-nums text-slate-600">
                  {fmt(p.CantidadTubos)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-slate-600">
                  {fmt(p.PesoBrutoKg)} kg
                </TableCell>
                <TableCell className="pr-5 text-right font-bold tabular-nums text-slate-900">
                  {fmt(p.PesoNetoKg)} kg
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function ListaMovilPallets({ pallets, tipoSel, marcadas, onToggle }) {
  return (
    <div className="flex flex-col gap-2.5 p-3.5">
      {pallets.map((p) => {
        const on = marcadas.includes(p.CodigoPallet);
        return (
          <div
            key={p.IdPallet}
            onClick={() => onToggle(p.CodigoPallet)}
            className={cn(
              "flex flex-col gap-2.5 rounded-2xl border-2 p-3.5",
              on ? tipoSel.soft : "border-slate-200 bg-white",
              on && tipoSel.border,
            )}
          >
            <div className="flex items-center justify-between gap-2.5">
              <div className={cn("font-mono text-[15px] font-extrabold", tipoSel.text)}>
                {p.CodigoPallet}
              </div>
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2",
                  on
                    ? cn(tipoSel.bg, "border-transparent text-white")
                    : "border-slate-300",
                )}
              >
                {on && <Check size={14} strokeWidth={3.5} />}
              </div>
            </div>
            <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[12.5px] text-slate-600">
              <span>
                <strong className="text-slate-900">{p.CodigoLote}</strong> ·{" "}
                {dateFormatter(p.FechaRecepcion)}
              </span>
              <span>{p.NombreProveedor}</span>
            </div>
            <div className="flex gap-2">
              <MiniStat label="Tubos" value={fmt(p.CantidadTubos)} />
              <MiniStat label="Bruto" value={`${fmt(p.PesoBrutoKg)} kg`} />
              <MiniStat label="Neto" value={`${fmt(p.PesoNetoKg)} kg`} />
            </div>
          </div>
        );
      })}
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

  const [marcadas, setMarcadas] = useState([]);
  const [enviando, setEnviando] = useState(false);

  const [mostrarFuera, setMostrarFuera] = useState(false);
  const [fueraInventario, setFueraInventario] = useState([]);
  const [loadingFuera, setLoadingFuera] = useState(false);
  const [errorFuera, setErrorFuera] = useState("");
  const [procesandoId, setProcesandoId] = useState(null);

  const requeridas = 1;

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

  const tipoSel = sel ? tipos.find((t) => t.IdTipoPallet === sel) : null;

  const totalPallets = tipos.reduce((s, t) => s + t.CantidadPallets, 0);
  const totalPesoFmt = fmt(
    tipos.reduce((s, t) => s + Number(t.PesoNetoTotalKg || 0), 0),
  );
  const listas = marcadas.length === requeridas;

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
      setMarcadas([]);
      setBusquedaCodigo("");
      return;
    }
    setSel(id);
    setMarcadas([]);
    setBusquedaCodigo("");
    cargarDetalle(id);
  };

  const cerrarDetalle = () => {
    setSel(null);
    setPalletsSel([]);
    setMarcadas([]);
    setBusquedaCodigo("");
  };

  const togglePallet = (codigo) => {
    setMarcadas((prev) => {
      if (prev.includes(codigo)) return prev.filter((c) => c !== codigo);
      if (prev.length < requeridas) return [...prev, codigo];
      return [codigo];
    });
  };

  const quitarChip = (codigo) =>
    setMarcadas((prev) => prev.filter((c) => c !== codigo));

  const enviarProduccion = async () => {
    if (!listas) return;

    const pallet = palletsSel.find((p) => p.CodigoPallet === marcadas[0]);
    if (!pallet) return;

    setEnviando(true);
    try {
      await iniciarProduccionPallet(pallet.IdPallet);

      setPalletsSel((prev) =>
        prev.filter((p) => !marcadas.includes(p.CodigoPallet)),
      );
      toast.success(`${marcadas.join(" + ")} → En producción`);
      setMarcadas([]);
      cargarResumen();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setEnviando(false);
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

  const toggleFueraInventario = () => {
    const nuevoEstado = !mostrarFuera;
    setMostrarFuera(nuevoEstado);
    if (nuevoEstado) {
      cargarFueraInventario();
    }
  };

  const handleReingresar = async (idPallet, codigoPallet) => {
    setProcesandoId(idPallet);
    try {
      await reingresarPalletInventario(idPallet);
      toast.success(`Pallet ${codigoPallet} reingresado al inventario`);
      setFueraInventario((prev) => prev.filter((p) => p.IdPallet !== idPallet));
      cargarResumen();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setProcesandoId(null);
    }
  };

  const handleDarDeBaja = async (idPallet, codigoPallet) => {
    setProcesandoId(idPallet);
    try {
      await darDeBajaPallet(idPallet);
      toast.success(`Pallet ${codigoPallet} retirado definitivamente`);
      setFueraInventario((prev) => prev.filter((p) => p.IdPallet !== idPallet));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setProcesandoId(null);
    }
  };

  return (
    <div className="pt-20 md:pt-30 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      <Header
        titulo="Almacén · Materia Prima"
        subtitulo="Inventario de Pallets de Tubo"
        accion={{
          texto: "Registrar ingreso",
          icono: Plus,
          href: "/rodela/ingreso",
        }}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div className="text-sm font-bold text-slate-700">
            Catálogo por tipo de pallet
          </div>
          <div className="text-sm text-slate-500">
            Solo pallets <strong className="text-slate-700">en almacén</strong>{" "}
            · {totalPallets} pallets · {totalPesoFmt} kg netos
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
              <TarjetaTipo
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
                  Pallets · {tipoSel.NombreTipoPallet}
                </div>
                <div className="text-sm font-semibold text-slate-500">
                  {tipoSel.CantidadPallets} en almacén
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "border font-bold",
                    tipoSel.text,
                    tipoSel.border,
                  )}
                >
                  Se envía 1 pallet
                </Badge>
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
                  <TablaPallets
                    pallets={palletsFiltrados}
                    tipoSel={tipoSel}
                    marcadas={marcadas}
                    onToggle={togglePallet}
                  />
                </div>
                <div className="md:hidden">
                  <ListaMovilPallets
                    pallets={palletsFiltrados}
                    tipoSel={tipoSel}
                    marcadas={marcadas}
                    onToggle={togglePallet}
                  />
                </div>
              </>
            )}

            {marcadas.length > 0 && (
              <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 bg-slate-900 px-5 py-3.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  {marcadas.map((codigo) => (
                    <div
                      key={codigo}
                      className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 font-mono text-sm font-bold text-white"
                    >
                      {codigo}
                      <button
                        onClick={() => quitarChip(codigo)}
                        className="opacity-70 hover:opacity-100"
                      >
                        <X size={13} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                  <div className="text-sm font-semibold text-slate-400">
                    {listas
                      ? "Listo para enviar"
                      : `Selecciona ${requeridas - marcadas.length} más`}
                  </div>
                </div>
                <Button
                  onClick={enviarProduccion}
                  disabled={!listas || enviando}
                  className={cn(
                    "h-11 gap-2 bg-white/15 font-extrabold text-white hover:bg-white/15",
                    listas && "bg-gradient-to-r from-c3 to-c4 hover:opacity-90",
                  )}
                >
                  {enviando ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar a producción
                      <ArrowRight size={16} strokeWidth={2.75} />
                    </>
                  )}
                </Button>
              </div>
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
                          {p.NombreTipoPallet}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[12.5px] text-slate-600">
                        <span>{p.NombreProveedor}</span>
                        <span>Recepción: {dateFormatter(p.FechaRecepcion)}</span>
                        <span>Bruto: {fmt(p.PesoBrutoKg)} kg</span>
                        <span>Tubos: {fmt(p.CantidadTubos)}</span>
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
                        onClick={() =>
                          handleReingresar(p.IdPallet, p.CodigoPallet)
                        }
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
                        onClick={() =>
                          handleDarDeBaja(p.IdPallet, p.CodigoPallet)
                        }
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
    </div>
  );
}