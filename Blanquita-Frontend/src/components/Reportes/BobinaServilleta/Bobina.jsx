import ReporteInventario from "@/components/Reportes/ReporteInventario";
import {
  BotonDescargaFila,
  TarjetaReporte,
  COLUMNA_ESTADO,
  COLUMNA_PROVEEDOR,
} from "@/components/Reportes/comunes";
import {
  verBobinasServilletaReporte,
  descargarReporteInventarioBobinaServilleta,
  descargarReporteDetalleBobinaServilleta,
} from "@/services/BobinaServilleta/Reportes";
import { formatearNumero } from "@/utils/numeros";
import { TIPO_BOBINA_SERVILLETA, CODIGO_UNIDAD } from "./filtros";

function UnidadCelda({ bobina, numero }) {
  const codigo = bobina[`CodigoUnidad${numero}`];
  if (!codigo) return <span className="text-slate-300">-</span>;

  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[13px] font-bold text-slate-900">{codigo}</span>
      <span className="text-[11.5px] text-slate-500">
        {bobina[`DescripcionFormato${numero}`]}
      </span>
      <span className="text-[11.5px] text-slate-500">
        {formatearNumero(bobina[`PesoBrutoKg${numero}`], { vacio: "-" })} kg ·{" "}
        {formatearNumero(bobina[`GramajeGr${numero}`], { vacio: "-" })} gr
      </span>
    </div>
  );
}

function BotonDetalle({ bobina, ayuda, className }) {
  return (
    <BotonDescargaFila
      className={className}
      ayuda={ayuda}
      descargar={() => descargarReporteDetalleBobinaServilleta(bobina.IdBobinaServilleta)}
    />
  );
}

const COLUMNAS = [
  { titulo: "Lote", clase: "font-mono text-slate-700", valor: (b) => b.CodigoLote },
  { titulo: "Recepción", valor: (b) => b.FechaRecepcion },
  COLUMNA_PROVEEDOR,
  { titulo: "Tipo", valor: (b) => b.NombreTipoBobinaServilleta },
  COLUMNA_ESTADO,
  { titulo: "Unidad 1", valor: (b) => <UnidadCelda bobina={b} numero={1} /> },
  { titulo: "Unidad 2", valor: (b) => <UnidadCelda bobina={b} numero={2} /> },
];

export default function BobinaReporteServilleta() {
  return (
    <ReporteInventario
      consultar={verBobinasServilletaReporte}
      elementos={(catalogo) => catalogo.Bobinas}
      clave={(b) => b.IdBobinaServilleta}
      nombres={["bobina", "bobinas"]}
      codigo={CODIGO_UNIDAD}
      tipo={TIPO_BOBINA_SERVILLETA}
      informe={{
        ayuda:
          "PDF con el resumen y detalle de las bobinas en almacén, según el tipo marcado abajo (todos si no marcás ninguno)",
        descargar: descargarReporteInventarioBobinaServilleta,
      }}
      columnas={COLUMNAS}
      accion={(b) => (
        <BotonDetalle
          bobina={b}
          ayuda="Descargar detalle de esta bobina (movimientos de la bobina, unidades y sub-bobinas)"
        />
      )}
      tarjeta={(b) => (
        <TarjetaReporte
          titulo={<>Lote {b.CodigoLote}</>}
          tamanoTitulo="text-[13px]"
          subtitulo={
            <>
              {b.NombreTipoBobinaServilleta} · {b.NombreProveedor}
            </>
          }
          estado={b.TipoEstado}
        >
          <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-2.5">
            <UnidadCelda bobina={b} numero={1} />
            <UnidadCelda bobina={b} numero={2} />
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-2.5">
            <span className="text-[12.5px] text-slate-500">Recepción {b.FechaRecepcion}</span>
            <BotonDetalle
              bobina={b}
              ayuda="Descargar detalle de esta bobina"
              className="shrink-0"
            />
          </div>
        </TarjetaReporte>
      )}
    />
  );
}
