import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Search,
  Download,
  FileDown,
  Ban,
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { SelectEntidad } from "@/components/layout/Selectentidad";
import DoubleDatePicker from "@/components/layout/dates/DoubleDatePicker";
import Header from "@/components/layout/Header";
import {
  verProduccionesBobinaTubo,
  descargarReporteDetalleProduccion,
  descargarReporteProduccionCancelada,
  descargarReporteProduccionPorPeriodo,
} from "@/services/BobinaPapel/Reportes";
import { ObtenerTiposPapelBobina } from "@/services/BobinaPapel/BobinaPapel";
import { EstadosProduccion } from "@/constants/estados";
import { turnos, PREFIJO_POR_ROL } from "@/constants/Values";
import { dateFormatter } from "@/utils/dates";

const TAMANO_PAGINA = 15;

const ESTADO_BADGE = {
  "En Producción": "border-sky-300 bg-sky-50 text-sky-700",
  Pausa: "border-amber-300 bg-amber-50 text-amber-700",
  Finalizado: "border-emerald-300 bg-emerald-50 text-emerald-700",
  Cancelada: "border-red-300 bg-red-50 text-red-600",
};

const aFechaISO = (fecha) => (fecha ? format(fecha, "yyyy-MM-dd") : null);

function formatearDuracion(duracionIso) {
  if (!duracionIso) return "—";
  const coincidencia = duracionIso.match(
    /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:[\d.]+S)?$/,
  );
  if (!coincidencia) return "—";
  const dias = Number(coincidencia[1] || 0);
  const horas = Number(coincidencia[2] || 0) + dias * 24;
  const minutos = Number(coincidencia[3] || 0);
  return `${horas}h ${String(minutos).padStart(2, "0")}m`;
}

export default function ProduccionReporteBobinaPapel({ usuario }) {
  const prefijo = PREFIJO_POR_ROL[usuario?.IdRol] ?? "encargado";

  const [tipos, setTipos] = useState([]);

  const [rangoFechas, setRangoFechas] = useState(undefined);
  const [idTurno, setIdTurno] = useState("");
  const [idsTipoBobina, setIdsTipoBobina] = useState([]);
  const [codigoInput, setCodigoInput] = useState("");
  const [codigoBobina, setCodigoBobina] = useState("");
  const [operadorInput, setOperadorInput] = useState("");
  const [operador, setOperador] = useState("");
  const [idEstadoProduccion, setIdEstadoProduccion] = useState("");
  const [pagina, setPagina] = useState(1);

  const [catalogo, setCatalogo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [descargandoInforme, setDescargandoInforme] = useState(false);
  const [verCancelacionesPeriodo, setVerCancelacionesPeriodo] = useState(false);
  const [descargandoId, setDescargandoId] = useState(null);

  useEffect(() => {
    const id = setTimeout(() => setCodigoBobina(codigoInput.trim()), 400);
    return () => clearTimeout(id);
  }, [codigoInput]);

  useEffect(() => {
    const id = setTimeout(() => setOperador(operadorInput.trim()), 400);
    return () => clearTimeout(id);
  }, [operadorInput]);

  useEffect(() => {
    (async () => {
      try {
        const dataTipos = await ObtenerTiposPapelBobina();
        setTipos(dataTipos);
      } catch (e) {
        toast.error(e.message);
      }
    })();
  }, []);

  const cargarCatalogo = async () => {
    setCargando(true);
    setError("");
    try {
      const data = await verProduccionesBobinaTubo({
        FechaInicio: aFechaISO(rangoFechas?.from),
        FechaFin: aFechaISO(rangoFechas?.to),
        IdTurno: idTurno || null,
        IdsTipoBobina: idsTipoBobina.length ? idsTipoBobina : null,
        CodigoBobina: codigoBobina || null,
        Operador: operador || null,
        IdEstadoProduccion: idEstadoProduccion || null,
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
  }, [
    rangoFechas,
    idTurno,
    idsTipoBobina,
    codigoBobina,
    operador,
    idEstadoProduccion,
    pagina,
  ]);

  const alternarTipo = (idTipoBobina) => {
    setIdsTipoBobina((prev) =>
      prev.includes(idTipoBobina)
        ? prev.filter((id) => id !== idTipoBobina)
        : [...prev, idTipoBobina],
    );
    setPagina(1);
  };

  const limpiarFiltros = () => {
    setRangoFechas(undefined);
    setIdTurno("");
    setIdsTipoBobina([]);
    setCodigoInput("");
    setCodigoBobina("");
    setOperadorInput("");
    setOperador("");
    setIdEstadoProduccion("");
    setPagina(1);
  };

  const hayFiltros =
    rangoFechas?.from ||
    idTurno ||
    idsTipoBobina.length > 0 ||
    codigoBobina ||
    operador ||
    idEstadoProduccion;

  const rangoCompleto = Boolean(rangoFechas?.from && rangoFechas?.to);

  const descargarInforme = async () => {
    setDescargandoInforme(true);
    try {
      await descargarReporteProduccionPorPeriodo(
        aFechaISO(rangoFechas.from),
        aFechaISO(rangoFechas.to),
        verCancelacionesPeriodo,
      );
      toast.success("Informe de producción descargado");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDescargandoInforme(false);
    }
  };

  const verDetalle = async (idProduccion) => {
    setDescargandoId(idProduccion);
    try {
      await descargarReporteDetalleProduccion(idProduccion, true);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDescargandoId(null);
    }
  };

  const verCancelacion = async (idProduccion) => {
    setDescargandoId(idProduccion);
    try {
      await descargarReporteProduccionCancelada(idProduccion);
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
    <TooltipProvider>
    <div className="contenido-con-sidebar pt-20 md:pt-0 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      <Header
        volver={`/${prefijo}/reportes/inicio`}
        titulo="Reportes · Bobina Papel"
        subtitulo="Producción"
        contador={
          catalogo
            ? { valor: catalogo.Total, singular: "producción", plural: "producciones" }
            : null
        }
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-6">
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
                    ? "PDF con las producciones, pausas por motivo y tiempos del rango elegido"
                    : "Elegí una fecha de inicio y una de fin para poder descargar el informe"}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="flex flex-col gap-5 p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <DoubleDatePicker
                id="rango-produccion"
                label="Fecha de producción"
                value={rangoFechas}
                onChange={(v) => {
                  setRangoFechas(v);
                  setPagina(1);
                }}
              />

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Turno
                </Label>
                <SelectEntidad
                  opciones={turnos}
                  valor={idTurno}
                  onCambio={(v) => {
                    setIdTurno(v);
                    setPagina(1);
                  }}
                  campoValor="IdTurno"
                  campoEtiqueta="NombreTurno"
                  placeholder="Todos los turnos"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Estado
                </Label>
                <SelectEntidad
                  opciones={EstadosProduccion}
                  valor={idEstadoProduccion}
                  onCambio={(v) => {
                    setIdEstadoProduccion(v);
                    setPagina(1);
                  }}
                  campoValor="IdEstadoProduccion"
                  campoEtiqueta="NombreEstadoProduccion"
                  placeholder="Todos los estados"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Código de bobina
                </Label>
                <div className="relative">
                  <Search
                    size={16}
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    value={codigoInput}
                    onChange={(e) => setCodigoInput(e.target.value)}
                    placeholder="Ej. 963-R20"
                    className="h-11 pl-9 font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Operador
                </Label>
                <div className="relative">
                  <Search
                    size={16}
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
                  />
                  <Input
                    value={operadorInput}
                    onChange={(e) => setOperadorInput(e.target.value)}
                    placeholder="Nombre del operador"
                    className="h-11 pl-9"
                  />
                </div>
              </div>
            </div>

            {tipos.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide text-slate-600">
                  Tipo de bobina
                </Label>
                <ToggleGroup
                  value={idsTipoBobina.map(String)}
                  className="flex flex-wrap justify-start gap-2"
                >
                  {tipos.map((t) => (
                    <ToggleGroupItem
                      key={t.IdTipoBobina}
                      value={String(t.IdTipoBobina)}
                      onClick={() => alternarTipo(t.IdTipoBobina)}
                      className="h-auto rounded-full border-2 border-slate-200 px-3.5 py-2 text-[12.5px] font-bold text-slate-600 data-[state=on]:border-c3/40 data-[state=on]:bg-c4/10 data-[state=on]:text-c3"
                    >
                      {t.NombreTipoBobina}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Informe por período
              </Label>
              <ToggleGroup
                value={verCancelacionesPeriodo ? ["on"] : []}
                className="flex flex-wrap justify-start gap-2"
              >
                <ToggleGroupItem
                  value="on"
                  onClick={() => setVerCancelacionesPeriodo((v) => !v)}
                  className="h-auto rounded-full border-2 border-slate-200 px-3.5 py-2 text-[12.5px] font-bold text-slate-600 data-[state=on]:border-c3/40 data-[state=on]:bg-c4/10 data-[state=on]:text-c3"
                >
                  Incluir cancelaciones en el informe
                </ToggleGroupItem>
              </ToggleGroup>
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

          {!cargando && !error && catalogo && catalogo.Producciones.length === 0 && (
            <div className="p-10 text-center text-sm text-slate-400">
              No hay producciones que coincidan con los filtros seleccionados.
            </div>
          )}

          {!cargando && !error && catalogo && catalogo.Producciones.length > 0 && (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estado</TableHead>
                      <TableHead>Turno</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Bobinas</TableHead>
                      <TableHead>Inicio</TableHead>
                      <TableHead>Fin</TableHead>
                      <TableHead className="text-right">Duración</TableHead>
                      <TableHead className="text-right">Logs</TableHead>
                      <TableHead className="w-20" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {catalogo.Producciones.map((p) => (
                      <TableRow key={p.IdProduccionBobinaTubo}>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-bold",
                              ESTADO_BADGE[p.NombreEstadoProduccion] ??
                                "border-slate-300 bg-slate-100 text-slate-600",
                            )}
                          >
                            {p.NombreEstadoProduccion}
                          </Badge>
                        </TableCell>
                        <TableCell>{p.NombreTurno}</TableCell>
                        <TableCell>{p.TipoBobina}</TableCell>
                        <TableCell className="font-mono text-[12.5px]">
                          {p.CodigoBobina1} + {p.CodigoBobina2}
                        </TableCell>
                        <TableCell className="text-[12.5px]">
                          {dateFormatter(p.FechaInicioProduccion)}
                        </TableCell>
                        <TableCell className="text-[12.5px]">
                          {p.FechaFinProduccion
                            ? dateFormatter(p.FechaFinProduccion)
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatearDuracion(p.DuracionTotal)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {p.CantidadLogsActual}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={descargandoId === p.IdProduccionBobinaTubo}
                                    onClick={() => verDetalle(p.IdProduccionBobinaTubo)}
                                    className="h-9 w-9 text-slate-400 hover:bg-c4/10 hover:text-c3"
                                  >
                                    {descargandoId === p.IdProduccionBobinaTubo ? (
                                      <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                      <FileDown size={16} strokeWidth={2.25} />
                                    )}
                                  </Button>
                                }
                              />
                              <TooltipContent>
                                Descargar detalle de esta producción (con pausas)
                              </TooltipContent>
                            </Tooltip>

                            {p.NombreEstadoProduccion === "Cancelada" && (
                              <Tooltip>
                                <TooltipTrigger
                                  render={
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      disabled={descargandoId === p.IdProduccionBobinaTubo}
                                      onClick={() => verCancelacion(p.IdProduccionBobinaTubo)}
                                      className="h-9 w-9 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                    >
                                      {descargandoId === p.IdProduccionBobinaTubo ? (
                                        <Loader2 size={16} className="animate-spin" />
                                      ) : (
                                        <Ban size={16} strokeWidth={2.25} />
                                      )}
                                    </Button>
                                  }
                                />
                                <TooltipContent>
                                  Descargar el motivo de cancelación
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col gap-3 p-4 md:hidden">
                {catalogo.Producciones.map((p) => (
                  <div
                    key={p.IdProduccionBobinaTubo}
                    className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-[13.5px] font-bold text-slate-900">
                          {p.CodigoBobina1} + {p.CodigoBobina2}
                        </span>
                        <span className="text-[12.5px] text-slate-500">
                          {p.TipoBobina} · {p.NombreTurno}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0 font-bold",
                          ESTADO_BADGE[p.NombreEstadoProduccion] ??
                            "border-slate-300 bg-slate-100 text-slate-600",
                        )}
                      >
                        {p.NombreEstadoProduccion}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[12.5px] text-slate-600">
                      <span>Inicio {dateFormatter(p.FechaInicioProduccion)}</span>
                      {p.FechaFinProduccion && (
                        <span>Fin {dateFormatter(p.FechaFinProduccion)}</span>
                      )}
                      <span>Duración {formatearDuracion(p.DuracionTotal)}</span>
                      <span>Logs {p.CantidadLogsActual}</span>
                    </div>

                    <div className="flex items-center justify-end gap-1 border-t border-slate-200 pt-2.5">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={descargandoId === p.IdProduccionBobinaTubo}
                              onClick={() => verDetalle(p.IdProduccionBobinaTubo)}
                              className="h-9 w-9 text-slate-400 hover:bg-c4/10 hover:text-c3"
                            >
                              {descargandoId === p.IdProduccionBobinaTubo ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <FileDown size={16} strokeWidth={2.25} />
                              )}
                            </Button>
                          }
                        />
                        <TooltipContent>
                          Descargar detalle de esta producción (con pausas)
                        </TooltipContent>
                      </Tooltip>

                      {p.NombreEstadoProduccion === "Cancelada" && (
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={descargandoId === p.IdProduccionBobinaTubo}
                                onClick={() => verCancelacion(p.IdProduccionBobinaTubo)}
                                className="h-9 w-9 text-slate-400 hover:bg-red-50 hover:text-red-600"
                              >
                                {descargandoId === p.IdProduccionBobinaTubo ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Ban size={16} strokeWidth={2.25} />
                                )}
                              </Button>
                            }
                          />
                          <TooltipContent>
                            Descargar el motivo de cancelación
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5">
                <span className="text-[12.5px] font-semibold text-slate-500">
                  Página {catalogo.Pagina} de {totalPaginas} · {catalogo.Total}{" "}
                  {catalogo.Total === 1 ? "producción" : "producciones"}
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
      </main>
    </div>
    </TooltipProvider>
  );
}
