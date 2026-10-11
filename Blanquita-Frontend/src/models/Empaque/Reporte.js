export const ReporteEmpaqueRequest = (filtros = {}) => ({
  FechaInicio: filtros.FechaInicio ?? null,
  FechaFin: filtros.FechaFin ?? null,
  IdsTipo: filtros.IdsTipo ?? null,
  IdTipoMovimiento: filtros.IdTipoMovimiento ?? null
});

export const ResumenTipoEmpaqueResponse = (data) => ({
  IdTipo: data.IdTipo,
  NombreTipo: data.NombreTipo,
  Ingresos: data.Ingresos,
  Salidas: data.Salidas,
  Neto: data.Neto,
  NumeroMovimientos: data.NumeroMovimientos,
  CantidadActual: data.CantidadActual
});

export const MovimientoEmpaqueReporteResponse = (data) => ({
  IdMovimiento: data.IdMovimiento,
  FechaMovimiento: data.FechaMovimiento,
  IdTipo: data.IdTipo,
  NombreTipo: data.NombreTipo,
  IdTipoMovimiento: data.IdTipoMovimiento,
  NombreMovimiento: data.NombreMovimiento,
  Cantidad: data.Cantidad,
  CodigoEmpaque: data.CodigoEmpaque ?? null,
  PesoKg: data.PesoKg ?? null,
  Observacion: data.Observacion ?? null,
  Ci: data.Ci,
  PrimerNombre: data.PrimerNombre,
  ApellidoPaterno: data.ApellidoPaterno,
  NombreRol: data.NombreRol,
  IdLoteEmpaque: data.IdLoteEmpaque ?? null,
  FechaRecepcion: data.FechaRecepcion ?? null,
  CantidadToneladasPedida: data.CantidadToneladasPedida ?? null,
  NombreProveedor: data.NombreProveedor ?? null
});

export const ReporteMovimientosEmpaqueResponse = (data) => ({
  Clase: data.Clase,
  NombreClase: data.NombreClase,
  Unidad: data.Unidad,
  PeriodoInicio: data.PeriodoInicio,
  PeriodoFin: data.PeriodoFin,
  TodosLosTipos: data.TodosLosTipos,
  NombreMovimientoFiltro: data.NombreMovimientoFiltro ?? null,
  Resumen: (data.Resumen ?? []).map(ResumenTipoEmpaqueResponse),
  Movimientos: (data.Movimientos ?? []).map(MovimientoEmpaqueReporteResponse)
});

export const ItemLoteEmpaqueResponse = (data) => ({
  IdTipo: data.IdTipo,
  NombreTipo: data.NombreTipo,
  Cantidad: data.Cantidad,
  PesoKg: data.PesoKg ?? null,
  Codigos: data.Codigos ?? []
});

export const LoteEmpaqueReporteResponse = (data) => ({
  IdLoteEmpaque: data.IdLoteEmpaque,
  FechaRecepcion: data.FechaRecepcion,
  NombreProveedor: data.NombreProveedor,
  CantidadToneladasPedida: data.CantidadToneladasPedida ?? null,
  FechaRegistro: data.FechaRegistro,
  Ci: data.Ci,
  PrimerNombre: data.PrimerNombre,
  ApellidoPaterno: data.ApellidoPaterno,
  NombreRol: data.NombreRol,
  CantidadTotal: data.CantidadTotal,
  PesoTotalKg: data.PesoTotalKg ?? null,
  Items: (data.Items ?? []).map(ItemLoteEmpaqueResponse)
});

export const ResumenLotesTipoEmpaqueResponse = (data) => ({
  IdTipo: data.IdTipo,
  NombreTipo: data.NombreTipo,
  NumeroLotes: data.NumeroLotes,
  Cantidad: data.Cantidad,
  PesoKg: data.PesoKg ?? null
});

export const ReporteLotesEmpaqueResponse = (data) => ({
  Clase: data.Clase,
  NombreClase: data.NombreClase,
  Unidad: data.Unidad,
  PeriodoInicio: data.PeriodoInicio,
  PeriodoFin: data.PeriodoFin,
  TodosLosTipos: data.TodosLosTipos,
  Resumen: (data.Resumen ?? []).map(ResumenLotesTipoEmpaqueResponse),
  Lotes: (data.Lotes ?? []).map(LoteEmpaqueReporteResponse)
});
