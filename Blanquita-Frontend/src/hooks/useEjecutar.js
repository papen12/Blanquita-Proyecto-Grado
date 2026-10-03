import { useState } from "react";
import { toast } from "sonner";

export function useEjecutar() {
  const [enProceso, setEnProceso] = useState(null);

  const ejecutar = async (clave, accion, exito, alTerminar) => {
    setEnProceso(clave);
    try {
      const resultado = await accion();
      toast.success(typeof exito === "function" ? exito(resultado) : exito);
      alTerminar?.(resultado);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setEnProceso(null);
    }
  };

  return { enProceso, ejecutar };
}
