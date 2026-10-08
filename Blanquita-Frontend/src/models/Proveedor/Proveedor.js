export const ProveedorForm = (data) => ({
  IdProveedor: data.IdProveedor,
  NombreProveedor: data.NombreProveedor,
});

export const ProveedorItem = (data) => ({
  IdProveedor: data.IdProveedor,
  NombreProveedor: data.NombreProveedor,
  CelularProveedor: data.CelularProveedor ?? null,
  CorreoProveedor: data.CorreoProveedor ?? null,
  IdEstadoProveedor: data.IdEstadoProveedor,
  NombreEstadoProveedor: data.NombreEstadoProveedor,
});

export const ListarProveedoresRequest = (filtros = {}) => ({
  Busqueda: filtros.Busqueda ?? null,
  IdEstadoProveedor: filtros.IdEstadoProveedor ?? null,
  Pagina: filtros.Pagina ?? 1,
  TamanoPagina: filtros.TamanoPagina ?? 20,
});

export const ListarProveedoresResponse = (data) => ({
  Total: data.Total,
  Pagina: data.Pagina,
  TamanoPagina: data.TamanoPagina,
  Proveedores: (data.Proveedores ?? []).map(ProveedorItem),
});

// Se mandan siempre los tres campos: el PUT reemplaza, un campo ausente se borra.
export const ProveedorDatos = (datos) => ({
  NombreProveedor: (datos.NombreProveedor ?? "").trim().replace(/\s+/g, " "),
  CelularProveedor: (datos.CelularProveedor ?? "").trim() || null,
  CorreoProveedor: (datos.CorreoProveedor ?? "").trim().toLowerCase() || null,
});

export const CrearProveedorRequest = ProveedorDatos;

export const EditarProveedorRequest = (idProveedor, datos) => ({
  IdProveedor: idProveedor,
  ...ProveedorDatos(datos),
});

export const ProveedorResponse = ProveedorItem;

export const CambiarEstadoProveedorRequest = (idProveedor, idEstadoProveedor, motivo) => ({
  IdProveedor: idProveedor,
  IdEstadoProveedor: idEstadoProveedor,
  Motivo: (motivo ?? "").trim(),
});

export const CambiarEstadoProveedorResponse = (data) => ({
  IdProveedor: data.IdProveedor,
  NombreProveedor: data.NombreProveedor,
  IdEstadoAnterior: data.IdEstadoAnterior,
  NombreEstadoAnterior: data.NombreEstadoAnterior,
  IdEstadoProveedor: data.IdEstadoProveedor,
  NombreEstadoProveedor: data.NombreEstadoProveedor,
});
