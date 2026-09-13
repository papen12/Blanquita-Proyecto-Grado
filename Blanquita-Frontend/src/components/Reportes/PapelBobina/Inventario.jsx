import { useEffect, useState } from "react";
import {
  Search,
  Download,
  Eye,
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
import { SelectEntidad } from "@/components/layout/Selectentidad";
import Header from "@/components/layout/Header";
import {
  verBobinasPapelReporte,
  descargarReporteInventarioBobinaPapel,
  descargarReporteMovimientosBobina,
} from "@/services/BobinaPapel/Reportes";
import { ObtenerTiposPapelBobina } from "@/services/BobinaPapel/BobinaPapel";
import { ObtenerProveedoresForm } from "@/services/Proveedor/Proveedor";
import { EstadosMateriaPrima } from "@/constants/estados";
import { PREFIJO_POR_ROL } from "@/constants/Values";

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
    ? "—"
    : Number(n).toLocaleString("es-BO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

export default function InventarioReporteBobinaPapel({ usuario }) {
  const prefijo = PREFIJO_POR_ROL[usuario?.IdRol] ?? "encargado";

  const [tipos, setTipos] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  const [codigoInput, setCodigoInput] = useState("");
  const [codigoBobina, setCodigoBobina] = useState("");
  const [idProveedor, setIdProveedor] = useState("");
  const [idEstadoMateriaPrima, setIdEstadoMateriaPrima] = useState("");
  const [idsTipoBobina, setIdsTipoBobina] = useState([]);
  const [pagina, setPagina] = useState(1);

  const [catalogo, setCatalogo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [descargandoInforme, setDescargandoInforme] = useState(false);
  const [descargandoId, setDescargandoId] = useState(null);

  // Debounce del código de bobina para no disparar una consulta por cada tecla.
  useEffect(() => {
    const id = setTimeout(() => setCodigoBobina(codigoInput.trim()), 400);
    return () => clearTimeout(id);
  }, [codigoInput]);

  useEffect(() => {
    (async () => {
      try {
        const [dataTipos, dataProveedores] = await Promise.all([
          ObtenerTiposPapelBobina(),
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
      const data = await verBobinasPapelReporte({
        CodigoBobina: codigoBobina || null,
        IdProveedor: idProveedor || null,
        IdsTipoBobina: idsTipoBobina.length ? idsTipoBobina : null,
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
  }, [codigoBobina, idProveedor, idEstadoMateriaPrima, idsTipoBobina, pagina]);

  const alternarTipo = (idTipoBobina) => {
    setIdsTipoBobina((prev) =>
      prev.includes(idTipoBobina)
        ? prev.filter((id) => id !== idTipoBobina)
        : [...prev, idTipoBobina],
    );
    setPagina(1);
  };

  const limpiarFiltros = () => {
    setCodigoInput("");
    setCodigoBobina("");
    setIdProveedor("");
    setIdEstadoMateriaPrima("");
    setIdsTipoBobina([]);
    setPagina(1);
  };

  const hayFiltros =
    codigoBobina || idProveedor || idEstadoMateriaPrima || idsTipoBobina.length > 0;

  const descargarInforme = async () => {
    setDescargandoInforme(true);
    try {
      await descargarReporteInventarioBobinaPapel(
        idsTipoBobina.length ? idsTipoBobina : null,
      );
      toast.success("Informe de inventario descargado");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDescargandoInforme(false);
    }
  };

  const verMovimientos = async (idBobinaPapel) => {
    setDescargandoId(idBobinaPapel);
    try {
      await descargarReporteMovimientosBobina(idBobinaPapel);
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
    <div className="contenido-con-sidebar pt-20 md:pt-0 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      <Header
        volver={`/${prefijo}/reportes/inicio`}
        titulo="Reportes · Bobina Papel"
        subtitulo="Inventario"
        contador={catalogo ? { valor: catalogo.Total, singular: "bobina", plural: "bobinas" } : null}
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
            </div>
          </div>

          <div className="flex flex-col gap-5 p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                      <TableHead>Código</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead className="text-right">Bruto (kg)</TableHead>
                      <TableHead className="text-right">Gramaje</TableHead>
                      <TableHead className="w-12" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {catalogo.Bobinas.map((b) => (
                      <TableRow key={b.IdBobinaPapel}>
                        <TableCell className="font-mono font-bold text-slate-900">
                          {b.CodigoBobina}
                        </TableCell>
                        <TableCell>{b.NombreTipoBobina}</TableCell>
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
                        <TableCell>{b.NombreProveedor}</TableCell>
                        <TableCell className="text-right tabular-nums">
                          {fmt(b.PesoBrutoKg)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {fmt(b.Gramaje)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={descargandoId === b.IdBobinaPapel}
                            onClick={() => verMovimientos(b.IdBobinaPapel)}
                            title="Descargar historial de movimientos"
                            className="h-9 w-9 text-slate-400 hover:bg-c4/10 hover:text-c3"
                          >
                            {descargandoId === b.IdBobinaPapel ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Eye size={16} strokeWidth={2.25} />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col gap-3 p-4 md:hidden">
                {catalogo.Bobinas.map((b) => (
                  <div
                    key={b.IdBobinaPapel}
                    className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-[15px] font-bold text-slate-900">
                          {b.CodigoBobina}
                        </span>
                        <span className="text-[12.5px] text-slate-500">
                          {b.NombreTipoBobina} · {b.NombreProveedor}
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

                    <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-2.5">
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[12.5px] text-slate-600">
                        <span>
                          Bruto{" "}
                          <strong className="text-slate-900">
                            {fmt(b.PesoBrutoKg)} kg
                          </strong>
                        </span>
                        <span>
                          Gramaje{" "}
                          <strong className="text-slate-900">
                            {fmt(b.Gramaje)}
                          </strong>
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={descargandoId === b.IdBobinaPapel}
                        onClick={() => verMovimientos(b.IdBobinaPapel)}
                        title="Descargar historial de movimientos"
                        className="h-9 w-9 shrink-0 text-slate-400 hover:bg-c4/10 hover:text-c3"
                      >
                        {descargandoId === b.IdBobinaPapel ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Eye size={16} strokeWidth={2.25} />
                        )}
                      </Button>
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
      </main>
    </div>
  );
}
