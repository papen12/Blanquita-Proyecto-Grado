import { useState, useEffect } from "react";
import { PackagePlus, PackageMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { verInventarioProductoTerminado } from "../../services/Inventario/Inventario";
import Header from "@/components/layout/Header";
import IngresoProductoTerminado from "./IngresoProductos";
import CorreccionProductoTerminado from "./CorreccionProductos";

const SUBTITULO_POR_VISTA = {
  ingreso: "Registrar ingreso",
  correccion: "Registrar corrección",
};

export default function MovimientosProductoTerminado({ usuario }) {
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

  return (
    <div className="contenido-con-sidebar flex min-h-screen flex-col bg-slate-50 pt-20 font-sans text-slate-900 md:pt-0">
      <Header
        titulo="Movimientos producto terminado"
        subtitulo={SUBTITULO_POR_VISTA[vista]}
        volver={`/${usuario?.IdRol === 2 ? "encargado" : "operador"}/producto/inventario`}
      />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-5 sm:px-6">
        <Tabs value={vista} onValueChange={setVista} className="mb-5">
          <TabsList className="grid w-full grid-cols-2 sm:w-80">
            <TabsTrigger value="ingreso" className="gap-1.5 font-bold">
              <PackagePlus size={15} strokeWidth={2.75} />
              Ingreso
            </TabsTrigger>
            <TabsTrigger value="correccion" className="gap-1.5 font-bold">
              <PackageMinus size={15} strokeWidth={2.75} />
              Corrección
            </TabsTrigger>
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
                inventario={inventario}
                onStockActualizado={actualizarStock}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
