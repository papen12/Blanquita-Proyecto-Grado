import ReporteLotes from "@/components/Reportes/ReporteLotes";
import {
  verLotesBobinaServilleta,
  descargarReporteLoteServilletaDetalle,
  descargarReporteLotesServilletaPorPeriodo,
} from "@/services/BobinaServilleta/Reportes";

export default function LoteReporteServilleta() {
  return (
    <ReporteLotes
      consultar={verLotesBobinaServilleta}
      descargarDetalle={descargarReporteLoteServilletaDetalle}
      descargarPeriodo={descargarReporteLotesServilletaPorPeriodo}
      campoId="IdLoteBobinaServilleta"
      cantidad={{ campo: "CantidadBobinas", titulo: "Bobinas", nombres: ["bobina", "bobinas"] }}
      idCalendario="rango-recepcion-lotes-servilleta"
      ayudaInforme="PDF con una tabla por lote del rango elegido (bobinas y sus 2 unidades) más el total general"
    />
  );
}
