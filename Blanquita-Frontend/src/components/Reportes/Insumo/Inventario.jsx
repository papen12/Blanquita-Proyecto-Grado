import { PaginaReporte } from "@/components/Reportes/PaginaReporte";
import { TarjetaFiltros, BotonInforme, FiltroTipos, DERECHA } from "@/components/Reportes/comunes";
import { useReporte } from "@/hooks/useReporte";
import { dateFormatter } from "@/utils/dates";
import { formatearNumero } from "@/utils/numeros";
import {
  verResumenInventarioInsumo,
  descargarReporteInventarioInsumo,
} from "@/services/Insumo/Reporte";
import {
  TarjetaSeccion,
  EsqueletoCarga,
  ErrorCarga,
  TablaFilas,
  TarjetaFila,
} from "@/components/Reportes/Producto/comunes";
import { TIPO_INSUMO, estadoStockInsumo } from "./filtros";

const textoUltimoMovimiento = (i) =>
  i.FechaUltimoMovimiento ? dateFormatter(i.FechaUltimoMovimiento) : "-";

const COLUMNAS = [
  { titulo: "Insumo", clase: "font-bold text-slate-900", valor: (i) => i.NombreInsumo },
  { titulo: "Descripción", clase: "text-[12.5px] text-slate-600", valor: (i) => i.DescripcionInsumo ?? "-" },
  {
    titulo: "Stock",
    ...DERECHA,
    valor: (i) => formatearNumero(i.CantidadActual, { decimales: 0 }),
  },
  { titulo: "Estado", valor: (i) => estadoStockInsumo(i.CantidadActual) },
  { titulo: "Último movimiento", clase: "text-[12.5px]", valor: textoUltimoMovimiento },
];

function tarjetaInsumo(i) {
  return (
    <TarjetaFila
      nombre={i.NombreInsumo}
      detalle={`${estadoStockInsumo(i.CantidadActual)} · Últ. mov. ${textoUltimoMovimiento(i)}`}
    >
      <strong className="text-slate-900">
        {formatearNumero(i.CantidadActual, { decimales: 0 })}
      </strong>
    </TarjetaFila>
  );
}

function StockInsumos({ reporte }) {
  const { catalogo: resumen, cargando, error, recargar } = reporte;

  return (
    <TarjetaSeccion
      titulo="Stock de insumos"
      className="mt-6"
      extra={
        resumen && (
          <span className="text-[12.5px] font-semibold text-slate-500">
            Stock al {dateFormatter(resumen.FechaGeneracion)}
          </span>
        )
      }
    >
      {cargando && <EsqueletoCarga />}

      {!cargando && error && <ErrorCarga error={error} recargar={recargar} />}

      {!cargando && !error && resumen && (
        <TablaFilas
          columnas={COLUMNAS}
          filas={resumen.Insumos}
          clave={(i) => i.IdTipoInsumo}
          tarjeta={tarjetaInsumo}
        />
      )}
    </TarjetaSeccion>
  );
}

export default function InventarioReporteInsumo({ usuario }) {
  const reporte = useReporte(verResumenInventarioInsumo, { [TIPO_INSUMO.campo]: [] });
  const { filtros, catalogo: resumen } = reporte;

  return (
    <PaginaReporte
      usuario={usuario}
      titulo="Reportes · Insumos"
      subtitulo="Inventario"
      contador={
        resumen
          ? { valor: resumen.Insumos.length, singular: "insumo", plural: "insumos" }
          : null
      }
    >
      <TarjetaFiltros
        reporte={reporte}
        informe={
          <BotonInforme
            ayuda="PDF con el stock actual de cada insumo, según los insumos marcados abajo (todos si no marcás ninguno)"
            exito="Informe de inventario de insumos descargado"
            descargar={() => descargarReporteInventarioInsumo(filtros[TIPO_INSUMO.campo])}
          />
        }
      >
        <FiltroTipos reporte={reporte} tipo={TIPO_INSUMO} />
      </TarjetaFiltros>

      <StockInsumos reporte={reporte} />
    </PaginaReporte>
  );
}
