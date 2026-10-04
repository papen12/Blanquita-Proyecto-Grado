export const ResumenProduccionDiariaRequest = (filtros = {}) => ({
  FechaInicio: filtros.FechaInicio ?? null,
  FechaFin: filtros.FechaFin ?? null,
  IdsProducto: filtros.IdsProducto ?? null
});

export const ProduccionPresentacionResponse = (data) => ({
  IdPresentacion: data.IdPresentacion,
  CodigoPresentacion: data.CodigoPresentacion,
  NombrePresentacion: data.NombrePresentacion,
  Entradas: data.Entradas,
  Aumentos: data.Aumentos,
  Descuentos: data.Descuentos,
  Correcciones: data.Correcciones,
  Total: data.Total,
  NumeroRegistros: data.NumeroRegistros
});

export const ProduccionLineaResponse = (data) => ({
  IdProducto: data.IdProducto,
  NombreProducto: data.NombreProducto,
  Unidad: data.Unidad,
  Entradas: data.Entradas,
  Correcciones: data.Correcciones,
  Total: data.Total,
  NumeroRegistros: data.NumeroRegistros,
  DiasConProduccion: data.DiasConProduccion,
  PromedioPorDia: data.PromedioPorDia ?? null,
  Presentaciones: (data.Presentaciones ?? []).map(ProduccionPresentacionResponse)
});

export const ProduccionDiaResponse = (data) => ({
  Fecha: data.Fecha,
  TotalesPorLinea: data.TotalesPorLinea ?? {}
});

export const ResumenProduccionDiariaResponse = (data) => ({
  PeriodoInicio: data.PeriodoInicio,
  PeriodoFin: data.PeriodoFin,
  DiasPeriodo: data.DiasPeriodo,
  DiasConProduccion: data.DiasConProduccion,
  TodasLasLineas: data.TodasLasLineas,
  Lineas: (data.Lineas ?? []).map(ProduccionLineaResponse),
  ProduccionPorDia: (data.ProduccionPorDia ?? []).map(ProduccionDiaResponse)
});

export const ResumenInventarioRequest = (filtros = {}) => ({
  IdsProducto: filtros.IdsProducto ?? null
});

export const InventarioPresentacionResponse = (data) => ({
  IdPresentacion: data.IdPresentacion,
  CodigoPresentacion: data.CodigoPresentacion,
  NombrePresentacion: data.NombrePresentacion,
  TipoContenedor: data.TipoContenedor,
  CantidadRollosUnidades: data.CantidadRollosUnidades ?? null,
  CantidadPorUnidadTerminada: data.CantidadPorUnidadTerminada ?? null,
  CantidadActual: data.CantidadActual,
  FechaUltimoMovimiento: data.FechaUltimoMovimiento ?? null
});

export const InventarioLineaResponse = (data) => ({
  IdProducto: data.IdProducto,
  NombreProducto: data.NombreProducto,
  Unidad: data.Unidad,
  Total: data.Total,
  Presentaciones: (data.Presentaciones ?? []).map(InventarioPresentacionResponse)
});

export const ResumenInventarioResponse = (data) => ({
  FechaGeneracion: data.FechaGeneracion,
  TodasLasLineas: data.TodasLasLineas,
  Lineas: (data.Lineas ?? []).map(InventarioLineaResponse)
});
