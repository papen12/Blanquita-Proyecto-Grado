export const ResumenInventarioInsumoRequest = (filtros = {}) => ({
  IdsTipoInsumo: filtros.IdsTipoInsumo ?? null
});

export const InventarioInsumoResponse = (data) => ({
  IdTipoInsumo: data.IdTipoInsumo,
  NombreInsumo: data.NombreInsumo,
  DescripcionInsumo: data.DescripcionInsumo ?? null,
  CantidadActual: data.CantidadActual,
  FechaUltimoMovimiento: data.FechaUltimoMovimiento ?? null
});

export const ResumenInventarioInsumoResponse = (data) => ({
  FechaGeneracion: data.FechaGeneracion,
  TodosLosTipos: data.TodosLosTipos,
  Insumos: (data.Insumos ?? []).map(InventarioInsumoResponse)
});

export const ResumenMovimientosInsumoRequest = (filtros = {}) => ({
  FechaInicio: filtros.FechaInicio ?? null,
  FechaFin: filtros.FechaFin ?? null,
  IdsTipoInsumo: filtros.IdsTipoInsumo ?? null
});

export const ResumenInsumoResponse = (data) => ({
  IdTipoInsumo: data.IdTipoInsumo,
  NombreInsumo: data.NombreInsumo,
  Ingresos: data.Ingresos,
  Salidas: data.Salidas,
  Neto: data.Neto,
  NumeroMovimientos: data.NumeroMovimientos,
  CantidadActual: data.CantidadActual
});

export const MovimientoInsumoReporteResponse = (data) => ({
  IdMovimientoInsumo: data.IdMovimientoInsumo,
  FechaMovimiento: data.FechaMovimiento,
  IdTipoInsumo: data.IdTipoInsumo,
  NombreInsumo: data.NombreInsumo,
  IdTipoMovimiento: data.IdTipoMovimiento,
  NombreMovimiento: data.NombreMovimiento,
  CantidadMovimiento: data.CantidadMovimiento,
  Observacion: data.Observacion ?? null,
  Ci: data.Ci,
  PrimerNombre: data.PrimerNombre,
  ApellidoPaterno: data.ApellidoPaterno,
  NombreRol: data.NombreRol
});

export const ResumenMovimientosInsumoResponse = (data) => ({
  PeriodoInicio: data.PeriodoInicio,
  PeriodoFin: data.PeriodoFin,
  TodosLosTipos: data.TodosLosTipos,
  Resumen: (data.Resumen ?? []).map(ResumenInsumoResponse),
  Movimientos: (data.Movimientos ?? []).map(MovimientoInsumoReporteResponse)
});
