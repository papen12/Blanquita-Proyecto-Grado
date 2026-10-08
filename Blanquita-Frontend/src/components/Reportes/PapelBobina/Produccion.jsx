import ReporteProduccion from "@/components/Reportes/ReporteProduccion";
import { DERECHA } from "@/components/Reportes/comunes";
import {
  verProduccionesBobinaTubo,
  descargarReporteDetalleProduccion,
  descargarReporteProduccionCancelada,
  descargarReporteProduccionPorPeriodo,
} from "@/services/BobinaPapel/Reportes";
import { PRODUCTO_BOBINA_PAPEL, CODIGO_BOBINA_PAPEL } from "./filtros";

const bobinas = (p) => (
  <>
    {p.CodigoBobina1} + {p.CodigoBobina2}
  </>
);

const COLUMNAS = [
  { titulo: "Producto", valor: (p) => p.NombreProducto },
  { titulo: "Bobinas", clase: "font-mono text-[12.5px]", valor: bobinas },
];

const COLUMNAS_FINALES = [{ titulo: "Logs", ...DERECHA, valor: (p) => p.CantidadLogsActual }];

const TARJETA = {
  titulo: bobinas,
  subtitulo: (p) => (
    <>
      {p.NombreProducto} · {p.NombreTurno}
    </>
  ),
  extra: (p) => <span>Logs {p.CantidadLogsActual}</span>,
};

export default function ProduccionReporteBobinaPapel({ usuario }) {
  return (
    <ReporteProduccion
      usuario={usuario}
      titulo="Reportes · Bobina Papel"
      idCalendario="rango-produccion"
      consultar={verProduccionesBobinaTubo}
      campoId="IdProduccionBobinaTubo"
      tipo={PRODUCTO_BOBINA_PAPEL}
      codigo={CODIGO_BOBINA_PAPEL}
      descargarPeriodo={descargarReporteProduccionPorPeriodo}
      descargarCancelada={descargarReporteProduccionCancelada}
      descargarDetalle={(id, conMovimientos) =>
        descargarReporteDetalleProduccion(id, true, conMovimientos)
      }
      opcionMovimientos
      columnas={COLUMNAS}
      columnasFinales={COLUMNAS_FINALES}
      anchoAccion="w-20"
      tarjeta={TARJETA}
    />
  );
}
