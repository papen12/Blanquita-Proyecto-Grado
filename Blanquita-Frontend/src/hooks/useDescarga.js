import { useState } from "react";
import { toast } from "sonner";

export function useDescarga(descargar, exito) {
  const [descargando, setDescargando] = useState(false);

  const iniciar = async () => {
    setDescargando(true);
    try {
      await descargar();
      if (exito) toast.success(exito);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDescargando(false);
    }
  };

  return { descargando, iniciar };
}
