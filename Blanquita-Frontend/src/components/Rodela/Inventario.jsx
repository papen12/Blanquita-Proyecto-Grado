import { useState, useEffect } from "react";
import {
  Plus,
  X,
  ArrowRight,
  Loader2,
  Search,
  Check,
  Disc,
  Download,
  Pencil,
  SquarePen,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import InputForModal from "@/components/layout/InputForModal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  verResumenInventarioRodela,
  verDetalleInventarioRodela,
  trasladarRodelaAProduccion,
  editarRodela,
} from "../../services/Rodela/Inventario";
import { descargarReporteInventarioRodela } from "@/services/Rodela/Reportes";
import { dateFormatter } from "@/utils/dates";
import { aCodigo } from "@/utils/handlers";
import { extraerMensajeError } from "@/utils/validators";
import Header from "@/components/layout/Header";
import {
  Roles,
  OBSERVACION_RODELA_MIN,
  OBSERVACION_RODELA_MAX,
} from "@/constants/Values";

const ACENTOS = [
  { text: "text-c3", bg: "bg-c4", soft: "bg-c4/8", border: "border-c4/30", ring: "ring-c4/40" },
  { text: "text-serv3", bg: "bg-serv3", soft: "bg-serv3/8", border: "border-serv3/30", ring: "ring-serv3/40" },
  { text: "text-lux2", bg: "bg-lux1", soft: "bg-lux1/8", border: "border-lux1/30", ring: "ring-lux1/40" },
  { text: "text-eco2", bg: "bg-eco1", soft: "bg-eco1/8", border: "border-eco1/30", ring: "ring-eco1/40" },
];

const ESTADO_ALMACEN = "En almacén";

const etiquetaRodelas = (n) => {
  const cantidad = Number(n || 0);
  return `${cantidad} ${cantidad === 1 ? "rodela" : "rodelas"}`;
};

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
          <Disc className={cn("h-8 w-8 shrink-0", t.text)} strokeWidth={2} />
          <div className="text-[17px] font-extrabold text-slate-900">
            {t.NombreTipoRodela}
          </div>
        </div>
        <Badge variant="outline" className={cn("border-0 font-bold", t.soft, t.text)}>
          {t.badge}
        </Badge>
      </div>

      <div className="flex items-baseline gap-1.5">
        <div className={cn("text-4xl font-extrabold tabular-nums", t.text)}>
          {t.CantidadEnAlmacen}
        </div>
        <div className="text-sm font-semibold text-slate-500">rodelas en almacén</div>
      </div>

      <div className="rounded-lg bg-slate-50 px-3 py-2.5">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Abiertas en producción
        </div>
        <div className="text-sm font-bold text-slate-900">
          {etiquetaRodelas(t.CantidadAbiertas)}
        </div>
      </div>

      {t.Descripcion && (
        <div className="text-[12.5px] leading-snug text-slate-500">{t.Descripcion}</div>
      )}

      <div className={cn("flex items-center justify-end gap-1.5 text-xs font-bold", t.text)}>
        Ver rodelas
        <ArrowRight size={14} strokeWidth={2.75} />
      </div>
    </button>
  );
}

function BotonEditar({ rodela, onEditar, className }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onEditar(rodela)}
      aria-label={`Editar ${rodela.CodigoRodela}`}
      className={cn("gap-1.5 font-bold text-c3", className)}
    >
      <SquarePen size={14} strokeWidth={2.5} />
      Editar
    </Button>
  );
}

function TablaRodelas({ rodelas, tipoSel, marcadas, onToggle, onEditar }) {
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[560px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-11 pl-5" />
            <TableHead>Código</TableHead>
            <TableHead>Lote</TableHead>
            <TableHead>Recepción</TableHead>
            <TableHead className={cn(!onEditar && "pr-5")}>Proveedor</TableHead>
            {onEditar && <TableHead className="pr-5 text-right">Acción</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rodelas.map((r) => {
            const on = marcadas.includes(r.CodigoRodela);
            return (
              <TableRow key={r.IdRodela} className={cn(on && tipoSel.soft)}>
                <TableCell className="pl-5">
                  <button
                    onClick={() => onToggle(r.CodigoRodela)}
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
                  {r.CodigoRodela}
                </TableCell>
                <TableCell className="text-slate-600">{r.CodigoLote}</TableCell>
                <TableCell className="text-slate-600">
                  {dateFormatter(r.FechaRecepcion)}
                </TableCell>
                <TableCell className={cn("text-slate-600", !onEditar && "pr-5")}>
                  {r.NombreProveedor}
                </TableCell>
                {onEditar && (
                  <TableCell className="pr-5 text-right">
                    <BotonEditar rodela={r} onEditar={onEditar} />
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function ListaMovilRodelas({ rodelas, tipoSel, marcadas, onToggle, onEditar }) {
  return (
    <div className="flex flex-col gap-2.5 p-3.5">
      {rodelas.map((r) => {
        const on = marcadas.includes(r.CodigoRodela);
        return (
          <div
            key={r.IdRodela}
            className={cn(
              "flex flex-col gap-2.5 rounded-2xl border-2 p-3.5",
              on ? cn(tipoSel.soft, tipoSel.border) : "border-slate-200 bg-white",
            )}
          >
            <div className="flex items-center justify-between gap-2.5">
              <div className={cn("font-mono text-[15px] font-extrabold", tipoSel.text)}>
                {r.CodigoRodela}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {onEditar && <BotonEditar rodela={r} onEditar={onEditar} />}
                <button
                  onClick={() => onToggle(r.CodigoRodela)}
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2",
                    on
                      ? cn(tipoSel.bg, "border-transparent text-white")
                      : "border-slate-300",
                  )}
                >
                  {on && <Check size={14} strokeWidth={3.5} />}
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[12.5px] text-slate-600">
              <span>
                <strong className="text-slate-900">{r.CodigoLote}</strong> ·{" "}
                {dateFormatter(r.FechaRecepcion)}
              </span>
              <span>{r.NombreProveedor}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function InventarioRodelas({ usuario }) {
  const [tipos, setTipos] = useState([]);
  const [loadingTipos, setLoadingTipos] = useState(true);
  const [errorTipos, setErrorTipos] = useState("");

  const [sel, setSel] = useState(null);
  const [rodelasSel, setRodelasSel] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState("");
  const [busquedaCodigo, setBusquedaCodigo] = useState("");

  const [marcadas, setMarcadas] = useState([]);
  const [enviando, setEnviando] = useState(false);

  const [descargandoInventario, setDescargandoInventario] = useState(false);

  const [dialogEditar, setDialogEditar] = useState({ open: false, rodela: null });
  const [formCodigo, setFormCodigo] = useState("");
  const [formMotivo, setFormMotivo] = useState("");
  const [errorEditar, setErrorEditar] = useState("");
  const [guardandoEditar, setGuardandoEditar] = useState(false);

  const esEncargado = usuario?.IdRol === Roles.Encargado;

  const requeridas = 1;

  const descargarInventarioCompleto = async () => {
    setDescargandoInventario(true);
    try {
      await descargarReporteInventarioRodela(null);
      toast.success("Informe de inventario descargado");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDescargandoInventario(false);
    }
  };

  useEffect(() => {
    cargarResumen();
  }, []);

  const cargarResumen = async () => {
    setLoadingTipos(true);
    setErrorTipos("");
    try {
      const data = await verResumenInventarioRodela();
      const conMeta = data.map((t, i) => ({
        ...t,
        ...ACENTOS[i % ACENTOS.length],
        badge:
          t.CantidadEnAlmacen === 0
            ? "Sin stock"
            : t.CantidadEnAlmacen < 6
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

  const cargarDetalle = async (idTipoRodela) => {
    setLoadingDetalle(true);
    setErrorDetalle("");
    try {
      const data = await verDetalleInventarioRodela(idTipoRodela);
      setRodelasSel(data.filter((r) => r.TipoEstado === ESTADO_ALMACEN));
    } catch (e) {
      setErrorDetalle(e.message);
      setRodelasSel([]);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const tipoSel = sel ? tipos.find((t) => t.IdTipoRodela === sel) : null;

  const totalEnAlmacen = tipos.reduce((s, t) => s + Number(t.CantidadEnAlmacen || 0), 0);
  const listas = marcadas.length === requeridas;

  const rodelasFiltradas = busquedaCodigo.trim()
    ? rodelasSel.filter((r) =>
        r.CodigoRodela.toLowerCase().includes(busquedaCodigo.trim().toLowerCase()),
      )
    : rodelasSel;

  const seleccionarTipo = (id) => {
    if (sel === id) {
      cerrarDetalle();
      return;
    }
    setSel(id);
    setMarcadas([]);
    setBusquedaCodigo("");
    cargarDetalle(id);
  };

  const cerrarDetalle = () => {
    setSel(null);
    setRodelasSel([]);
    setMarcadas([]);
    setBusquedaCodigo("");
  };

  const toggleRodela = (codigo) => {
    setMarcadas((prev) => (prev.includes(codigo) ? [] : [codigo]));
  };

  const quitarChip = (codigo) =>
    setMarcadas((prev) => prev.filter((c) => c !== codigo));

  const refrescar = () => {
    cargarResumen();
    if (sel) cargarDetalle(sel);
  };

  const enviarProduccion = async () => {
    if (!listas) return;

    const rodela = rodelasSel.find((r) => r.CodigoRodela === marcadas[0]);
    if (!rodela) return;

    setEnviando(true);
    try {
      await trasladarRodelaAProduccion(rodela.IdRodela);
      toast.success(`${rodela.CodigoRodela} → Abierta en producción`);
      setMarcadas([]);
      refrescar();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setEnviando(false);
    }
  };

  const codigoLimpio = formCodigo.trim();
  const motivoLimpio = formMotivo.trim();
  const codigoCambio =
    !!dialogEditar.rodela && codigoLimpio !== "" && codigoLimpio !== dialogEditar.rodela.CodigoRodela;
  const motivoValido =
    motivoLimpio.length >= OBSERVACION_RODELA_MIN &&
    motivoLimpio.length <= OBSERVACION_RODELA_MAX;

  const abrirEditar = (rodela) => {
    setFormCodigo(rodela.CodigoRodela);
    setFormMotivo("");
    setErrorEditar("");
    setDialogEditar({ open: true, rodela });
  };

  const confirmarEditar = async () => {
    const rodela = dialogEditar.rodela;
    if (!rodela || !codigoCambio || !motivoValido) return;

    setGuardandoEditar(true);
    setErrorEditar("");
    try {
      const res = await editarRodela(rodela.IdRodela, codigoLimpio, motivoLimpio);
      toast.success(`${res.CodigoAnterior} → ${res.CodigoRodela} actualizada`);
      setDialogEditar({ open: false, rodela: null });
      setMarcadas((prev) => prev.filter((c) => c !== res.CodigoAnterior));
      refrescar();
    } catch (e) {
      setErrorEditar(extraerMensajeError(e, e.message));
    } finally {
      setGuardandoEditar(false);
    }
  };

  return (
    <TooltipProvider>
    <div className="contenido-con-sidebar pt-20 md:pt-0 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      <Header
        titulo="Almacén · Materia Prima"
        subtitulo="Inventario de Rodelas"
        accion={
          usuario?.IdRol === Roles.Encargado
            ? {
                texto: "Registrar ingreso",
                icono: Plus,
                href: "/encargado/rodela/ingreso",
              }
            : null
        }
      >
        {usuario?.IdRol === Roles.Encargado && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  onClick={descargarInventarioCompleto}
                  disabled={descargandoInventario}
                  className="h-11 gap-2 bg-white font-bold text-c3 shadow-md hover:bg-slate-100"
                >
                  {descargandoInventario ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Download size={16} strokeWidth={2.75} />
                  )}
                  Descargar inventario
                </Button>
              }
            />
            <TooltipContent>
              PDF con el inventario completo de todos los tipos de rodela
            </TooltipContent>
          </Tooltip>
        )}
      </Header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div className="text-sm font-bold text-slate-700">
            Catálogo por tipo de rodela
          </div>
          <div className="text-sm text-slate-500">
            {totalEnAlmacen} rodelas <strong className="text-slate-700">en almacén</strong>
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

        {!loadingTipos && !errorTipos && tipos.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-400 ring-1 ring-slate-200">
            No hay tipos de rodela registrados.
          </div>
        )}

        {!loadingTipos && !errorTipos && tipos.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tipos.map((t) => (
              <TarjetaTipo
                key={t.IdTipoRodela}
                tipo={t}
                activo={sel === t.IdTipoRodela}
                onClick={() => seleccionarTipo(t.IdTipoRodela)}
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
                <Disc className={cn("h-7 w-7 shrink-0", tipoSel.text)} strokeWidth={2} />
                <div className={cn("text-base font-extrabold", tipoSel.text)}>
                  Rodelas · {tipoSel.NombreTipoRodela}
                </div>
                <div className="text-sm font-semibold text-slate-500">
                  {tipoSel.CantidadEnAlmacen} en almacén · {tipoSel.CantidadAbiertas} abiertas
                </div>
                <Badge
                  variant="outline"
                  className={cn("border font-bold", tipoSel.text, tipoSel.border)}
                >
                  Se traslada 1 rodela
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

            {!loadingDetalle && !errorDetalle && rodelasSel.length > 0 && (
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
            {!loadingDetalle && !errorDetalle && rodelasSel.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-400">
                No hay rodelas en almacén para este tipo.
              </div>
            )}
            {!loadingDetalle &&
              !errorDetalle &&
              rodelasSel.length > 0 &&
              rodelasFiltradas.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-400">
                  Ninguna rodela coincide con "{busquedaCodigo}".
                </div>
              )}

            {!loadingDetalle && !errorDetalle && rodelasFiltradas.length > 0 && (
              <>
                <div className="hidden md:block">
                  <TablaRodelas
                    rodelas={rodelasFiltradas}
                    tipoSel={tipoSel}
                    marcadas={marcadas}
                    onToggle={toggleRodela}
                    onEditar={esEncargado ? abrirEditar : null}
                  />
                </div>
                <div className="md:hidden">
                  <ListaMovilRodelas
                    rodelas={rodelasFiltradas}
                    tipoSel={tipoSel}
                    marcadas={marcadas}
                    onToggle={toggleRodela}
                    onEditar={esEncargado ? abrirEditar : null}
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
                    {listas ? "Listo para trasladar" : `Selecciona ${requeridas - marcadas.length} más`}
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

      <Dialog
        open={dialogEditar.open}
        onOpenChange={(open) =>
          setDialogEditar({ open, rodela: open ? dialogEditar.rodela : null })
        }
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar rodela</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {dialogEditar.rodela && (
              <div className="flex flex-col gap-1 rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Código actual
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {dialogEditar.rodela.CodigoRodela}
                </span>
                <span className="text-[12px] text-slate-500">
                  {dialogEditar.rodela.CodigoLote} · {dialogEditar.rodela.NombreProveedor}
                </span>
              </div>
            )}

            <InputForModal
              id="codigo-rodela-editar"
              etiqueta="Nuevo código"
              valor={formCodigo}
              onCambio={(valor) => setFormCodigo(aCodigo(valor))}
              classNameInput="font-mono font-bold"
              autoComplete="off"
            />

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="motivo-editar-rodela"
                className="text-xs font-bold uppercase tracking-wide text-slate-600"
              >
                Motivo de la corrección
              </Label>
              <Textarea
                id="motivo-editar-rodela"
                value={formMotivo}
                onChange={(e) => setFormMotivo(e.target.value)}
                placeholder="Ej. Error de digitación al registrar el ingreso..."
                className="min-h-20"
                maxLength={OBSERVACION_RODELA_MAX}
              />
              <span className="text-xs text-slate-500">
                {motivoLimpio.length}/{OBSERVACION_RODELA_MAX} · mínimo{" "}
                {OBSERVACION_RODELA_MIN} caracteres
              </span>
            </div>

            {errorEditar && (
              <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600">
                {errorEditar}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={confirmarEditar}
              disabled={guardandoEditar || !codigoCambio || !motivoValido}
              className="h-11 w-full gap-2 bg-gradient-to-r from-c3 to-c4 font-extrabold text-white hover:opacity-90 sm:w-auto"
            >
              {guardandoEditar ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Pencil size={16} strokeWidth={2.75} />
                  Guardar cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
}
