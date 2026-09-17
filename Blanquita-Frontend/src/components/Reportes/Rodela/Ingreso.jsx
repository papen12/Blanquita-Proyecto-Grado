import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Download,
  FileText,
  Loader2,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { SelectEntidad } from "@/components/layout/Selectentidad";
import DoubleDatePicker from "@/components/layout/dates/DoubleDatePicker";
import {
  verLotesRodela,
  descargarReporteLoteRodelaDetalle,
  descargarReporteLotesRodelaPorPeriodo,
} from "@/services/Rodela/Reportes";
import { ObtenerTiposRodela } from "@/services/Rodela/Rodela";
import { ObtenerProveedoresForm } from "@/services/Proveedor/Proveedor";
import { dateOnlyFormatter } from "@/utils/dates";

const TAMANO_PAGINA = 15;

const aFechaISO = (fecha) => (fecha ? format(fecha, "yyyy-MM-dd") : null);

export default function IngresoReporteRodela() {
  const [tipos, setTipos] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  const [rangoFechas, setRangoFechas] = useState(undefined);
  const [idProveedor, setIdProveedor] = useState("");
  const [idsTipoRodela, setIdsTipoRodela] = useState([]);
  const [pagina, setPagina] = useState(1);

  const [catalogo, setCatalogo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [descargandoId, setDescargandoId] = useState(null);
  const [descargandoInforme, setDescargandoInforme] = useState(false);

  const [diasDestacados, setDiasDestacados] = useState(new Map());

  useEffect(() => {
    (async () => {
      try {
        const [dataTipos, dataProveedores] = await Promise.all([
          ObtenerTiposRodela(),
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
      const data = await verLotesRodela({
        FechaInicio: aFechaISO(rangoFechas?.from),
        FechaFin: aFechaISO(rangoFechas?.to),
        IdProveedor: idProveedor || null,
        IdsTipoRodela: idsTipoRodela.length ? idsTipoRodela : null,
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
  }, [rangoFechas, idProveedor, idsTipoRodela, pagina]);

  const alternarTipo = (idTipoRodela) => {
    setIdsTipoRodela((prev) =>
      prev.includes(idTipoRodela)
        ? prev.filter((id) => id !== idTipoRodela)
        : [...prev, idTipoRodela],
    );
    setPagina(1);
  };

  const limpiarFiltros = () => {
    setRangoFechas(undefined);
    setIdProveedor("");
    setIdsTipoRodela([]);
    setPagina(1);
  };

  const hayFiltros = rangoFechas?.from || idProveedor || idsTipoRodela.length > 0;
  const rangoCompleto = Boolean(rangoFechas?.from && rangoFechas?.to);

  const descargarInforme = async () => {
    setDescargandoInforme(true);
    try {
      await descargarReporteLotesRodelaPorPeriodo(
        aFechaISO(rangoFechas.from),
        aFechaISO(rangoFechas.to),
      );
      toast.success("Informe de ingresos descargado");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDescargandoInforme(false);
    }
  };

  // Marca en el calendario los días que ya tienen lotes recibidos (ayuda
  // visual); no interrumpe el filtro si falla.
  const cargarDiasDestacados = async ({ inicio, fin }) => {
    try {
      const data = await verLotesRodela({
        FechaInicio: aFechaISO(inicio),
        FechaFin: aFechaISO(fin),
        Pagina: 1,
        TamanoPagina: 200,
      });

      const mapa = new Map();
      for (const lote of data.Lotes) {
        const etiqueta = `Lote #${lote.IdLoteRodela} - ${dateOnlyFormatter(lote.FechaRecepcion)}`;
        const lista = mapa.get(lote.FechaRecepcion) ?? [];
        lista.push(etiqueta);
        mapa.set(lote.FechaRecepcion, lista);
      }
      setDiasDestacados(mapa);
    } catch {
      setDiasDestacados(new Map());
    }
  };

  const verDetalle = async (idLoteRodela) => {
    setDescargandoId(idLoteRodela);
    try {
      await descargarReporteLoteRodelaDetalle(idLoteRodela);
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
                  <span className="inline-flex">
                    <Button
                      onClick={descargarInforme}
                      disabled={!rangoCompleto || descargandoInforme}
                      className="h-9 gap-1.5 bg-gradient-to-r from-c3 to-c4 font-bold text-white hover:opacity-90"
                    >
                      {descargandoInforme ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Download size={15} strokeWidth={2.5} />
                      )}
                      Descargar informe
                    </Button>
                  </span>
                }
              />
              <TooltipContent>
                {rangoCompleto
                  ? "PDF con una tabla por lote del rango elegido (fecha, proveedor y rodelas) más el total general"
                  : "Elegí una fecha de inicio y una de fin para poder descargar el informe"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DoubleDatePicker
              id="rango-recepcion-lotes-rodela"
              label="Fecha de recepción"
              value={rangoFechas}
              onChange={(v) => {
                setRangoFechas(v);
                setPagina(1);
              }}
              diasDestacados={diasDestacados}
              onRangoVisibleChange={cargarDiasDestacados}
            />

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
          </div>

          {tipos.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Tipo de rodela
              </Label>
              <ToggleGroup
                value={idsTipoRodela.map(String)}
                className="flex flex-wrap justify-start gap-2"
              >
                {tipos.map((t) => (
                  <ToggleGroupItem
                    key={t.IdTipoRodela}
                    value={String(t.IdTipoRodela)}
                    onClick={() => alternarTipo(t.IdTipoRodela)}
                    className="h-auto rounded-full border-2 border-slate-200 px-3.5 py-2 text-[12.5px] font-bold text-slate-600 data-[state=on]:border-c3/40 data-[state=on]:bg-c4/10 data-[state=on]:text-c3"
                  >
                    {t.NombreTipoRodela}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          )}
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

        {!cargando && !error && catalogo && catalogo.Lotes.length === 0 && (
          <div className="p-10 text-center text-sm text-slate-400">
            No hay lotes que coincidan con los filtros seleccionados.
          </div>
        )}

        {!cargando && !error && catalogo && catalogo.Lotes.length > 0 && (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recepción</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead className="text-right">Rodelas</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {catalogo.Lotes.map((l) => (
                    <TableRow key={l.IdLoteRodela}>
                      <TableCell className="font-semibold text-slate-900">
                        {dateOnlyFormatter(l.FechaRecepcion)}
                      </TableCell>
                      <TableCell>{l.NombreProveedor}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {l.CantidadRodelas}
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={descargandoId === l.IdLoteRodela}
                                onClick={() => verDetalle(l.IdLoteRodela)}
                                className="h-9 w-9 text-slate-400 hover:bg-c4/10 hover:text-c3"
                              >
                                {descargandoId === l.IdLoteRodela ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <FileText size={16} strokeWidth={2.25} />
                                )}
                              </Button>
                            }
                          />
                          <TooltipContent>
                            Descargar el detalle en PDF de este lote
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 p-4 md:hidden">
              {catalogo.Lotes.map((l) => (
                <div
                  key={l.IdLoteRodela}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[15px] font-bold text-slate-900">
                      {dateOnlyFormatter(l.FechaRecepcion)}
                    </span>
                    <span className="text-[12.5px] text-slate-500">
                      {l.NombreProveedor} · {l.CantidadRodelas}{" "}
                      {l.CantidadRodelas === 1 ? "rodela" : "rodelas"}
                    </span>
                  </div>

                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={descargandoId === l.IdLoteRodela}
                          onClick={() => verDetalle(l.IdLoteRodela)}
                          className="h-9 w-9 shrink-0 text-slate-400 hover:bg-c4/10 hover:text-c3"
                        >
                          {descargandoId === l.IdLoteRodela ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <FileText size={16} strokeWidth={2.25} />
                          )}
                        </Button>
                      }
                    />
                    <TooltipContent>
                      Descargar el detalle en PDF de este lote
                    </TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5">
              <span className="text-[12.5px] font-semibold text-slate-500">
                Página {catalogo.Pagina} de {totalPaginas} · {catalogo.Total}{" "}
                {catalogo.Total === 1 ? "lote" : "lotes"}
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
