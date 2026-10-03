import { useState, useEffect } from "react";

export function useCatalogo(cargar, alCargar) {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const recargar = async () => {
    setCargando(true);
    setError("");
    try {
      const data = await cargar();
      setDatos(data);
      alCargar?.(data);
    } catch (e) {
      setError(e.message);
      setDatos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    recargar();
  }, []);

  return { datos, cargando, error, recargar };
}
