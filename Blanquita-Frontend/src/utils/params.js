export function construirQueryParams(filtros = {}) {
  const params = new URLSearchParams();

  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor === null || valor === undefined || valor === "") return;

    if (Array.isArray(valor)) {
      valor.forEach((item) => params.append(clave, item));
      return;
    }

    params.set(clave, valor);
  });

  return params;
}
