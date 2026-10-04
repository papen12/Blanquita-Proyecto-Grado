import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useOpciones(cargar) {
  const [opciones, setOpciones] = useState([]);

  useEffect(() => {
    cargar()
      .then(setOpciones)
      .catch((e) => toast.error(e.message));
  }, []);

  return opciones;
}
