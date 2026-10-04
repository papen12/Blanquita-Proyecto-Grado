import { PaginaReportesPestanas } from "@/components/Reportes/PaginaReporte";
import BobinaReporteServilleta from "./Bobina";
import UnidadBobinaReporteServilleta from "./UnidadBobina";
import LoteReporteServilleta from "./Lote";

const PESTANAS = [
  { valor: "bobina", texto: "Bobina", subtitulo: "Bobina", componente: BobinaReporteServilleta },
  {
    valor: "unidad",
    texto: "Unidad Bobina",
    subtitulo: "Unidad Bobina",
    componente: UnidadBobinaReporteServilleta,
  },
  { valor: "lote", texto: "Lote", subtitulo: "Lote", componente: LoteReporteServilleta },
];

export default function ServilletaBobinaReportes({ usuario }) {
  return (
    <PaginaReportesPestanas
      usuario={usuario}
      titulo="Reportes · Inventario Bobina Servilleta"
      pestanas={PESTANAS}
    />
  );
}
