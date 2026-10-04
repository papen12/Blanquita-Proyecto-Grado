import { PaginaReportesPestanas } from "@/components/Reportes/PaginaReporte";
import InventarioReporteBobinaPapel from "./Inventario";
import IngresoReporteBobinaPapel from "./Ingreso";

const PESTANAS = [
  {
    valor: "inventario",
    texto: "Inventario",
    subtitulo: "Inventario",
    componente: InventarioReporteBobinaPapel,
  },
  {
    valor: "ingresos",
    texto: "Ingresos",
    subtitulo: "Ingresos (lotes)",
    componente: IngresoReporteBobinaPapel,
  },
];

export default function PapelBobinaReportes({ usuario }) {
  return (
    <PaginaReportesPestanas
      usuario={usuario}
      titulo="Reportes · Bobina Papel"
      pestanas={PESTANAS}
    />
  );
}
