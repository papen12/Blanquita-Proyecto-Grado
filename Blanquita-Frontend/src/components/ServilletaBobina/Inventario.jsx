import { useState, useEffect } from "react";
import {
  Plus,
  X,
  ArrowRight,
  Loader2,
  Search,
  RotateCcw,
  Ban,
  Database,
  Disc,
  PackageX,
  Check,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  verResumenInventarioBobinaServilleta,
  verDetalleInventarioBobinaServilleta,
  verResumenInventarioSubBobinaServilleta,
  verDetalleInventarioSubBobinaServilleta,
  verSubBobinasServilletaFueraInventario,
  reingresarSubBobinaInventario,
  darDeBajaSubBobina,
} from "../../services/BobinaServilleta/Inventario";
import {
  abrirBobinaServilleta,
  iniciarProduccionServilleta,
} from "../../services/BobinaServilleta/Produccion";
import { descargarReporteInventarioCompletoServilleta } from "../../services/BobinaServilleta/Reportes";
import { dateFormatter } from "@/utils/dates";
import Header from "@/components/layout/Header";
import { Roles } from "@/constants/Values";

const ACENTOS = [
  { text: "text-c3", bg: "bg-c4", soft: "bg-c4/8", border: "border-c4/30", ring: "ring-c4/40" },
  { text: "text-serv3", bg: "bg-serv3", soft: "bg-serv3/8", border: "border-serv3/30", ring: "ring-serv3/40" },
  { text: "text-lux2", bg: "bg-lux1", soft: "bg-lux1/8", border: "border-lux1/30", ring: "ring-lux1/40" },
  { text: "text-eco2", bg: "bg-eco1", soft: "bg-eco1/8", border: "border-eco1/30", ring: "ring-eco1/40" },
];

const etiquetaBobinas = (n) => {
  const c = Number(n || 0);
  return `${c} ${c === 1 ? "bobina" : "bobinas"}`;
};

const etiquetaSubBobinas = (n) => {
  const c = Number(n || 0);
  return `${c} ${c === 1 ? "sub-bobina" : "sub-bobinas"}`;
};

function TarjetaTipoBobina({ tipo: t, activo, onClick }) {
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
          <Database className={cn("h-8 w-8 shrink-0", t.text)} strokeWidth={2} />
          <div className="text-[17px] font-extrabold text-slate-900">
            {t.NombreTipoBobinaServilleta}
          </div>
        </div>
        <Badge variant="outline" className={cn("border-0 font-bold", t.soft, t.text)}>
          {t.badge}
        </Badge>
      </div>

      <div className="flex items-baseline gap-1.5">
        <div className={cn("text-4xl font-extrabold tabular-nums", t.text)}>
          {t.CantidadBobinaServilleta}
        </div>
        <div className="text-sm font-semibold text-slate-500">bobinas en almacén</div>
      </div>

      <div className={cn("flex items-center justify-end gap-1.5 text-xs font-bold", t.text)}>
        Ver bobinas
        <ArrowRight size={14} strokeWidth={2.75} />
      </div>
    </button>
  );
}

function TarjetaTipoSubBobina({ tipo: t, activo, onClick }) {
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
          <Disc className={cn("h-7 w-7 shrink-0", t.text)} strokeWidth={2} />
          <div className="text-[17px] font-extrabold text-slate-900">
            {t.NombreTipoMedida}
          </div>
        </div>
        <Badge variant="outline" className={cn("border-0 font-bold", t.soft, t.text)}>
          Sub-bobina
        </Badge>
      </div>

      <div className="flex items-baseline gap-1.5">
        <div className={cn("text-4xl font-extrabold tabular-nums", t.text)}>
          {t.CantidadSubBobinas}
        </div>
        <div className="text-sm font-semibold text-slate-500">sub-bobinas en almacén</div>
      </div>

      <div className={cn("flex items-center justify-end gap-1.5 text-xs font-bold", t.text)}>
        Ver sub-bobinas
        <ArrowRight size={14} strokeWidth={2.75} />
      </div>
    </button>
  );
}

function TarjetaFuera({ cantidad, activo, onClick }) {
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
          sub-bobinas dadas de baja o retiradas
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
        {activo ? "Ocultar lista" : "Ver sub-bobinas"}
        <ArrowRight size={14} strokeWidth={2.75} />
      </div>
    </button>
  );
}

function TablaBobinas({ bobinas, tipoSel, procesandoId, onAbrir }) {
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[760px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-5">Bobina</TableHead>
            <TableHead>Recepción</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead>Unidad 1</TableHead>
            <TableHead>Unidad 2</TableHead>
            <TableHead className="pr-5 text-right">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bobinas.map((b) => (
            <TableRow key={b.IdBobinaServilleta}>
              <TableCell className={cn("pl-5 font-mono font-bold", tipoSel.text)}>
                #{b.IdBobinaServilleta}
              </TableCell>
              <TableCell className="text-slate-600">
                {dateFormatter(b.FechaRecepcion)}
              </TableCell>
              <TableCell className="text-slate-600">{b.NombreProveedor}</TableCell>
              <TableCell className="text-slate-600">
                <span className="font-mono font-semibold text-slate-900">
                  {b.CodigoUnidad1}
                </span>
                <span className="block text-[11px] text-slate-400">
                  {b.DescripcionFormato1}
                </span>
              </TableCell>
              <TableCell className="text-slate-600">
                <span className="font-mono font-semibold text-slate-900">
                  {b.CodigoUnidad2}
                </span>
                <span className="block text-[11px] text-slate-400">
                  {b.DescripcionFormato2}
                </span>
              </TableCell>
              <TableCell className="pr-5 text-right">
                <Button
                  size="sm"
                  disabled={procesandoId === b.IdBobinaServilleta}
                  onClick={() => onAbrir(b)}
                  className="gap-1.5 bg-gradient-to-r from-c3 to-c4 font-bold text-white hover:opacity-90"
                >
                  {procesandoId === b.IdBobinaServilleta ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    "Abrir"
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ListaMovilBobinas({ bobinas, tipoSel, procesandoId, onAbrir }) {
  return (
    <div className="flex flex-col gap-2.5 p-3.5">
      {bobinas.map((b) => (
        <div
          key={b.IdBobinaServilleta}
          className="flex flex-col gap-2.5 rounded-2xl border-2 border-slate-200 bg-white p-3.5"
        >
          <div className="flex items-center justify-between gap-2.5">
            <div className={cn("font-mono text-[15px] font-extrabold", tipoSel.text)}>
              #{b.IdBobinaServilleta}
            </div>
            <span className="text-[12px] text-slate-500">
              {dateFormatter(b.FechaRecepcion)}
            </span>
          </div>
          <div className="text-[12.5px] text-slate-600">{b.NombreProveedor}</div>
          <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[12.5px] text-slate-600">
            <span>
              <strong className="font-mono text-slate-900">{b.CodigoUnidad1}</strong> ·{" "}
              {b.DescripcionFormato1}
            </span>
            <span>
              <strong className="font-mono text-slate-900">{b.CodigoUnidad2}</strong> ·{" "}
              {b.DescripcionFormato2}
            </span>
          </div>
          <Button
            size="sm"
            disabled={procesandoId === b.IdBobinaServilleta}
            onClick={() => onAbrir(b)}
            className="gap-1.5 bg-gradient-to-r from-c3 to-c4 font-bold text-white hover:opacity-90"
          >
            {procesandoId === b.IdBobinaServilleta ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              "Abrir bobina"
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}

function TablaSubBobinas({ subBobinas, tipoSel, marcada, onToggle }) {
  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[460px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-11 pl-5" />
            <TableHead>Sub-bobina</TableHead>
            <TableHead className="pr-5">Unidad de origen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subBobinas.map((s) => {
            const on = marcada === s.IdSubBobinaServilleta;
            return (
              <TableRow
                key={s.IdSubBobinaServilleta}
                className={cn(on && tipoSel.soft)}
              >
                <TableCell className="pl-5">
                  <button
                    onClick={() => onToggle(s.IdSubBobinaServilleta)}
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
                  #{s.IdSubBobinaServilleta}
                </TableCell>
                <TableCell className="pr-5 font-mono text-slate-700">
                  {s.CodigoUnidadOrigen}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function ListaMovilSubBobinas({ subBobinas, tipoSel, marcada, onToggle }) {
  return (
    <div className="flex flex-col gap-2.5 p-3.5">
      {subBobinas.map((s) => {
        const on = marcada === s.IdSubBobinaServilleta;
        return (
          <button
            key={s.IdSubBobinaServilleta}
            onClick={() => onToggle(s.IdSubBobinaServilleta)}
            className={cn(
              "flex items-center justify-between gap-2.5 rounded-2xl border-2 p-3.5 text-left",
              on ? cn(tipoSel.soft, tipoSel.border) : "border-slate-200 bg-white",
            )}
          >
            <div>
              <div className={cn("font-mono text-[15px] font-extrabold", tipoSel.text)}>
                #{s.IdSubBobinaServilleta}
              </div>
              <div className="font-mono text-[12.5px] text-slate-600">
                {s.CodigoUnidadOrigen}
              </div>
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
          </button>
        );
      })}
    </div>
  );
}

export default function InventarioBobinaServilleta({ usuario }) {
  const [tiposBobina, setTiposBobina] = useState([]);
  const [tiposSub, setTiposSub] = useState([]);
  const [loadingResumen, setLoadingResumen] = useState(true);
  const [errorResumen, setErrorResumen] = useState("");

  // seleccion: { clase: "bobina" | "sub", id }
  const [sel, setSel] = useState(null);
  const [detalle, setDetalle] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const [procesandoId, setProcesandoId] = useState(null);

  // traslado de UNA sub-bobina a produccion
  const [marcadaSub, setMarcadaSub] = useState(null);
  const [enviandoTraslado, setEnviandoTraslado] = useState(false);

  const [mostrarFuera, setMostrarFuera] = useState(false);
  const [fuera, setFuera] = useState([]);
  const [loadingFuera, setLoadingFuera] = useState(false);
  const [errorFuera, setErrorFuera] = useState("");
  const [procesandoFueraId, setProcesandoFueraId] = useState(null);

  const [dialogAbrir, setDialogAbrir] = useState({ open: false, bobina: null });
  const [obsAbrir, setObsAbrir] = useState("");
  const [enviandoAbrir, setEnviandoAbrir] = useState(false);

  const [dialogBaja, setDialogBaja] = useState({ open: false, sub: null });
  const [motivoBaja, setMotivoBaja] = useState("");
  const [enviandoBaja, setEnviandoBaja] = useState(false);

  const [descargandoInventario, setDescargandoInventario] = useState(false);

  const descargarInventarioCompleto = async () => {
    setDescargandoInventario(true);
    try {
      await descargarReporteInventarioCompletoServilleta();
      toast.success("Informe de inventario descargado");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDescargandoInventario(false);
    }
  };

  useEffect(() => {
    cargarResumen();
    cargarFuera();
  }, []);

  const cargarResumen = async () => {
    setLoadingResumen(true);
    setErrorResumen("");
    try {
      const [bobinas, subs] = await Promise.all([
        verResumenInventarioBobinaServilleta(),
        verResumenInventarioSubBobinaServilleta(),
      ]);
      setTiposBobina(
        bobinas.map((t, i) => ({
          ...t,
          ...ACENTOS[i % ACENTOS.length],
          badge:
            t.CantidadBobinaServilleta === 0
              ? "Sin stock"
              : t.CantidadBobinaServilleta < 4
                ? "Stock bajo"
                : "Disponible",
        })),
      );
      setTiposSub(
        subs.map((t, i) => ({
          ...t,
          ...ACENTOS[(i + 2) % ACENTOS.length],
        })),
      );
    } catch (e) {
      setErrorResumen(e.message);
    } finally {
      setLoadingResumen(false);
    }
  };

  const cargarDetalle = async (clase, id) => {
    setLoadingDetalle(true);
    setErrorDetalle("");
    try {
      const data =
        clase === "bobina"
          ? await verDetalleInventarioBobinaServilleta(id)
          : await verDetalleInventarioSubBobinaServilleta(id);
      setDetalle(data);
    } catch (e) {
      setErrorDetalle(e.message);
      setDetalle([]);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const cargarFuera = async () => {
    setLoadingFuera(true);
    setErrorFuera("");
    try {
      const data = await verSubBobinasServilletaFueraInventario();
      setFuera(data);
    } catch (e) {
      setErrorFuera(e.message);
      setFuera([]);
    } finally {
      setLoadingFuera(false);
    }
  };

  const tipoSel =
    sel?.clase === "bobina"
      ? tiposBobina.find((t) => t.IdTipoBobinaServilleta === sel.id)
      : sel?.clase === "sub"
        ? tiposSub.find((t) => t.IdTipoMedidaSubBobina === sel.id)
        : null;

  const totalBobinas = tiposBobina.reduce(
    (s, t) => s + Number(t.CantidadBobinaServilleta || 0),
    0,
  );
  const totalSub = tiposSub.reduce(
    (s, t) => s + Number(t.CantidadSubBobinas || 0),
    0,
  );

  const detalleFiltrado = (() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return detalle;
    if (sel?.clase === "bobina") {
      return detalle.filter(
        (b) =>
          String(b.IdBobinaServilleta).includes(q) ||
          (b.CodigoUnidad1 || "").toLowerCase().includes(q) ||
          (b.CodigoUnidad2 || "").toLowerCase().includes(q) ||
          (b.NombreProveedor || "").toLowerCase().includes(q),
      );
    }
    return detalle.filter(
      (s) =>
        String(s.IdSubBobinaServilleta).includes(q) ||
        (s.CodigoUnidadOrigen || "").toLowerCase().includes(q),
    );
  })();

  const seleccionar = (clase, id) => {
    if (sel && sel.clase === clase && sel.id === id) {
      cerrarDetalle();
      return;
    }
    setSel({ clase, id });
    setBusqueda("");
    setDetalle([]);
    setMarcadaSub(null);
    cargarDetalle(clase, id);
  };

  const cerrarDetalle = () => {
    setSel(null);
    setDetalle([]);
    setBusqueda("");
    setMarcadaSub(null);
  };

  const toggleSub = (id) =>
    setMarcadaSub((prev) => (prev === id ? null : id));

  const enviarTraslado = async () => {
    if (marcadaSub == null) return;
    const sub = detalle.find((s) => s.IdSubBobinaServilleta === marcadaSub);
    if (!sub) return;

    setEnviandoTraslado(true);
    try {
      await iniciarProduccionServilleta(sub.IdSubBobinaServilleta);
      toast.success(`Sub-bobina #${sub.IdSubBobinaServilleta} → En producción`);
      setMarcadaSub(null);
      refrescar();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setEnviandoTraslado(false);
    }
  };

  const refrescar = () => {
    cargarResumen();
    cargarFuera();
    if (sel) cargarDetalle(sel.clase, sel.id);
  };

  const abrirDialogAbrir = (bobina) => {
    setObsAbrir("");
    setDialogAbrir({ open: true, bobina });
  };

  const confirmarAbrir = async () => {
    const bobina = dialogAbrir.bobina;
    if (!bobina) return;

    setEnviandoAbrir(true);
    setProcesandoId(bobina.IdBobinaServilleta);
    try {
      const res = await abrirBobinaServilleta(
        bobina.IdBobinaServilleta,
        obsAbrir.trim() || null,
      );
      toast.success(
        `Bobina #${bobina.IdBobinaServilleta} abierta · ${res.CantidadSubBobinasTotal} sub-bobinas ` +
          `(${res.CantidadSubBobinas435} de 435 · ${res.CantidadSubBobinas220} de 220)`,
      );
      setDialogAbrir({ open: false, bobina: null });
      refrescar();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setEnviandoAbrir(false);
      setProcesandoId(null);
    }
  };

  const handleReingresar = async (sub) => {
    setProcesandoFueraId(sub.IdSubBobinaServilleta);
    try {
      await reingresarSubBobinaInventario(sub.IdSubBobinaServilleta);
      toast.success(`Sub-bobina #${sub.IdSubBobinaServilleta} reingresada al inventario`);
      setFuera((prev) =>
        prev.filter((s) => s.IdSubBobinaServilleta !== sub.IdSubBobinaServilleta),
      );
      cargarResumen();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setProcesandoFueraId(null);
    }
  };

  const abrirDialogBaja = (sub) => {
    setMotivoBaja("");
    setDialogBaja({ open: true, sub });
  };

  const confirmarBaja = async () => {
    const sub = dialogBaja.sub;
    if (!sub) return;
    if (!motivoBaja.trim()) {
      toast.error("La observación (motivo de la baja) es obligatoria");
      return;
    }

    setEnviandoBaja(true);
    setProcesandoFueraId(sub.IdSubBobinaServilleta);
    try {
      await darDeBajaSubBobina(sub.IdSubBobinaServilleta, motivoBaja.trim());
      toast.success(`Sub-bobina #${sub.IdSubBobinaServilleta} dada de baja`);
      setDialogBaja({ open: false, sub: null });
      setFuera((prev) =>
        prev.filter((s) => s.IdSubBobinaServilleta !== sub.IdSubBobinaServilleta),
      );
    } catch (e) {
      toast.error(e.message);
    } finally {
      setEnviandoBaja(false);
      setProcesandoFueraId(null);
    }
  };

  return (
    <TooltipProvider>
    <div className="contenido-con-sidebar pt-20 md:pt-0 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      <Header
        titulo="Almacén · Materia Prima"
        subtitulo="Inventario de Bobinas de Servilleta"
        accion={
          usuario?.IdRol === Roles.Encargado
            ? {
                texto: "Registrar ingreso",
                icono: Plus,
                href: "/encargado/bobina-servilleta/ingreso",
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
              PDF con la cantidad de bobinas de servilleta en almacén (y sus
              unidades) más todas las sub-bobinas en inventario
            </TooltipContent>
          </Tooltip>
        )}
      </Header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div className="text-sm font-bold text-slate-700">Catálogo de almacén</div>
          <div className="text-sm text-slate-500">
            {etiquetaBobinas(totalBobinas)} · {etiquetaSubBobinas(totalSub)}
          </div>
        </div>

        {loadingResumen && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        )}
        {errorResumen && (
          <div className="rounded-xl bg-red-50 p-5 text-center text-sm font-semibold text-red-600">
            {errorResumen}
          </div>
        )}

        {!loadingResumen && !errorResumen && (
          <div className="flex flex-col gap-6">
            <section>
              <div className="mb-2.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                Bobinas sin abrir
              </div>
              {tiposBobina.length === 0 ? (
                <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-400 ring-1 ring-slate-200">
                  No hay bobinas de servilleta en almacén.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {tiposBobina.map((t) => (
                    <TarjetaTipoBobina
                      key={t.IdTipoBobinaServilleta}
                      tipo={t}
                      activo={sel?.clase === "bobina" && sel.id === t.IdTipoBobinaServilleta}
                      onClick={() => seleccionar("bobina", t.IdTipoBobinaServilleta)}
                    />
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-2.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                Sub-bobinas por medida
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tiposSub.map((t) => (
                  <TarjetaTipoSubBobina
                    key={t.IdTipoMedidaSubBobina}
                    tipo={t}
                    activo={sel?.clase === "sub" && sel.id === t.IdTipoMedidaSubBobina}
                    onClick={() => seleccionar("sub", t.IdTipoMedidaSubBobina)}
                  />
                ))}
                <TarjetaFuera
                  cantidad={fuera.length}
                  activo={mostrarFuera}
                  onClick={() => setMostrarFuera((v) => !v)}
                />
              </div>
            </section>
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
                {sel.clase === "bobina" ? (
                  <Database className={cn("h-7 w-7 shrink-0", tipoSel.text)} strokeWidth={2} />
                ) : (
                  <Disc className={cn("h-6 w-6 shrink-0", tipoSel.text)} strokeWidth={2} />
                )}
                <div className={cn("text-base font-extrabold", tipoSel.text)}>
                  {sel.clase === "bobina"
                    ? `Bobinas · ${tipoSel.NombreTipoBobinaServilleta}`
                    : `Sub-bobinas · ${tipoSel.NombreTipoMedida}`}
                </div>
                <div className="text-sm font-semibold text-slate-500">
                  {sel.clase === "bobina"
                    ? `${tipoSel.CantidadBobinaServilleta} en almacén`
                    : `${tipoSel.CantidadSubBobinas} en almacén`}
                </div>
                {sel.clase === "sub" && (
                  <Badge
                    variant="outline"
                    className={cn("border font-bold", tipoSel.text, tipoSel.border)}
                  >
                    Se traslada 1 sub-bobina
                  </Badge>
                )}
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

            {!loadingDetalle && !errorDetalle && detalle.length > 0 && (
              <div className="border-b border-slate-100 px-5 py-3.5">
                <div className="relative max-w-xs">
                  <Search
                    size={16}
                    strokeWidth={2.5}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar..."
                    className="h-10 pl-9"
                  />
                  {busqueda && (
                    <button
                      onClick={() => setBusqueda("")}
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
            {!loadingDetalle && !errorDetalle && detalle.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-400">
                {sel.clase === "bobina"
                  ? "No hay bobinas en almacén para este tipo."
                  : "No hay sub-bobinas en almacén para esta medida."}
              </div>
            )}
            {!loadingDetalle &&
              !errorDetalle &&
              detalle.length > 0 &&
              detalleFiltrado.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-400">
                  Nada coincide con "{busqueda}".
                </div>
              )}

            {!loadingDetalle && !errorDetalle && detalleFiltrado.length > 0 && (
              sel.clase === "bobina" ? (
                <>
                  <div className="hidden md:block">
                    <TablaBobinas
                      bobinas={detalleFiltrado}
                      tipoSel={tipoSel}
                      procesandoId={procesandoId}
                      onAbrir={abrirDialogAbrir}
                    />
                  </div>
                  <div className="md:hidden">
                    <ListaMovilBobinas
                      bobinas={detalleFiltrado}
                      tipoSel={tipoSel}
                      procesandoId={procesandoId}
                      onAbrir={abrirDialogAbrir}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="hidden md:block">
                    <TablaSubBobinas
                      subBobinas={detalleFiltrado}
                      tipoSel={tipoSel}
                      marcada={marcadaSub}
                      onToggle={toggleSub}
                    />
                  </div>
                  <div className="md:hidden">
                    <ListaMovilSubBobinas
                      subBobinas={detalleFiltrado}
                      tipoSel={tipoSel}
                      marcada={marcadaSub}
                      onToggle={toggleSub}
                    />
                  </div>
                </>
              )
            )}

            {sel.clase === "sub" && marcadaSub != null && (
              <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 bg-slate-900 px-5 py-3.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 font-mono text-sm font-bold text-white">
                    #{marcadaSub}
                    <button
                      onClick={() => setMarcadaSub(null)}
                      className="opacity-70 hover:opacity-100"
                    >
                      <X size={13} strokeWidth={3} />
                    </button>
                  </div>
                  <div className="text-sm font-semibold text-slate-400">
                    Se traslada 1 sub-bobina
                  </div>
                </div>
                <Button
                  onClick={enviarTraslado}
                  disabled={enviandoTraslado}
                  className="h-11 gap-2 bg-gradient-to-r from-c3 to-c4 font-extrabold text-white hover:opacity-90"
                >
                  {enviandoTraslado ? (
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

        {mostrarFuera && (
          <div className="mt-7 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-amber-50 px-5 py-4">
              <div className="text-base font-extrabold text-amber-700">
                Sub-bobinas fuera de inventario
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
            {!loadingFuera && !errorFuera && fuera.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-400">
                No hay sub-bobinas fuera de inventario.
              </div>
            )}

            {!loadingFuera && !errorFuera && fuera.length > 0 && (
              <div className="flex flex-col gap-3 p-5">
                {fuera.map((s) => (
                  <div
                    key={s.IdSubBobinaServilleta}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[15px] font-extrabold text-slate-900">
                          #{s.IdSubBobinaServilleta}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-slate-300 font-bold text-slate-600"
                        >
                          {s.NombreTipoMedida}
                        </Badge>
                        <span className="font-mono text-[12.5px] text-slate-500">
                          {s.CodigoUnidadOrigen}
                        </span>
                      </div>
                      {s.UltimaObservacion && (
                        <div className="text-[12.5px] italic text-slate-500">
                          "{s.UltimaObservacion}"
                        </div>
                      )}
                      {s.FechaUltimoMovimiento && (
                        <div className="text-[11px] text-slate-400">
                          Último movimiento: {dateFormatter(s.FechaUltimoMovimiento)}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleReingresar(s)}
                        disabled={procesandoFueraId === s.IdSubBobinaServilleta}
                        className="h-10 gap-2 bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                      >
                        {procesandoFueraId === s.IdSubBobinaServilleta ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <>
                            <RotateCcw size={14} strokeWidth={2.75} />
                            Reingresar
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => abrirDialogBaja(s)}
                        disabled={procesandoFueraId === s.IdSubBobinaServilleta}
                        variant="outline"
                        className="h-10 gap-2 border-red-300 font-bold text-red-600 hover:bg-red-50"
                      >
                        <Ban size={14} strokeWidth={2.75} />
                        Baja
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Dialog
        open={dialogAbrir.open}
        onOpenChange={(open) =>
          setDialogAbrir({ open, bobina: open ? dialogAbrir.bobina : null })
        }
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Abrir bobina</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {dialogAbrir.bobina && (
              <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
                <span className="font-mono font-bold text-slate-900">
                  Bobina #{dialogAbrir.bobina.IdBobinaServilleta}
                </span>{" "}
                <span className="text-slate-500">
                  se dividirá en sub-bobinas y saldrá del stock de bobinas.
                </span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="obs-abrir"
                className="text-xs font-bold uppercase tracking-wide text-slate-600"
              >
                Observación (opcional)
              </Label>
              <Textarea
                id="obs-abrir"
                value={obsAbrir}
                onChange={(e) => setObsAbrir(e.target.value)}
                placeholder="Ej. Bobina con núcleo dañado..."
                className="min-h-20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={confirmarAbrir}
              disabled={enviandoAbrir}
              className="h-11 w-full gap-2 bg-gradient-to-r from-c3 to-c4 font-extrabold text-white hover:opacity-90 sm:w-auto"
            >
              {enviandoAbrir ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Abrir bobina"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialogBaja.open}
        onOpenChange={(open) =>
          setDialogBaja({ open, sub: open ? dialogBaja.sub : null })
        }
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Dar de baja</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            {dialogBaja.sub && (
              <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
                <span className="font-mono font-bold text-slate-900">
                  Sub-bobina #{dialogBaja.sub.IdSubBobinaServilleta}
                </span>{" "}
                <span className="text-slate-500">se retirará definitivamente</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="motivo-baja"
                className="text-xs font-bold uppercase tracking-wide text-slate-600"
              >
                Motivo de la baja (obligatorio)
              </Label>
              <Textarea
                id="motivo-baja"
                value={motivoBaja}
                onChange={(e) => setMotivoBaja(e.target.value)}
                placeholder="Ej. Sub-bobina contaminada / dañada..."
                className="min-h-20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={confirmarBaja}
              disabled={enviandoBaja || !motivoBaja.trim()}
              className="h-11 w-full gap-2 bg-red-600 font-extrabold text-white hover:bg-red-700 sm:w-auto"
            >
              {enviandoBaja ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                "Dar de baja"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
}
