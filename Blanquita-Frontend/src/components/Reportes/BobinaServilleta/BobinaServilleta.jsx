import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/layout/Header";
import { PREFIJO_POR_ROL } from "@/constants/Values";
import BobinaReporteServilleta from "./Bobina";
import UnidadBobinaReporteServilleta from "./UnidadBobina";

const SUBTITULOS = {
  bobina: "Bobina",
  unidad: "Unidad Bobina",
};

export default function ServilletaBobinaReportes({ usuario }) {
  const prefijo = PREFIJO_POR_ROL[usuario?.IdRol] ?? "encargado";
  const [tab, setTab] = useState("bobina");

  return (
    <TooltipProvider>
      <div className="contenido-con-sidebar pt-20 md:pt-0 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
        <Header
          volver={`/${prefijo}/reportes/inicio`}
          titulo="Reportes · Bobina Servilleta"
          subtitulo={SUBTITULOS[tab]}
        />

        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 sm:px-6">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-5 h-11 w-full sm:w-auto">
              <TabsTrigger value="bobina" className="flex-1 font-bold sm:flex-none sm:px-6">
                Bobina
              </TabsTrigger>
              <TabsTrigger value="unidad" className="flex-1 font-bold sm:flex-none sm:px-6">
                Unidad Bobina
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bobina">
              <BobinaReporteServilleta />
            </TabsContent>

            <TabsContent value="unidad">
              <UnidadBobinaReporteServilleta />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </TooltipProvider>
  );
}
