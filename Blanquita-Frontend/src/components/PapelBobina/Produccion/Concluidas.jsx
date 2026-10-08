import { Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ProduccionesConcluidas from "@/components/Produccion/Concluidas";
import { DERECHA } from "@/components/Reportes/comunes";
import { PRODUCTO_BOBINA_PAPEL, CODIGO_BOBINA_PAPEL } from "@/components/Reportes/PapelBobina/filtros";
import {
  verProduccionesBobinaTubo,
  descargarReporteDetalleProduccion,
  descargarReporteProduccionCancelada,
  descargarReporteProduccionPorPeriodo,
} from "@/services/BobinaPapel/Reportes";

const bobinas = (p) => `${p.CodigoBobina1} + ${p.CodigoBobina2}`;

function EtiquetaCargada({ cantidad }) {
  if (cantidad <= 1) return null;
  return (
    <Badge
      variant="outline"
      className="gap-1 border-c3/30 bg-c4/5 font-bold text-c3"
      title="Producciones hechas con el mismo par de bobinas"
    >
      <Layers size={12} strokeWidth={2.75} />
      Cargada: {cantidad}
    </Badge>
  );
}

const COLUMNAS = [
  {
    titulo: "Producto",
    valor: (p) => (
      <div className="flex flex-col items-start gap-1">
        <span className="font-semibold text-slate-900">{p.NombreProducto}</span>
        <EtiquetaCargada cantidad={p.CantidadCargada} />
      </div>
    ),
  },
  { titulo: "Bobinas", clase: "font-mono text-[12.5px]", valor: bobinas },
  { titulo: "Turno", valor: (p) => p.NombreTurno },
  { titulo: "Operador", valor: (p) => p.Operador },
];

const COLUMNAS_FINALES = [{ titulo: "Logs", ...DERECHA, valor: (p) => p.CantidadLogsActual }];

const TARJETA = {
  titulo: bobinas,
  subtitulo: (p) => `${p.NombreProducto} · ${p.NombreTurno} · ${p.Operador}`,
  extra: (p) => (
    <>
      <span>Logs {p.CantidadLogsActual}</span>
      <EtiquetaCargada cantidad={p.CantidadCargada} />
    </>
  ),
};

export default function ConcluidasBobinaPapel({ onTotal }) {
  return (
    <ProduccionesConcluidas
      onTotal={onTotal}
      consultar={verProduccionesBobinaTubo}
      campoId="IdProduccionBobinaTubo"
      idCalendario="rango-concluidas-bobina-papel"
      conCambioLinea
      filtroTipo={PRODUCTO_BOBINA_PAPEL}
      codigo={CODIGO_BOBINA_PAPEL}
      columnas={COLUMNAS}
      columnasFinales={COLUMNAS_FINALES}
      tarjeta={TARJETA}
      descargarDetalle={(id) => descargarReporteDetalleProduccion(id, true, true)}
      descargarCancelada={descargarReporteProduccionCancelada}
      descargarPeriodo={descargarReporteProduccionPorPeriodo}
    />
  );
}
