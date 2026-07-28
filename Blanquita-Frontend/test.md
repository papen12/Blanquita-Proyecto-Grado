export const ResumenInventarioPalletResponse = (data) => ({
  IdTipoPallet: data.IdTipoPallet,
  NumeroRodelas: data.NumeroRodelas ?? null,
  Descripcion: data.Descripcion ?? null,
  CantidadPallets: data.CantidadPallets
});

export const DetalleInventarioPalletRequest = (idTipoPallet) => ({
  IdTipoPallet: idTipoPallet
});

export const DetalleInventarioPalletResponse = (data) => ({
  IdPallet: data.IdPallet,
  CodigoPallet: data.CodigoPallet,
  CodigoLote: data.CodigoLote,
  FechaRecepcion: data.FechaRecepcion,
  NombreProveedor: data.NombreProveedor
});

export const ReingresarPalletInventarioRequest = (idPallet, observacion) => ({
  IdPallet: idPallet,
  Observacion: observacion ?? null
});

export const ReingresarPalletInventarioResponse = (data) => ({
  IdPallet: data.IdPallet,
  IdEstadoMateriaPrima: data.IdEstadoMateriaPrima,
  FechaMovimiento: data.FechaMovimiento
});

export const DarDeBajaPalletRequest = (idPallet, observacion) => ({
  IdPallet: idPallet,
  Observacion: observacion ?? null
});

export const DarDeBajaPalletResponse = (data) => ({
  IdPallet: data.IdPallet,
  IdEstadoMateriaPrima: data.IdEstadoMateriaPrima,
  FechaMovimiento: data.FechaMovimiento
});

export const PalletFueraInventarioResponse = (data) => ({
  IdPallet: data.IdPallet,
  CodigoPallet: data.CodigoPallet,
  NumeroRodelas: data.NumeroRodelas ?? null,
  Descripcion: data.Descripcion ?? null,
  NombreProveedor: data.NombreProveedor,
  FechaRecepcion: data.FechaRecepcion,
  UltimaObservacion: data.UltimaObservacion ?? null,
  FechaUltimoMovimiento: data.FechaUltimoMovimiento
});












import {
  ResumenInventarioPalletResponse,
  DetalleInventarioPalletResponse,
  ReingresarPalletInventarioRequest,
  ReingresarPalletInventarioResponse,
  DarDeBajaPalletRequest,
  DarDeBajaPalletResponse,
  PalletFueraInventarioResponse
} from "../../models/Pallet/Inventario";
import { manejarErrorBackend } from "@/utils/Error";

export async function verResumenInventarioPallet() {
  const response = await fetch("/api/pallet/inventario/resumen");

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(ResumenInventarioPalletResponse);
}

export async function verDetalleInventarioPallet(idTipoPallet) {
  const response = await fetch(`/api/pallet/inventario/detalle/${idTipoPallet}`);

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(DetalleInventarioPalletResponse);
}

export async function reingresarPalletInventario(idPallet, observacion) {
  const payload = ReingresarPalletInventarioRequest(idPallet, observacion);

  const response = await fetch("/api/pallet/inventario/reingresar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return ReingresarPalletInventarioResponse(data);
}

export async function darDeBajaPallet(idPallet, observacion) {
  const payload = DarDeBajaPalletRequest(idPallet, observacion);

  const response = await fetch("/api/pallet/inventario/dardebaja", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return DarDeBajaPalletResponse(data);
}

export async function verPalletsFueraInventario() {
  const response = await fetch("/api/pallet/inventario/fuera");

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(PalletFueraInventarioResponse);
}














export function RolloIcono({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none">
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="16" cy="16" r="6.5" stroke="currentColor" strokeWidth="2.5" />
      <path
        d="M16 2.5C16 2.5 26 6 26 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

export function FueraIcono({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none">
      <rect x="5" y="9" width="22" height="16" rx="2.5" stroke="currentColor" strokeWidth="2.5" />
      <path d="M5 13h22" stroke="currentColor" strokeWidth="2.5" />
      <path d="M12 5.5h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { dateFormatter } from "@/utils/dateFormater";
import { fmt } from "./constantes";
import { MiniStat } from "./MiniStat";

export function ListaMovilBobinas({ bobinas, tipoSel, marcadas, onToggle }) {
  return (
    <div className="flex flex-col gap-2.5 p-3.5">
      {bobinas.map((b) => {
        const on = marcadas.includes(b.CodigoBobina);
        return (
          <div
            key={b.IdBobinaPapel}
            onClick={() => onToggle(b.CodigoBobina)}
            className={cn(
              "flex flex-col gap-2.5 rounded-2xl border-2 p-3.5",
              on ? tipoSel.soft : "border-slate-200 bg-white",
              on && tipoSel.border,
            )}
          >
            <div className="flex items-center justify-between gap-2.5">
              <div className={cn("font-mono text-[15px] font-extrabold", tipoSel.text)}>
                {b.CodigoBobina}
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
                <strong className="text-slate-900">{b.CodigoLote}</strong> ·{" "}
                {dateFormatter(b.FechaRecepcion)}
              </span>
              <span>{b.NombreProveedor}</span>
            </div>
            <div className="flex gap-2">
              <MiniStat label="Bruto" value={`${fmt(b.PesoBrutoKg)} kg`} />
              <MiniStat label="Neto" value={`${fmt(b.PesoNetoKg)} kg`} />
              <MiniStat label="Gramaje" value={`${fmt(b.Gramaje)} g/m²`} />
            </div>
          </div>
        );
      })}
    </div>
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
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { dateFormatter } from "@/utils/dateFormater";
import { fmt } from "./constantes";

export function TablaBobinas({ bobinas, tipoSel, marcadas, onToggle }) {
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
            <TableHead className="text-right">Peso bruto</TableHead>
            <TableHead className="text-right">Peso neto</TableHead>
            <TableHead className="pr-5 text-right">Gramaje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bobinas.map((b) => {
            const on = marcadas.includes(b.CodigoBobina);
            return (
              <TableRow
                key={b.IdBobinaPapel}
                onClick={() => onToggle(b.CodigoBobina)}
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
                  {b.CodigoBobina}
                </TableCell>
                <TableCell className="text-slate-600">{b.CodigoLote}</TableCell>
                <TableCell className="text-slate-600">
                  {dateFormatter(b.FechaRecepcion)}
                </TableCell>
                <TableCell className="text-slate-600">
                  {b.NombreProveedor}
                </TableCell>
                <TableCell className="text-right tabular-nums text-slate-600">
                  {fmt(b.PesoBrutoKg)} kg
                </TableCell>
                <TableCell className="text-right font-bold tabular-nums text-slate-900">
                  {fmt(b.PesoNetoKg)} kg
                </TableCell>
                <TableCell className="pr-5 text-right tabular-nums text-slate-600">
                  {fmt(b.Gramaje)} g/m²
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { RolloIcono } from "./Iconos";
import { fmt } from "./constantes";

export function TarjetaTipo({ tipo: t, activo, onClick }) {
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
          <RolloIcono className={cn("h-8 w-8 shrink-0", t.text)} />
          <div className="text-[17px] font-extrabold text-slate-900">
            {t.NombreTipoBobina}
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
          {t.CantidadBobinas}
        </div>
        <div className="text-sm font-semibold text-slate-500">
          bobinas en almacén
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
            Gramaje prom.
          </div>
          <div className="text-sm font-bold tabular-nums text-slate-900">
            {fmt(t.GramajePromedio)} g/m²
          </div>
        </div>
      </div>

      <div className={cn("flex items-center justify-end gap-1.5 text-xs font-bold", t.text)}>
        Ver bobinas
        <ArrowRight size={14} strokeWidth={2.75} />
      </div>
    </button>
  );
}

import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { RolloIcono } from "./Iconos";
import { fmt } from "./constantes";

export function TarjetaTipo({ tipo: t, activo, onClick }) {
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
          <RolloIcono className={cn("h-8 w-8 shrink-0", t.text)} />
          <div className="text-[17px] font-extrabold text-slate-900">
            {t.NombreTipoBobina}
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
          {t.CantidadBobinas}
        </div>
        <div className="text-sm font-semibold text-slate-500">
          bobinas en almacén
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
            Gramaje prom.
          </div>
          <div className="text-sm font-bold tabular-nums text-slate-900">
            {fmt(t.GramajePromedio)} g/m²
          </div>
        </div>
      </div>

      <div className={cn("flex items-center justify-end gap-1.5 text-xs font-bold", t.text)}>
        Ver bobinas
        <ArrowRight size={14} strokeWidth={2.75} />
      </div>
    </button>
  );
}

import { useState, useEffect } from "react";
import { Plus, X, ArrowRight, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  verResumenInventarioBobinaPapel,
  verDetalleInventarioBobinaPapel,
  verBobinasPapelFueraInventario,
  reingresarBobinaInventario,
  darDeBajaBobina,
} from "../../../services/BobinaPapel/Inventario";
import { iniciarProduccion } from "../../../services/BobinaPapel/Produccion";
import { dateFormatter } from "@/utils/dateFormater";

import { ACENTOS, fmt } from "./constantes";
import { RolloIcono } from "./Iconos";
import { TarjetaTipo } from "./TarjetaTipo";
import { TarjetaFueraInventario } from "./TarjetaFueraInventario";
import { TablaBobinas } from "./TablaBobinas";
import { ListaMovilBobinas } from "./ListaMovilBobinas";

export default function InventarioBobinasPapel({ usuario }) {
  const [tipos, setTipos] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [errorTipos, setErrorTipos] = useState("");

  const [sel, setSel] = useState(null);
  const [bobinasSel, setBobinasSel] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState("");
  const [busquedaCodigo, setBusquedaCodigo] = useState("");

  const [marcadas, setMarcadas] = useState([]);
  const [modal, setModal] = useState(false);

  const [formTipo, setFormTipo] = useState(null);
  const [formCodigo, setFormCodigo] = useState("");
  const [formPeso, setFormPeso] = useState("");
  const [formGramaje, setFormGramaje] = useState("");
  const [formError, setFormError] = useState("");

  const [enviando, setEnviando] = useState(false);

  const [mostrarFuera, setMostrarFuera] = useState(false);
  const [fueraInventario, setFueraInventario] = useState([]);
  const [loadingFuera, setLoadingFuera] = useState(false);
  const [errorFuera, setErrorFuera] = useState("");
  const [procesandoId, setProcesandoId] = useState(null);

  useEffect(() => {
    cargarResumen();
    cargarFueraInventario();
  }, []);

  const cargarResumen = async () => {
    setLoadingTipos(true);
    setErrorTipos("");
    try {
      const data = await verResumenInventarioBobinaPapel();
      const conMeta = data.map((t, i) => ({
        ...t,
        ...ACENTOS[i % ACENTOS.length],
        badge:
          t.CantidadBobinas === 0
            ? "Sin stock"
            : t.CantidadBobinas < 6
              ? "Stock bajo"
              : "Disponible",
      }));
      setTipos(conMeta);
      if (conMeta.length && formTipo === null)
        setFormTipo(conMeta[0].IdTipoBobina);
    } catch (e) {
      setErrorTipos(e.message);
    } finally {
      setLoadingTipos(false);
    }
  };

  const cargarDetalle = async (idTipoBobina) => {
    setLoadingDetalle(true);
    setErrorDetalle("");
    try {
      const data = await verDetalleInventarioBobinaPapel(idTipoBobina);
      setBobinasSel(data);
    } catch (e) {
      setErrorDetalle(e.message);
      setBobinasSel([]);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const tipoSel = sel ? tipos.find((t) => t.IdTipoBobina === sel) : null;
  const esServilleta = tipoSel
    ? tipoSel.NombreTipoBobina.toLowerCase().includes("servilleta")
    : false;
  const requeridas = esServilleta ? 1 : 2;

  const totalBobinas = tipos.reduce((s, t) => s + t.CantidadBobinas, 0);
  const totalPesoFmt = fmt(
    tipos.reduce((s, t) => s + Number(t.PesoNetoTotalKg || 0), 0),
  );
  const listas = marcadas.length === requeridas;

  const bobinasFiltradas = busquedaCodigo.trim()
    ? bobinasSel.filter((b) =>
        b.CodigoBobina.toLowerCase().includes(busquedaCodigo.trim().toLowerCase()),
      )
    : bobinasSel;

  const seleccionarTipo = (id) => {
    if (sel === id) {
      setSel(null);
      setBobinasSel([]);
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
    setBobinasSel([]);
    setMarcadas([]);
    setBusquedaCodigo("");
  };

  const toggleBobina = (codigo) => {
    setMarcadas((prev) => {
      if (prev.includes(codigo)) return prev.filter((c) => c !== codigo);
      if (prev.length < requeridas) return [...prev, codigo];
      if (requeridas === 1) return [codigo];
      return prev;
    });
  };

  const quitarChip = (codigo) =>
    setMarcadas((prev) => prev.filter((c) => c !== codigo));

  const enviarProduccion = async () => {
    if (!listas || esServilleta) return;

    const bobina1 = bobinasSel.find((b) => b.CodigoBobina === marcadas[0]);
    const bobina2 = bobinasSel.find((b) => b.CodigoBobina === marcadas[1]);
    if (!bobina1 || !bobina2) return;

    setEnviando(true);
    try {
      await iniciarProduccion(bobina1.IdBobinaPapel, bobina2.IdBobinaPapel);

      setBobinasSel((prev) =>
        prev.filter((b) => !marcadas.includes(b.CodigoBobina)),
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
      const data = await verBobinasPapelFueraInventario();
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

  const handleReingresar = async (idBobinaPapel, codigoBobina) => {
    setProcesandoId(idBobinaPapel);
    try {
      await reingresarBobinaInventario(idBobinaPapel);
      toast.success(`Bobina ${codigoBobina} reingresada al inventario`);
      setFueraInventario((prev) =>
        prev.filter((b) => b.IdBobinaPapel !== idBobinaPapel),
      );
      cargarResumen();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setProcesandoId(null);
    }
  };

  const handleDarDeBaja = async (idBobinaPapel, codigoBobina) => {
    setProcesandoId(idBobinaPapel);
    try {
      await darDeBajaBobina(idBobinaPapel);
      toast.success(`Bobina ${codigoBobina} retirada definitivamente`);
      setFueraInventario((prev) =>
        prev.filter((b) => b.IdBobinaPapel !== idBobinaPapel),
      );
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
      setFormError("Ingresa el código de la bobina.");
      return;
    }
    if (!formPeso || +formPeso <= 0) {
      setFormError("Ingresa un peso bruto válido.");
      return;
    }
    setModal(false);
    const codigo = formCodigo.trim();
    setFormCodigo("");
    setFormPeso("");
    setFormGramaje("");
    toast.success(`Bobina ${codigo} registrada`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 mt-30" >
      <header className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-c3 to-c4 px-5 py-4 text-white sm:px-7">
        <div className="flex flex-col gap-0.5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
            Almacén · Materia Prima
          </div>
          <div className="text-xl font-extrabold">
            Inventario de Bobinas de Papel
          </div>
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
            Catálogo por tipo de bobina
          </div>
          <div className="text-sm text-slate-500">
            Solo bobinas <strong className="text-slate-700">en almacén</strong>{" "}
            · {totalBobinas} bobinas · {totalPesoFmt} kg netos
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
                key={t.IdTipoBobina}
                tipo={t}
                activo={sel === t.IdTipoBobina}
                onClick={() => seleccionarTipo(t.IdTipoBobina)}
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
                <RolloIcono className={cn("h-7 w-7 shrink-0", tipoSel.text)} />
                <div className={cn("text-base font-extrabold", tipoSel.text)}>
                  Bobinas · {tipoSel.NombreTipoBobina}
                </div>
                <div className="text-sm font-semibold text-slate-500">
                  {tipoSel.CantidadBobinas} en almacén
                </div>
                <Badge
                  variant="outline"
                  className={cn("border font-bold", tipoSel.text, tipoSel.border)}
                >
                  {esServilleta ? "Se envía 1 bobina" : "Se envían de a 2 bobinas"}
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

            {!loadingDetalle && !errorDetalle && bobinasSel.length > 0 && (
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
            {!loadingDetalle && !errorDetalle && bobinasSel.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-400">
                No hay bobinas en almacén para este tipo.
              </div>
            )}
            {!loadingDetalle &&
              !errorDetalle &&
              bobinasSel.length > 0 &&
              bobinasFiltradas.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-400">
                  Ninguna bobina coincide con "{busquedaCodigo}".
                </div>
              )}

            {!loadingDetalle && !errorDetalle && bobinasFiltradas.length > 0 && (
              <>
                <div className="hidden md:block">
                  <TablaBobinas
                    bobinas={bobinasFiltradas}
                    tipoSel={tipoSel}
                    marcadas={marcadas}
                    onToggle={toggleBobina}
                  />
                </div>
                <div className="md:hidden">
                  <ListaMovilBobinas
                    bobinas={bobinasFiltradas}
                    tipoSel={tipoSel}
                    marcadas={marcadas}
                    onToggle={toggleBobina}
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
                    listas &&
                      "bg-gradient-to-r from-c3 to-c4 hover:opacity-90",
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
                Bobinas fuera de inventario
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
                No hay bobinas fuera de inventario.
              </div>
            )}

            {!loadingFuera && !errorFuera && fueraInventario.length > 0 && (
              <div className="flex flex-col gap-3 p-5">
                {fueraInventario.map((b) => (
                  <div
                    key={b.IdBobinaPapel}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[15px] font-extrabold text-slate-900">
                          {b.CodigoBobina}
                        </span>
                        <Badge variant="outline" className="border-slate-300 font-bold text-slate-600">
                          {b.NombreTipoBobina}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[12.5px] text-slate-600">
                        <span>{b.NombreProveedor}</span>
                        <span>Recepción: {dateFormatter(b.FechaRecepcion)}</span>
                        <span>Bruto: {fmt(b.PesoBrutoKg)} kg</span>
                        <span>Gramaje: {fmt(b.Gramaje)} g/m²</span>
                      </div>
                      {b.UltimaObservacion && (
                        <div className="text-[12.5px] italic text-slate-500">
                          "{b.UltimaObservacion}"
                        </div>
                      )}
                      {b.FechaUltimoMovimiento && (
                        <div className="text-[11px] text-slate-400">
                          Último movimiento: {dateFormatter(b.FechaUltimoMovimiento)}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleReingresar(b.IdBobinaPapel, b.CodigoBobina)}
                        disabled={procesandoId === b.IdBobinaPapel}
                        className="h-10 gap-2 bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                      >
                        {procesandoId === b.IdBobinaPapel ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          "Reingresar"
                        )}
                      </Button>
                      <Button
                        onClick={() => handleDarDeBaja(b.IdBobinaPapel, b.CodigoBobina)}
                        disabled={procesandoId === b.IdBobinaPapel}
                        variant="outline"
                        className="h-10 gap-2 border-red-300 font-bold text-red-600 hover:bg-red-50"
                      >
                        {procesandoId === b.IdBobinaPapel ? (
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

      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar ingreso de bobina</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Tipo de bobina
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {tipos.map((t) => (
                  <button
                    key={t.IdTipoBobina}
                    type="button"
                    onClick={() => setFormTipo(t.IdTipoBobina)}
                    className={cn(
                      "h-11 rounded-lg border-2 text-sm font-bold transition-colors",
                      formTipo === t.IdTipoBobina
                        ? cn(t.text, t.soft, t.border)
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                    )}
                  >
                    {t.NombreTipoBobina}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="codigo-bobina" className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Código de bobina
              </Label>
              <Input
                id="codigo-bobina"
                value={formCodigo}
                onChange={(e) => setFormCodigo(e.target.value)}
                placeholder="Ej. HIG-2026-0148"
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="peso-bruto" className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Peso bruto (kg)
                </Label>
                <Input
                  id="peso-bruto"
                  value={formPeso}
                  onChange={(e) => setFormPeso(e.target.value)}
                  placeholder="0.0"
                  type="number"
                  className="h-11"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="gramaje" className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Gramaje (g/m²)
                </Label>
                <Input
                  id="gramaje"
                  value={formGramaje}
                  onChange={(e) => setFormGramaje(e.target.value)}
                  placeholder="0.0"
                  type="number"
                  className="h-11"
                />
              </div>
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





