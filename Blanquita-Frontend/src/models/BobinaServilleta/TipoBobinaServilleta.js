export const TipoBobinaServilletaItem = (data) => ({
  IdTipoBobinaServilleta: data.IdTipoBobinaServilleta,
  NombreTipoBobinaServilleta: data.NombreTipoBobinaServilleta,
  Descripcion: data.Descripcion ?? null,
  DiametroMm: Number(data.DiametroMm),
  CrepadoPorcentaje: Number(data.CrepadoPorcentaje),
  ResistenciaKgf: Number(data.ResistenciaKgf),
  CantidadBobinas: data.CantidadBobinas ?? 0,
  CantidadEnAlmacen: data.CantidadEnAlmacen ?? 0,
});

export const ListarTiposBobinaServilletaRequest = (filtros = {}) => ({
  Busqueda: filtros.Busqueda ?? null,
  Pagina: filtros.Pagina ?? 1,
  TamanoPagina: filtros.TamanoPagina ?? 20,
});

export const ListarTiposBobinaServilletaResponse = (data) => ({
  Total: data.Total,
  Pagina: data.Pagina,
  TamanoPagina: data.TamanoPagina,
  Tipos: (data.Tipos ?? []).map(TipoBobinaServilletaItem),
});

// Campos que se pueden cambiar después de crear el tipo (el nombre no).
export const TipoBobinaServilletaEditables = (datos) => ({
  Descripcion: (datos.Descripcion ?? "").trim().replace(/\s+/g, " "),
  DiametroMm: Number(datos.DiametroMm),
  CrepadoPorcentaje: Number(datos.CrepadoPorcentaje),
  ResistenciaKgf: Number(datos.ResistenciaKgf),
});

export const TipoBobinaServilletaDatos = (datos) => ({
  NombreTipoBobinaServilleta: (datos.NombreTipoBobinaServilleta ?? "").trim().replace(/\s+/g, " "),
  ...TipoBobinaServilletaEditables(datos),
});

export const EditarTipoBobinaServilletaRequest = (idTipoBobinaServilleta, datos) => ({
  IdTipoBobinaServilleta: idTipoBobinaServilleta,
  ...TipoBobinaServilletaEditables(datos),
});

export const TipoBobinaServilletaResponse = (data) => ({
  IdTipoBobinaServilleta: data.IdTipoBobinaServilleta,
  NombreTipoBobinaServilleta: data.NombreTipoBobinaServilleta,
  Descripcion: data.Descripcion ?? null,
  DiametroMm: Number(data.DiametroMm),
  CrepadoPorcentaje: Number(data.CrepadoPorcentaje),
  ResistenciaKgf: Number(data.ResistenciaKgf),
});
