export const TipoBobinaPapelItem = (data) => ({
  IdTipoBobina: data.IdTipoBobina,
  NombreTipoBobina: data.NombreTipoBobina,
  Descripcion: data.Descripcion ?? null,
  DiametroMm: Number(data.DiametroMm),
  Formato: Number(data.Formato),
  TaraKg: Number(data.TaraKg),
  CantidadBobinas: data.CantidadBobinas ?? 0,
  CantidadEnAlmacen: data.CantidadEnAlmacen ?? 0,
});

export const ListarTiposBobinaPapelRequest = (filtros = {}) => ({
  Busqueda: filtros.Busqueda ?? null,
  Pagina: filtros.Pagina ?? 1,
  TamanoPagina: filtros.TamanoPagina ?? 20,
});

export const ListarTiposBobinaPapelResponse = (data) => ({
  Total: data.Total,
  Pagina: data.Pagina,
  TamanoPagina: data.TamanoPagina,
  Tipos: (data.Tipos ?? []).map(TipoBobinaPapelItem),
});

// Campos que se pueden cambiar después de crear el tipo (el nombre no).
export const TipoBobinaPapelEditables = (datos) => ({
  Descripcion: (datos.Descripcion ?? "").trim().replace(/\s+/g, " "),
  DiametroMm: Number(datos.DiametroMm),
  Formato: Number(datos.Formato),
  TaraKg: Number(datos.TaraKg),
});

export const TipoBobinaPapelDatos = (datos) => ({
  NombreTipoBobina: (datos.NombreTipoBobina ?? "").trim().replace(/\s+/g, " "),
  ...TipoBobinaPapelEditables(datos),
});

export const EditarTipoBobinaPapelRequest = (idTipoBobina, datos) => ({
  IdTipoBobina: idTipoBobina,
  ...TipoBobinaPapelEditables(datos),
});

export const TipoBobinaPapelResponse = (data) => ({
  IdTipoBobina: data.IdTipoBobina,
  NombreTipoBobina: data.NombreTipoBobina,
  Descripcion: data.Descripcion ?? null,
  DiametroMm: Number(data.DiametroMm),
  Formato: Number(data.Formato),
  TaraKg: Number(data.TaraKg),
});
