import { useEffect, useState } from "react";
import { aFechaISO } from "@/utils/dates";

const TAMANO_PAGINA = 15;
const ESPERA_TEXTO = 400;

function filtroActivo(valor) {
  if (Array.isArray(valor)) return valor.length > 0;
  if (valor && typeof valor === "object") return Boolean(valor.from);
  return Boolean(valor);
}

function aParametros(filtros) {
  const parametros = {};
  for (const [campo, valor] of Object.entries(filtros)) {
    if (campo === "Rango") {
      parametros.FechaInicio = aFechaISO(valor?.from);
      parametros.FechaFin = aFechaISO(valor?.to);
    } else if (Array.isArray(valor)) {
      parametros[campo] = valor.length ? valor : null;
    } else {
      parametros[campo] = valor || null;
    }
  }
  return parametros;
}

export function useReporte(consultar, filtrosIniciales, camposTexto = []) {
  const textosIniciales = Object.fromEntries(
    camposTexto.map((campo) => [campo, filtrosIniciales[campo]]),
  );

  const [consulta, setConsulta] = useState({ filtros: filtrosIniciales, pagina: 1 });
  const [textos, setTextos] = useState(textosIniciales);
  const [catalogo, setCatalogo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const { filtros, pagina } = consulta;

  const recargar = async () => {
    setCargando(true);
    setError("");
    try {
      const data = await consultar({
        ...aParametros(filtros),
        Pagina: pagina,
        TamanoPagina: TAMANO_PAGINA,
      });
      setCatalogo(data);
    } catch (e) {
      setError(e.message);
      setCatalogo(null);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    recargar();
  }, [consulta]);

  useEffect(() => {
    const pendientes = camposTexto.filter(
      (campo) => textos[campo].trim() !== filtros[campo],
    );
    if (pendientes.length === 0) return;

    const id = setTimeout(() => {
      setConsulta((previa) => ({
        filtros: {
          ...previa.filtros,
          ...Object.fromEntries(pendientes.map((campo) => [campo, textos[campo].trim()])),
        },
        pagina: 1,
      }));
    }, ESPERA_TEXTO);
    return () => clearTimeout(id);
  }, [textos]);

  const cambiar = (campo, valor) => {
    setConsulta((previa) =>
      previa.filtros[campo] === valor && previa.pagina === 1
        ? previa
        : { filtros: { ...previa.filtros, [campo]: valor }, pagina: 1 },
    );
  };

  const alternar = (campo, id) => {
    setConsulta((previa) => {
      const lista = previa.filtros[campo];
      return {
        filtros: {
          ...previa.filtros,
          [campo]: lista.includes(id)
            ? lista.filter((actual) => actual !== id)
            : [...lista, id],
        },
        pagina: 1,
      };
    });
  };

  const escribir = (campo, texto) => {
    setTextos((previos) => ({ ...previos, [campo]: texto }));
  };

  const limpiar = () => {
    setTextos(textosIniciales);
    setConsulta({ filtros: filtrosIniciales, pagina: 1 });
  };

  const totalPaginas = catalogo
    ? Math.max(1, Math.ceil(catalogo.Total / catalogo.TamanoPagina))
    : 1;

  const cambiarPagina = (salto) => {
    setConsulta((previa) => {
      const nueva = Math.min(totalPaginas, Math.max(1, previa.pagina + salto));
      return nueva === previa.pagina ? previa : { ...previa, pagina: nueva };
    });
  };

  return {
    filtros,
    textos,
    hayFiltros: Object.values(filtros).some(filtroActivo),
    cambiar,
    alternar,
    escribir,
    limpiar,
    catalogo,
    cargando,
    error,
    recargar,
    pagina,
    totalPaginas,
    cambiarPagina,
  };
}
