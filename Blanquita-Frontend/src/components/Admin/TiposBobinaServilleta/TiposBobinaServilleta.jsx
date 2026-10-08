import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import Header from "@/components/layout/Header";
import {
  TarjetaFiltros,
  BuscadorFiltro,
  ResultadosReporte,
  TarjetaReporte,
  PieTarjeta,
  Dato,
} from "@/components/Reportes/comunes";
import { useReporte } from "@/hooks/useReporte";
import { listarTiposBobinaServilleta } from "@/services/BobinaServilleta/BobinaServilleta";
import { formatearNumero } from "@/utils/numeros";
import { DialogoTipo } from "./Dialogos";

const FILTROS_INICIALES = { Busqueda: "" };

const medida = (valor, unidad) => `${formatearNumero(valor, { decimalesMinimos: 0 })} ${unidad}`;

const COLUMNAS = [
  {
    titulo: "Nombre",
    clase: "font-semibold text-slate-900",
    valor: (t) => t.NombreTipoBobinaServilleta,
  },
  {
    titulo: "Descripción",
    clase: "max-w-xs whitespace-normal text-slate-600",
    valor: (t) => t.Descripcion ?? "—",
  },
  { titulo: "Diámetro", clase: "tabular-nums", valor: (t) => medida(t.DiametroMm, "mm") },
  { titulo: "Crepado", clase: "tabular-nums", valor: (t) => medida(t.CrepadoPorcentaje, "%") },
  { titulo: "Resistencia", clase: "tabular-nums", valor: (t) => medida(t.ResistenciaKgf, "kgf") },
  {
    titulo: "Bobinas",
    clase: "tabular-nums",
    valor: (t) => `${t.CantidadEnAlmacen} en almacén · ${t.CantidadBobinas} registradas`,
  },
];

function BotonAccion({ ayuda, icono: Icono, onClick }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            className="h-9 w-9 text-slate-400 hover:bg-c4/10 hover:text-c3"
          >
            <Icono size={16} strokeWidth={2.25} />
          </Button>
        }
      />
      <TooltipContent>{ayuda}</TooltipContent>
    </Tooltip>
  );
}

export default function TiposBobinaServilleta() {
  const reporte = useReporte(listarTiposBobinaServilleta, FILTROS_INICIALES, ["Busqueda"]);
  const [dialogo, setDialogo] = useState({ abierto: false, tipo: null });

  const acciones = (t) => (
    <div className="flex justify-end gap-1">
      <BotonAccion
        ayuda="Editar tipo"
        icono={Pencil}
        onClick={() => setDialogo({ abierto: true, tipo: t })}
      />
    </div>
  );

  const alGuardar = (guardado, editando) => {
    setDialogo({ abierto: false, tipo: null });
    toast.success(
      editando
        ? `Tipo ${guardado.NombreTipoBobinaServilleta} actualizado`
        : `Tipo ${guardado.NombreTipoBobinaServilleta} creado`,
    );
    reporte.recargar();
  };

  return (
    <TooltipProvider>
      <Toaster richColors position="top-center" />
      <div className="contenido-con-sidebar flex min-h-screen flex-col bg-slate-50 pt-20 font-sans text-slate-900 md:pt-0">
        <Header
          volver="/admin/inicio"
          titulo="Administración"
          subtitulo="Tipos de bobina servilleta"
          contador={
            reporte.catalogo
              ? { valor: reporte.catalogo.Total, singular: "tipo", plural: "tipos" }
              : null
          }
          accion={{
            texto: "Nuevo tipo",
            icono: Plus,
            onClick: () => setDialogo({ abierto: true, tipo: null }),
          }}
        />

        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-6">
          <TarjetaFiltros reporte={reporte}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <BuscadorFiltro
                reporte={reporte}
                campo="Busqueda"
                etiqueta="Buscar"
                placeholder="Nombre o descripción"
                mono={false}
              />
            </div>
          </TarjetaFiltros>

          <ResultadosReporte
            reporte={reporte}
            elementos={reporte.catalogo?.Tipos}
            clave={(t) => t.IdTipoBobinaServilleta}
            nombres={["tipo", "tipos"]}
            columnas={COLUMNAS}
            anchoAccion="w-16"
            accion={acciones}
            tarjeta={(t) => (
              <TarjetaReporte
                titulo={t.NombreTipoBobinaServilleta}
                tamanoTitulo="text-[14px] font-sans"
                subtitulo={t.Descripcion ?? "Sin descripción"}
              >
                <PieTarjeta accion={acciones(t)}>
                  <Dato etiqueta="Diámetro">{medida(t.DiametroMm, "mm")}</Dato>
                  <Dato etiqueta="Crepado">{medida(t.CrepadoPorcentaje, "%")}</Dato>
                  <Dato etiqueta="Resistencia">{medida(t.ResistenciaKgf, "kgf")}</Dato>
                  <Dato etiqueta="En almacén">{t.CantidadEnAlmacen}</Dato>
                </PieTarjeta>
              </TarjetaReporte>
            )}
          />
        </main>
      </div>

      <DialogoTipo
        abierto={dialogo.abierto}
        tipo={dialogo.tipo}
        onCerrar={() => setDialogo({ abierto: false, tipo: null })}
        onGuardado={alGuardar}
      />
    </TooltipProvider>
  );
}
