import { PaginaReportesPestanas } from "@/components/Reportes/PaginaReporte";
import InventarioReporteRodela from "./Inventario";
import IngresoReporteRodela from "./Ingreso";

const PESTANAS = [
  {
    valor: "inventario",
    texto: "Inventario",
    subtitulo: "Inventario",
    componente: InventarioReporteRodela,
  },
  {
    valor: "ingresos",
    texto: "Ingresos",
    subtitulo: "Ingresos (lotes)",
    componente: IngresoReporteRodela,
  },
];

export default function RodelaReportes({ usuario }) {
  return (
    <PaginaReportesPestanas usuario={usuario} titulo="Reportes · Rodela" pestanas={PESTANAS} />
  );
}
