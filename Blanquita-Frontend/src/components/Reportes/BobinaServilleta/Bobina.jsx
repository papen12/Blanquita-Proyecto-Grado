import { useEffect, useState } from "react";
import {
  Search,
  Download,
  FileDown,
  Loader2,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { SelectEntidad } from "@/components/layout/Selectentidad";
import {
  verBobinasServilletaReporte,
  descargarReporteInventarioBobinaServilleta,
  descargarReporteDetalleBobinaServilleta,
} from "@/services/BobinaServilleta/Reportes";
import { ObtenerTiposBobinaServilleta } from "@/services/BobinaServilleta/BobinaServilleta";
import { ObtenerProveedoresForm } from "@/services/Proveedor/Proveedor";
import { EstadosMateriaPrima } from "@/constants/estados";

const TAMANO_PAGINA = 15;

const ESTADO_BADGE = {
  "En almacén": "border-emerald-300 bg-emerald-50 text-emerald-700",
  "En producción": "border-sky-300 bg-sky-50 text-sky-700",
  Agotado: "border-slate-300 bg-slate-100 text-slate-600",
  "Dado de baja": "border-red-300 bg-red-50 text-red-600",
  "Fuera de Inventario": "border-amber-300 bg-amber-50 text-amber-700",
  Abierta: "border-sky-300 bg-sky-50 text-sky-700",
  Terminada: "border-slate-300 bg-slate-100 text-slate-600",
};

const fmt = (n) =>
  n === null || n === undefined
    ? "-"
    : Number(n).toLocaleString("es-BO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

function UnidadCelda({ codigo, formato, peso, gramaje }) {
  if (!codigo) return <span className="text-slate-300">-</span>;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[13px] font-bold text-slate-900">{codigo}</span>
      <span className="text-[11.5px] text-slate-500">{formato}</span>
      <span className="text-[11.5px] text-slate-500">
        {fmt(peso)} kg · {fmt(gramaje)} gr
      </span>
    </div>
  );
}

export default function BobinaReporteServilleta() {
  const [tipos, setTipos] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  const [codigoInput, setCodigoInput] = useState("");
  const [codigoBobina, setCodigoBobina] = useState("");
  const [idProveedor, setIdProveedor] = useState("");
  const [idEstadoMateriaPrima, setIdEstadoMateriaPrima] = useState("");
  const [idTipoBobinaServilleta, setIdTipoBobinaServilleta] = useState("");
  const [pagina, setPagina] = useState(1);

  const [catalogo, setCatalogo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [descargandoInforme, setDescargandoInforme] = useState(false);
  const [descargandoId, setDescargandoId] = useState(null);

  useEffect(() => {
    const id = setTimeout(() => setCodigoBobina(codigoInput.trim()), 400);
    return () => clearTimeout(id);
  }, [codigoInput]);

  useEffect(() => {
    (async () => {
      try {
        const [dataTipos, dataProveedores] = await Promise.all([
          ObtenerTiposBobinaServilleta(),
          ObtenerProveedoresForm(),
        ]);
        setTipos(dataTipos);
        setProveedores(dataProveedores);
      } catch (e) {
        toast.error(e.message);
      }
    })();
  }, []);

  const cargarCatalogo = async () => {
    setCargando(true);
    setError("");
    try {
      const data = await verBobinasServilletaReporte({
        CodigoBobina: codigoBobina || null,
        IdProveedor: idProveedor || null,
        IdTipoBobinaServilleta: idTipoBobinaServilleta || null,
        IdEstadoMateriaPrima: idEstadoMateriaPrima || null,
        Pagina: pagina,
        TamanoPagina: TAMANO_PAGINA,
      });
      setCatalogo(data);
    } catch (e) {
      setError(e.message);
      setCatalogo(null);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCatalogo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigoBobina, idProveedor, idEstadoMateriaPrima, idTipoBobinaServilleta, pagina]);

  const limpiarFiltros = () => {
    setCodigoInput("");
    setCodigoBobina("");
    setIdProveedor("");
    setIdEstadoMateriaPrima("");
    setIdTipoBobinaServilleta("");
    setPagina(1);
  };

  const hayFiltros =
    codigoBobina || idProveedor || idEstadoMateriaPrima || idTipoBobinaServilleta;

  const descargarInforme = async () => {
    setDescargandoInforme(true);
    try {
      await descargarReporteInventarioBobinaServilleta(
        idTipoBobinaServilleta ? [idTipoBobinaServilleta] : null,
      );
      toast.success("Informe de inventario descargado");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDescargandoInforme(false);
    }
  };

  const verDetalle = async (idBobinaServilleta) => {
    setDescargandoId(idBobinaServilleta);
    try {
      await descargarReporteDetalleBobinaServilleta(idBobinaServilleta);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDescargandoId(null);
    }
  };

  const totalPaginas = catalogo
    ? Math.max(1, Math.ceil(catalogo.Total / catalogo.TamanoPagina))
    : 1;

  return (
    <>
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="text-base font-extrabold text-slate-900">Filtros</div>
          <div className="flex items-center gap-2">
            {hayFiltros && (
              <Button
                variant="ghost"
                onClick={limpiarFiltros}
                className="h-9 gap-1.5 font-bold text-slate-500 hover:text-slate-900"
              >
                <X size={14} strokeWidth={2.75} />
                Limpiar
              </Button>
            )}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    onClick={descargarInforme}
                    disabled={descargandoInforme}
                    className="h-9 gap-1.5 bg-gradient-to-r from-c3 to-c4 font-bold text-white hover:opacity-90"
                  >
                    {descargandoInforme ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Download size={15} strokeWidth={2.5} />
                    )}
                    Descargar informe
                  </Button>
                }
              />
              <TooltipContent>
                PDF con el resumen y detalle de las bobinas en almacén, según
                el tipo marcado abajo (todos si no marcás ninguno)
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Código de unidad
              </Label>
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                />
                <Input
                  value={codigoInput}
                  onChange={(e) => setCodigoInput(e.target.value)}
                  placeholder="Ej. BSERV-260903-01A"
                  className="h-11 pl-9 font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Proveedor
              </Label>
              <SelectEntidad
                opciones={proveedores}
                valor={idProveedor}
                onCambio={(v) => {
                  setIdProveedor(v);
                  setPagina(1);
                }}
                campoValor="IdProveedor"
                campoEtiqueta="NombreProveedor"
                placeholder="Todos los proveedores"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Estado
              </Label>
              <SelectEntidad
                opciones={EstadosMateriaPrima}
                valor={idEstadoMateriaPrima}
                onCambio={(v) => {
                  setIdEstadoMateriaPrima(v);
                  setPagina(1);
                }}
                campoValor="IdEstadoMateriaPrima"
                campoEtiqueta="TipoEstado"
                placeholder="Todos los estados"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Tipo de bobina
              </Label>
              <SelectEntidad
                opciones={tipos}
                valor={idTipoBobinaServilleta}
                onCambio={(v) => {
                  setIdTipoBobinaServilleta(v);
                  setPagina(1);
                }}
                campoValor="IdTipoBobinaServilleta"
                campoEtiqueta="NombreTipoBobinaServilleta"
                placeholder="Todos los tipos"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {cargando && (
          <div className="flex flex-col gap-2 p-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        )}

        {!cargando && error && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-6 text-sm font-semibold text-red-600">
            {error}
            <Button
              variant="outline"
              onClick={cargarCatalogo}
              className="h-9 gap-1.5 border-red-300 font-bold text-red-600 hover:bg-red-50"
            >
              <RefreshCcw size={14} strokeWidth={2.5} />
              Reintentar
            </Button>
          </div>
        )}

        {!cargando && !error && catalogo && catalogo.Bobinas.length === 0 && (
          <div className="p-10 text-center text-sm text-slate-400">
            No hay bobinas que coincidan con los filtros seleccionados.
          </div>
        )}

        {!cargando && !error && catalogo && catalogo.Bobinas.length > 0 && (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lote</TableHead>
                    <TableHead>Recepción</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Unidad 1</TableHead>
                    <TableHead>Unidad 2</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {catalogo.Bobinas.map((b) => (
                    <TableRow key={b.IdBobinaServilleta}>
                      <TableCell className="font-mono text-slate-700">
                        {b.CodigoLote}
                      </TableCell>
                      <TableCell>{b.FechaRecepcion}</TableCell>
                      <TableCell>{b.NombreProveedor}</TableCell>
                      <TableCell>{b.NombreTipoBobinaServilleta}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-bold",
                            ESTADO_BADGE[b.TipoEstado] ??
                              "border-slate-300 bg-slate-100 text-slate-600",
                          )}
                        >
                          {b.TipoEstado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <UnidadCelda
                          codigo={b.CodigoUnidad1}
                          formato={b.DescripcionFormato1}
                          peso={b.PesoBrutoKg1}
                          gramaje={b.GramajeGr1}
                        />
                      </TableCell>
                      <TableCell>
                        <UnidadCelda
                          codigo={b.CodigoUnidad2}
                          formato={b.DescripcionFormato2}
                          peso={b.PesoBrutoKg2}
                          gramaje={b.GramajeGr2}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={descargandoId === b.IdBobinaServilleta}
                                onClick={() => verDetalle(b.IdBobinaServilleta)}
                                className="h-9 w-9 text-slate-400 hover:bg-c4/10 hover:text-c3"
                              >
                                {descargandoId === b.IdBobinaServilleta ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <FileDown size={16} strokeWidth={2.25} />
                                )}
                              </Button>
                            }
                          />
                          <TooltipContent>
                            Descargar detalle de esta bobina (unidades y movimientos)
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 p-4 md:hidden">
              {catalogo.Bobinas.map((b) => (
                <div
                  key={b.IdBobinaServilleta}
                  className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-[13px] font-bold text-slate-900">
                        Lote {b.CodigoLote}
                      </span>
                      <span className="text-[12.5px] text-slate-500">
                        {b.NombreTipoBobinaServilleta} · {b.NombreProveedor}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 font-bold",
                        ESTADO_BADGE[b.TipoEstado] ??
                          "border-slate-300 bg-slate-100 text-slate-600",
                      )}
                    >
                      {b.TipoEstado}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-2.5">
                    <UnidadCelda
                      codigo={b.CodigoUnidad1}
                      formato={b.DescripcionFormato1}
                      peso={b.PesoBrutoKg1}
                      gramaje={b.GramajeGr1}
                    />
                    <UnidadCelda
                      codigo={b.CodigoUnidad2}
                      formato={b.DescripcionFormato2}
                      peso={b.PesoBrutoKg2}
                      gramaje={b.GramajeGr2}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-2.5">
                    <span className="text-[12.5px] text-slate-500">
                      Recepción {b.FechaRecepcion}
                    </span>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={descargandoId === b.IdBobinaServilleta}
                            onClick={() => verDetalle(b.IdBobinaServilleta)}
                            className="h-9 w-9 shrink-0 text-slate-400 hover:bg-c4/10 hover:text-c3"
                          >
                            {descargandoId === b.IdBobinaServilleta ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <FileDown size={16} strokeWidth={2.25} />
                            )}
                          </Button>
                        }
                      />
                      <TooltipContent>
                        Descargar detalle de esta bobina
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5">
              <span className="text-[12.5px] font-semibold text-slate-500">
                Página {catalogo.Pagina} de {totalPaginas} · {catalogo.Total}{" "}
                {catalogo.Total === 1 ? "bobina" : "bobinas"}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={pagina <= 1}
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  className="h-9 w-9"
                >
                  <ChevronLeft size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={pagina >= totalPaginas}
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  className="h-9 w-9"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}
