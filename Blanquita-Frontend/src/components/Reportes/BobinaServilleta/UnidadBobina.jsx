import { useEffect, useMemo, useState } from "react";
import {
  Search,
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
  descargarReporteMovimientosUnidadServilleta,
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

function aplanarUnidades(bobinas) {
  const unidades = [];

  bobinas.forEach((b) => {
    if (b.IdUnidad1) {
      unidades.push({
        IdUnidad: b.IdUnidad1,
        CodigoUnidad: b.CodigoUnidad1,
        DescripcionFormato: b.DescripcionFormato1,
        PesoBrutoKg: b.PesoBrutoKg1,
        GramajeGr: b.GramajeGr1,
        IdBobinaServilleta: b.IdBobinaServilleta,
        CodigoLote: b.CodigoLote,
        FechaRecepcion: b.FechaRecepcion,
        NombreProveedor: b.NombreProveedor,
        NombreTipoBobinaServilleta: b.NombreTipoBobinaServilleta,
        TipoEstado: b.TipoEstado,
      });
    }
    if (b.IdUnidad2) {
      unidades.push({
        IdUnidad: b.IdUnidad2,
        CodigoUnidad: b.CodigoUnidad2,
        DescripcionFormato: b.DescripcionFormato2,
        PesoBrutoKg: b.PesoBrutoKg2,
        GramajeGr: b.GramajeGr2,
        IdBobinaServilleta: b.IdBobinaServilleta,
        CodigoLote: b.CodigoLote,
        FechaRecepcion: b.FechaRecepcion,
        NombreProveedor: b.NombreProveedor,
        NombreTipoBobinaServilleta: b.NombreTipoBobinaServilleta,
        TipoEstado: b.TipoEstado,
      });
    }
  });

  return unidades;
}

export default function UnidadBobinaReporteServilleta() {
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

  const unidades = useMemo(
    () => (catalogo ? aplanarUnidades(catalogo.Bobinas) : []),
    [catalogo],
  );

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

  const verMovimientos = async (idUnidad) => {
    setDescargandoId(idUnidad);
    try {
      await descargarReporteMovimientosUnidadServilleta(idUnidad);
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

        {!cargando && !error && unidades.length === 0 && (
          <div className="p-10 text-center text-sm text-slate-400">
            No hay unidades que coincidan con los filtros seleccionados.
          </div>
        )}

        {!cargando && !error && unidades.length > 0 && (
          <>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Formato</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Bruto (kg)</TableHead>
                    <TableHead className="text-right">Gramaje</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unidades.map((u) => (
                    <TableRow key={u.IdUnidad}>
                      <TableCell className="font-mono font-bold text-slate-900">
                        {u.CodigoUnidad}
                      </TableCell>
                      <TableCell>{u.DescripcionFormato}</TableCell>
                      <TableCell className="font-mono text-slate-700">
                        {u.CodigoLote}
                      </TableCell>
                      <TableCell>{u.NombreTipoBobinaServilleta}</TableCell>
                      <TableCell>{u.NombreProveedor}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-bold",
                            ESTADO_BADGE[u.TipoEstado] ??
                              "border-slate-300 bg-slate-100 text-slate-600",
                          )}
                        >
                          {u.TipoEstado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {fmt(u.PesoBrutoKg)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {fmt(u.GramajeGr)}
                      </TableCell>
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={descargandoId === u.IdUnidad}
                                onClick={() => verMovimientos(u.IdUnidad)}
                                className="h-9 w-9 text-slate-400 hover:bg-c4/10 hover:text-c3"
                              >
                                {descargandoId === u.IdUnidad ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <FileDown size={16} strokeWidth={2.25} />
                                )}
                              </Button>
                            }
                          />
                          <TooltipContent>
                            Descargar historial de movimientos de esta unidad
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 p-4 md:hidden">
              {unidades.map((u) => (
                <div
                  key={u.IdUnidad}
                  className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-[15px] font-bold text-slate-900">
                        {u.CodigoUnidad}
                      </span>
                      <span className="text-[12.5px] text-slate-500">
                        {u.DescripcionFormato} · {u.NombreProveedor}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "shrink-0 font-bold",
                        ESTADO_BADGE[u.TipoEstado] ??
                          "border-slate-300 bg-slate-100 text-slate-600",
                      )}
                    >
                      {u.TipoEstado}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-2.5">
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[12.5px] text-slate-600">
                      <span>
                        Bruto{" "}
                        <strong className="text-slate-900">
                          {fmt(u.PesoBrutoKg)} kg
                        </strong>
                      </span>
                      <span>
                        Gramaje{" "}
                        <strong className="text-slate-900">
                          {fmt(u.GramajeGr)}
                        </strong>
                      </span>
                    </div>

                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={descargandoId === u.IdUnidad}
                            onClick={() => verMovimientos(u.IdUnidad)}
                            className="h-9 w-9 shrink-0 text-slate-400 hover:bg-c4/10 hover:text-c3"
                          >
                            {descargandoId === u.IdUnidad ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <FileDown size={16} strokeWidth={2.25} />
                            )}
                          </Button>
                        }
                      />
                      <TooltipContent>
                        Descargar historial de movimientos
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5">
              <span className="text-[12.5px] font-semibold text-slate-500">
                Página {catalogo.Pagina} de {totalPaginas} · {unidades.length}{" "}
                {unidades.length === 1 ? "unidad" : "unidades"} en esta página
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
