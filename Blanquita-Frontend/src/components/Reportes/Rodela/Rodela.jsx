import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/layout/Header";
import { PREFIJO_POR_ROL } from "@/constants/Values";
import InventarioReporteRodela from "./Inventario";
import IngresoReporteRodela from "./Ingreso";

const SUBTITULOS = {
  inventario: "Inventario",
  ingresos: "Ingresos (lotes)",
};

export default function RodelaReportes({ usuario }) {
  const prefijo = PREFIJO_POR_ROL[usuario?.IdRol] ?? "encargado";
  const [tab, setTab] = useState("inventario");

  return (
    <TooltipProvider>
      <div className="contenido-con-sidebar pt-20 md:pt-0 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
        <Header
          volver={`/${prefijo}/reportes/inicio`}
          titulo="Reportes · Rodela"
          subtitulo={SUBTITULOS[tab]}
        />

        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-5 h-11 w-full sm:w-auto">
              <TabsTrigger value="inventario" className="flex-1 font-bold sm:flex-none sm:px-6">
                Inventario
              </TabsTrigger>
              <TabsTrigger value="ingresos" className="flex-1 font-bold sm:flex-none sm:px-6">
                Ingresos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inventario">
              <InventarioReporteRodela />
            </TabsContent>

            <TabsContent value="ingresos">
              <IngresoReporteRodela />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </TooltipProvider>
  );
}
