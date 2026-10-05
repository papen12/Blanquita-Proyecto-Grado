import { useState, useEffect } from "react";
import {
  PackageCheck,
  PackageMinus,
  PackagePlus,
  ClipboardPlus,
  ClipboardMinus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { verInventarioProductoTerminado } from "../../services/Inventario/Inventario";
import { Roles } from "@/constants/Values";
import Header from "@/components/layout/Header";
import IngresoProductoTerminado from "./IngresoProductos";
import CorreccionProductoTerminado from "./CorreccionProductos";

const SUBTITULO_POR_VISTA = {
  ingreso: "Registrar ingreso",
  correccion: "Registrar corrección",
  aumento: "Registrar aumento",
  ajustePositivo: "Registrar ajuste positivo",
  ajusteNegativo: "Registrar ajuste negativo",
};

export default function MovimientosProductoTerminado({ usuario }) {
  const esEncargado = usuario?.IdRol === Roles.Encargado;
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vista, setVista] = useState("ingreso");

  useEffect(() => {
    cargarInventario();
  }, []);

  const cargarInventario = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await verInventarioProductoTerminado();
      setInventario(data);
    } catch (e) {
      setError(e.message);
      setInventario([]);
    } finally {
      setLoading(false);
    }
  };

  const actualizarStock = (filas) => {
    const actuales = new Map(filas.map((f) => [f.IdPresentacion, f.CantidadActual]));
    setInventario((prev) =>
      prev.map((p) =>
        actuales.has(p.IdPresentacion)
          ? { ...p, CantidadActual: actuales.get(p.IdPresentacion) }
          : p,
      ),
    );
  };

  const claseTab = cn("gap-1.5 font-bold", esEncargado && "col-span-2 xl:col-span-1");
  const claseTabAjuste = "col-span-3 gap-1.5 font-bold xl:col-span-1";

  return (
    <div className="contenido-con-sidebar flex min-h-screen flex-col bg-slate-50 pt-20 font-sans text-slate-900 md:pt-0">
      <Header
        titulo="Movimientos producto terminado"
        subtitulo={SUBTITULO_POR_VISTA[vista]}
        volver={`/${esEncargado ? "encargado" : "operador"}/producto/inventario`}
      />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-5 sm:px-6">
        <Tabs value={vista} onValueChange={setVista} className="mb-5">
          <TabsList
            className={cn(
              "grid w-full",
              esEncargado
                ? "grid-cols-6 gap-y-[3px] group-data-horizontal/tabs:h-auto xl:grid-cols-5"
                : "grid-cols-3 sm:w-120",
            )}
          >
            <TabsTrigger value="ingreso" className={claseTab}>
              <PackageCheck size={15} strokeWidth={2.75} />
              Ingreso
            </TabsTrigger>
            <TabsTrigger value="correccion" className={claseTab}>
              <PackageMinus size={15} strokeWidth={2.75} />
              Corrección
            </TabsTrigger>
            <TabsTrigger value="aumento" className={claseTab}>
              <PackagePlus size={15} strokeWidth={2.75} />
              Aumento
            </TabsTrigger>
            {esEncargado && (
              <>
                <TabsTrigger value="ajustePositivo" className={claseTabAjuste}>
                  <ClipboardPlus size={15} strokeWidth={2.75} />
                  Ajuste positivo
                </TabsTrigger>
                <TabsTrigger value="ajusteNegativo" className={claseTabAjuste}>
                  <ClipboardMinus size={15} strokeWidth={2.75} />
                  Ajuste negativo
                </TabsTrigger>
              </>
            )}
          </TabsList>
        </Tabs>

        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}

        {error && (
          <div className="rounded-2xl bg-white p-6 text-center text-sm font-semibold text-red-600 ring-1 ring-slate-200">
            {error}
            <div className="mt-3">
              <Button variant="outline" onClick={cargarInventario}>
                Reintentar
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            <div hidden={vista !== "ingreso"}>
              <IngresoProductoTerminado
                inventario={inventario}
                onStockActualizado={actualizarStock}
              />
            </div>
            <div hidden={vista !== "correccion"}>
              <CorreccionProductoTerminado
                tipo="descuento"
                inventario={inventario}
                onStockActualizado={actualizarStock}
              />
            </div>
            <div hidden={vista !== "aumento"}>
              <CorreccionProductoTerminado
                tipo="aumento"
                inventario={inventario}
                onStockActualizado={actualizarStock}
              />
            </div>
            {esEncargado && (
              <>
                <div hidden={vista !== "ajustePositivo"}>
                  <CorreccionProductoTerminado
                    tipo="ajustePositivo"
                    inventario={inventario}
                    onStockActualizado={actualizarStock}
                  />
                </div>
                <div hidden={vista !== "ajusteNegativo"}>
                  <CorreccionProductoTerminado
                    tipo="ajusteNegativo"
                    inventario={inventario}
                    onStockActualizado={actualizarStock}
                  />
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
