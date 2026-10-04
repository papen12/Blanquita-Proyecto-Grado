import ReporteProduccion from "@/components/Reportes/ReporteProduccion";
import {
  verProduccionesServilleta,
  descargarReporteDetalleProduccionServilleta,
  descargarReporteProduccionServilletaCancelada,
  descargarReporteProduccionServilletaPorPeriodo,
} from "@/services/BobinaServilleta/Reportes";
import { TIPOS_BOBINA_SERVILLETA, CODIGO_UNIDAD } from "./filtros";

const COLUMNAS = [
  { titulo: "Tipo", valor: (p) => p.NombreTipoBobinaServilleta },
  { titulo: "Código", clase: "font-mono text-[12.5px]", valor: (p) => p.CodigoBobina },
  { titulo: "Formato", valor: (p) => p.DescripcionMedida },
];

const TARJETA = {
  titulo: (p) => p.CodigoBobina,
  subtitulo: (p) => (
    <>
      {p.NombreTipoBobinaServilleta} · {p.DescripcionMedida} · {p.NombreTurno}
    </>
  ),
};

export default function ProduccionReporteServilleta({ usuario }) {
  return (
    <ReporteProduccion
      usuario={usuario}
      titulo="Reportes · Produccion Bobina Servilleta"
      idCalendario="rango-produccion-servilleta"
      consultar={verProduccionesServilleta}
      campoId="IdProduccionServilleta"
      tipo={TIPOS_BOBINA_SERVILLETA}
      codigo={CODIGO_UNIDAD}
      descargarPeriodo={descargarReporteProduccionServilletaPorPeriodo}
      descargarCancelada={descargarReporteProduccionServilletaCancelada}
      descargarDetalle={(id) => descargarReporteDetalleProduccionServilleta(id, true)}
      columnas={COLUMNAS}
      tarjeta={TARJETA}
    />
  );
}
