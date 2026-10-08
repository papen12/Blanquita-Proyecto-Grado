export const LineaItem = (data) => ({
  IdProducto: data.IdProducto,
  NombreProducto: data.NombreProducto,
  SiglasProducto: data.SiglasProducto,
  CantidadPresentaciones: data.CantidadPresentaciones ?? 0,
});

export const CrearLineaRequest = (datos) => ({
  NombreProducto: (datos.NombreProducto ?? "").trim().replace(/\s+/g, " "),
  SiglasProducto: (datos.SiglasProducto ?? "").toUpperCase(),
});

export const LineaResponse = (data) => ({
  IdProducto: data.IdProducto,
  NombreProducto: data.NombreProducto,
  SiglasProducto: data.SiglasProducto,
});

export const PresentacionItem = (data) => ({
  IdPresentacion: data.IdPresentacion,
  IdProducto: data.IdProducto,
  TipoContenedor: data.TipoContenedor,
  CantidadRollosUnidades: data.CantidadRollosUnidades,
  CantidadPorUnidadTerminada: data.CantidadPorUnidadTerminada,
  CodigoPresentacion: data.CodigoPresentacion,
  NombreProducto: data.NombreProducto,
});

export const CrearPresentacionRequest = (datos) => ({
  IdProducto: Number(datos.IdProducto),
  TipoContenedor: datos.TipoContenedor,
  TipoCantidad: datos.TipoCantidad,
  CantidadRollosUnidades: Number(datos.CantidadRollosUnidades),
  CantidadPorUnidadTerminada: Number(datos.CantidadPorUnidadTerminada),
});

export const PresentacionResponse = PresentacionItem;
