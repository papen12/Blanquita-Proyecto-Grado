import { useState } from "react";

export function useDetalleInventario(cargar, igual = (a, b) => a === b) {
  const [sel, setSel] = useState(null);
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [marcadas, setMarcadas] = useState([]);

  const recargar = async (valor = sel) => {
    if (valor === null) return;
    setCargando(true);
    setError("");
    try {
      setDatos(await cargar(valor));
    } catch (e) {
      setError(e.message);
      setDatos([]);
    } finally {
      setCargando(false);
    }
  };

  const cerrar = () => {
    setSel(null);
    setDatos([]);
    setMarcadas([]);
    setBusqueda("");
  };

  const seleccionar = (valor) => {
    if (sel !== null && igual(sel, valor)) {
      cerrar();
      return;
    }
    setSel(valor);
    setMarcadas([]);
    setBusqueda("");
    recargar(valor);
  };

  return {
    sel,
    datos,
    setDatos,
    cargando,
    error,
    busqueda,
    setBusqueda,
    marcadas,
    setMarcadas,
    seleccionar,
    cerrar,
    recargar,
  };
}
