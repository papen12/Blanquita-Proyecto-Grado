import { PaginaReporte } from "@/components/Reportes/PaginaReporte";
import {
  TarjetaFiltros,
  BotonInforme,
  FiltroTipos,
  columnaCodigo,
  DERECHA,
  contar,
} from "@/components/Reportes/comunes";
import { useReporte } from "@/hooks/useReporte";
import { dateFormatter } from "@/utils/dates";
import { formatearNumero } from "@/utils/numeros";
import {
  verResumenInventario,
  descargarReporteInventarioProducto,
} from "@/services/Inventario/Reportes";
import { LINEA_PRODUCTO } from "./filtros";
import {
  TarjetaSeccion,
  EsqueletoCarga,
  ErrorCarga,
  TablaFilas,
  TarjetaFila,
  CantidadUnidad,
} from "./comunes";

const textoPaquetes = (cantidad) =>
  cantidad == null ? "-" : contar(cantidad, "paquete", "paquetes");

const textoUltimoMovimiento = (p) =>
  p.FechaUltimoMovimiento ? dateFormatter(p.FechaUltimoMovimiento) : "-";

const COLUMNAS = [
  columnaCodigo("CodigoPresentacion"),
  { titulo: "Producto", valor: (p) => p.NombrePresentacion },
  { titulo: "Contenedor", valor: (p) => p.TipoContenedor },
  { titulo: "Contenido", valor: (p) => textoPaquetes(p.CantidadPorUnidadTerminada) },
  {
    titulo: "Stock",
    ...DERECHA,
    valor: (p) => formatearNumero(p.CantidadActual, { decimales: 0 }),
  },
  { titulo: "Último movimiento", clase: "text-[12.5px]", valor: textoUltimoMovimiento },
];

function tarjetaPresentacion(p) {
  return (
    <TarjetaFila
      nombre={`${p.CodigoPresentacion} · ${p.NombrePresentacion}`}
      detalle={`${p.TipoContenedor} · ${textoPaquetes(p.CantidadPorUnidadTerminada)} · Últ. mov. ${textoUltimoMovimiento(p)}`}
    >
      <strong className="text-slate-900">
        {formatearNumero(p.CantidadActual, { decimales: 0 })}
      </strong>
    </TarjetaFila>
  );
}

function StockPorLinea({ reporte }) {
  const { catalogo: resumen, cargando, error, recargar } = reporte;

  if (cargando || error) {
    return (
      <TarjetaSeccion titulo="Stock por línea" className="mt-6">
        {cargando ? <EsqueletoCarga /> : <ErrorCarga error={error} recargar={recargar} />}
      </TarjetaSeccion>
    );
  }

  if (!resumen) return null;

  return (
    <div className="mt-6 flex flex-col gap-4">
      <p className="text-[12.5px] font-semibold text-slate-500">
        Stock al {dateFormatter(resumen.FechaGeneracion)}
      </p>

      {resumen.Lineas.map((linea) => (
        <TarjetaSeccion
          key={linea.IdProducto}
          titulo={linea.NombreProducto}
          extra={<CantidadUnidad valor={linea.Total} unidad={linea.Unidad} />}
        >
          <TablaFilas
            columnas={COLUMNAS}
            filas={linea.Presentaciones}
            clave={(p) => p.IdPresentacion}
            tarjeta={tarjetaPresentacion}
          />
        </TarjetaSeccion>
      ))}
    </div>
  );
}

export default function InventarioReporteProducto({ usuario }) {
  const reporte = useReporte(verResumenInventario, { [LINEA_PRODUCTO.campo]: [] });
  const { filtros, catalogo: resumen } = reporte;

  const presentaciones = resumen?.Lineas.reduce(
    (total, linea) => total + linea.Presentaciones.length,
    0,
  );

  return (
    <PaginaReporte
      usuario={usuario}
      titulo="Reportes · Productos"
      subtitulo="Inventario"
      contador={
        resumen
          ? { valor: presentaciones, singular: "presentación", plural: "presentaciones" }
          : null
      }
    >
      <TarjetaFiltros
        reporte={reporte}
        informe={
          <BotonInforme
            ayuda="PDF con el stock actual por línea y el detalle de cada presentación, según las líneas marcadas abajo (todas si no marcás ninguna)"
            exito="Informe de inventario descargado"
            descargar={() => descargarReporteInventarioProducto(filtros[LINEA_PRODUCTO.campo])}
          />
        }
      >
        <FiltroTipos reporte={reporte} tipo={LINEA_PRODUCTO} />
      </TarjetaFiltros>

      <StockPorLinea reporte={reporte} />
    </PaginaReporte>
  );
}
