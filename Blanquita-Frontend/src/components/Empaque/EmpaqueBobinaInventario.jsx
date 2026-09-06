import { useState, useEffect } from "react";
import { Plus, X, ArrowRight, Loader2, Search, Package, Check } from "lucide-react";
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
  verResumenInventarioEmpaque,
  verDetalleInventarioEmpaque,
  trasladarEmpaquesAProduccion,
} from "../../services/Empaque/EmpaqueBobina";
import { dateFormatter } from "@/utils/dates";
import Header from "@/components/layout/Header";

const ACENTOS = [
  { text: "text-c3", bg: "bg-c4", soft: "bg-c4/8", border: "border-c4/30", ring: "ring-c4/40" },
  { text: "text-serv3", bg: "bg-serv3", soft: "bg-serv3/8", border: "border-serv3/30", ring: "ring-serv3/40" },
  { text: "text-lux2", bg: "bg-lux1", soft: "bg-lux1/8", border: "border-lux1/30", ring: "ring-lux1/40" },
  { text: "text-eco2", bg: "bg-eco1", soft: "bg-eco1/8", border: "border-eco1/30", ring: "ring-eco1/40" },
];

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
          <Package className={cn("h-7 w-7 shrink-0", t.text)} strokeWidth={2.25} />
          <div className="text-[17px] font-extrabold text-slate-900">
            {t.NombreTipoEmpaque}
          </div>
        </div>
        <Badge variant="outline" className={cn("border-0 font-bold", t.soft, t.text)}>
          {t.badge}
        </Badge>
      </div>

      <div className="flex items-baseline gap-1.5">
        <div className={cn("text-4xl font-extrabold tabular-nums", t.text)}>
          {t.CantidadEmpaques}
        </div>
        <div className="text-sm font-semibold text-slate-500">empaques en almacén</div>
      </div>

      <div className={cn("flex items-center justify-end gap-1.5 text-xs font-bold", t.text)}>
        Ver empaques
        <ArrowRight size={14} strokeWidth={2.75} />
      </div>
    </button>
  );
}

function TablaEmpaques({ empaques, tipoSel, marcados, onToggle }) {
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[620px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-11 pl-5" />
            <TableHead>Código</TableHead>
            <TableHead>Peso (kg)</TableHead>
            <TableHead>Recepción</TableHead>
            <TableHead className="pr-5">Proveedor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {empaques.map((e) => {
            const on = marcados.includes(e.IdEmpaque);
            return (
              <TableRow key={e.IdEmpaque} className={cn(on && tipoSel.soft)}>
                <TableCell className="pl-5">
                  <button
                    onClick={() => onToggle(e.IdEmpaque)}
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-md border-2",
                      on
                        ? cn(tipoSel.bg, "border-transparent text-white")
                        : "border-slate-300",
                    )}
                  >
                    {on && <Check size={13} strokeWidth={3.5} />}
                  </button>
                </TableCell>
                <TableCell className={cn("font-mono font-bold", tipoSel.text)}>
                  {e.CodigoEmpaque}
                </TableCell>
                <TableCell className="text-slate-600">{e.PesoKg}</TableCell>
                <TableCell className="text-slate-600">
                  {dateFormatter(e.FechaRecepcion)}
                </TableCell>
                <TableCell className="pr-5 text-slate-600">{e.NombreProveedor}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function ListaMovilEmpaques({ empaques, tipoSel, marcados, onToggle }) {
  return (
    <div className="flex flex-col gap-2.5 p-3.5">
      {empaques.map((e) => {
        const on = marcados.includes(e.IdEmpaque);
        return (
          <button
            key={e.IdEmpaque}
            onClick={() => onToggle(e.IdEmpaque)}
            className={cn(
              "flex flex-col gap-2.5 rounded-2xl border-2 p-3.5 text-left",
              on ? cn(tipoSel.soft, tipoSel.border) : "border-slate-200 bg-white",
            )}
          >
            <div className="flex items-center justify-between gap-2.5">
              <div className={cn("font-mono text-[15px] font-extrabold", tipoSel.text)}>
                {e.CodigoEmpaque}
              </div>
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2",
                  on
                    ? cn(tipoSel.bg, "border-transparent text-white")
                    : "border-slate-300",
                )}
              >
                {on && <Check size={14} strokeWidth={3.5} />}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[12.5px] text-slate-600">
              <span>
                <strong className="text-slate-900">{e.PesoKg} kg</strong> ·{" "}
                {dateFormatter(e.FechaRecepcion)}
              </span>
              <span>{e.NombreProveedor}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function EmpaqueBobinaInventario({ usuario }) {
  const [tipos, setTipos] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [errorTipos, setErrorTipos] = useState("");

  const [sel, setSel] = useState(null);
  const [empaquesSel, setEmpaquesSel] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState("");
  const [busquedaCodigo, setBusquedaCodigo] = useState("");

  const [marcados, setMarcados] = useState([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    cargarResumen();
  }, []);

  const cargarResumen = async () => {
    setLoadingTipos(true);
    setErrorTipos("");
    try {
      const data = await verResumenInventarioEmpaque();
      const conMeta = data.map((t, i) => ({
        ...t,
        ...ACENTOS[i % ACENTOS.length],
        badge:
          t.CantidadEmpaques === 0
            ? "Sin stock"
            : t.CantidadEmpaques < 6
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

  const cargarDetalle = async (idTipoEmpaque) => {
    setLoadingDetalle(true);
    setErrorDetalle("");
    try {
      const data = await verDetalleInventarioEmpaque(idTipoEmpaque);
      setEmpaquesSel(data);
    } catch (e) {
      setErrorDetalle(e.message);
      setEmpaquesSel([]);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const tipoSel = sel ? tipos.find((t) => t.IdTipoEmpaque === sel) : null;

  const totalEnAlmacen = tipos.reduce((s, t) => s + Number(t.CantidadEmpaques || 0), 0);

  const empaquesFiltrados = busquedaCodigo.trim()
    ? empaquesSel.filter((e) =>
        e.CodigoEmpaque.toLowerCase().includes(busquedaCodigo.trim().toLowerCase()),
      )
    : empaquesSel;

  const seleccionarTipo = (id) => {
    if (sel === id) {
      cerrarDetalle();
      return;
    }
    setSel(id);
    setMarcados([]);
    setBusquedaCodigo("");
    cargarDetalle(id);
  };

  const cerrarDetalle = () => {
    setSel(null);
    setEmpaquesSel([]);
    setMarcados([]);
    setBusquedaCodigo("");
  };

  const toggleEmpaque = (idEmpaque) => {
    setMarcados((prev) =>
      prev.includes(idEmpaque) ? prev.filter((id) => id !== idEmpaque) : [...prev, idEmpaque],
    );
  };

  const quitarChip = (idEmpaque) =>
    setMarcados((prev) => prev.filter((id) => id !== idEmpaque));

  const refrescar = () => {
    cargarResumen();
    if (sel) cargarDetalle(sel);
  };

  const enviarProduccion = async () => {
    if (marcados.length === 0) return;

    setEnviando(true);
    try {
      const resultado = await trasladarEmpaquesAProduccion(marcados);
      const codigos = resultado.map((r) => r.CodigoEmpaque).join(", ");
      toast.success(`${codigos} → Trasladado a producción`);
      setMarcados([]);
      refrescar();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="pt-20 md:pt-30 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      <Header
        titulo="Almacén · Materia Prima"
        subtitulo="Inventario de Empaques"
        accion={{
          texto: "Registrar ingreso",
          icono: Plus,
          href: "/operador/empaque/bobina-ingreso",
        }}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div className="text-sm font-bold text-slate-700">
            Catálogo por tipo de empaque
          </div>
          <div className="text-sm text-slate-500">
            {totalEnAlmacen} empaques <strong className="text-slate-700">en almacén</strong>
          </div>
        </div>

        {loadingTipos && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        )}
        {errorTipos && (
          <div className="rounded-xl bg-red-50 p-5 text-center text-sm font-semibold text-red-600">
            {errorTipos}
          </div>
        )}

        {!loadingTipos && !errorTipos && tipos.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-400 ring-1 ring-slate-200">
            No hay tipos de empaque registrados.
          </div>
        )}

        {!loadingTipos && !errorTipos && tipos.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tipos.map((t) => (
              <TarjetaTipo
                key={t.IdTipoEmpaque}
                tipo={t}
                activo={sel === t.IdTipoEmpaque}
                onClick={() => seleccionarTipo(t.IdTipoEmpaque)}
              />
            ))}
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
                <Package className={cn("h-6 w-6 shrink-0", tipoSel.text)} strokeWidth={2.25} />
                <div className={cn("text-base font-extrabold", tipoSel.text)}>
                  Empaques · {tipoSel.NombreTipoEmpaque}
                </div>
                <div className="text-sm font-semibold text-slate-500">
                  {tipoSel.CantidadEmpaques} en almacén
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

            {!loadingDetalle && !errorDetalle && empaquesSel.length > 0 && (
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
            {!loadingDetalle && !errorDetalle && empaquesSel.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-400">
                No hay empaques en almacén para este tipo.
              </div>
            )}
            {!loadingDetalle &&
              !errorDetalle &&
              empaquesSel.length > 0 &&
              empaquesFiltrados.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-400">
                  Ningún empaque coincide con "{busquedaCodigo}".
                </div>
              )}

            {!loadingDetalle && !errorDetalle && empaquesFiltrados.length > 0 && (
              <>
                <div className="hidden md:block">
                  <TablaEmpaques
                    empaques={empaquesFiltrados}
                    tipoSel={tipoSel}
                    marcados={marcados}
                    onToggle={toggleEmpaque}
                  />
                </div>
                <div className="md:hidden">
                  <ListaMovilEmpaques
                    empaques={empaquesFiltrados}
                    tipoSel={tipoSel}
                    marcados={marcados}
                    onToggle={toggleEmpaque}
                  />
                </div>
              </>
            )}

            {marcados.length > 0 && (
              <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 bg-slate-900 px-5 py-3.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  {marcados.map((idEmpaque) => {
                    const empaque = empaquesSel.find((e) => e.IdEmpaque === idEmpaque);
                    return (
                      <div
                        key={idEmpaque}
                        className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 font-mono text-sm font-bold text-white"
                      >
                        {empaque?.CodigoEmpaque ?? idEmpaque}
                        <button
                          onClick={() => quitarChip(idEmpaque)}
                          className="opacity-70 hover:opacity-100"
                        >
                          <X size={13} strokeWidth={3} />
                        </button>
                      </div>
                    );
                  })}
                  <div className="text-sm font-semibold text-slate-400">
                    {marcados.length} {marcados.length === 1 ? "empaque" : "empaques"} seleccionados
                  </div>
                </div>
                <Button
                  onClick={enviarProduccion}
                  disabled={enviando}
                  className="h-11 gap-2 bg-gradient-to-r from-c3 to-c4 font-extrabold text-white hover:opacity-90"
                >
                  {enviando ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Trasladando...
                    </>
                  ) : (
                    <>
                      Trasladar a producción
                      <ArrowRight size={16} strokeWidth={2.75} />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
