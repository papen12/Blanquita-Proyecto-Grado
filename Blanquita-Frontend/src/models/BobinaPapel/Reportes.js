export const ReporteInventarioBobinaPapelRequest = (idsTipoBobina) => ({
  IdsTipoBobina: idsTipoBobina ?? null
});

export const VerProduccionesBobinaTuboRequest = (filtros = {}) => ({
  FechaInicio: filtros.FechaInicio ?? null,
  FechaFin: filtros.FechaFin ?? null,
  IdTurno: filtros.IdTurno ?? null,
  IdsTipoBobina: filtros.IdsTipoBobina ?? null,
  CodigoBobina: filtros.CodigoBobina ?? null,
  Operador: filtros.Operador ?? null,
  IdEstadoProduccion: filtros.IdEstadoProduccion ?? null,
  Pagina: filtros.Pagina ?? 1,
  TamanoPagina: filtros.TamanoPagina ?? 50
});

export const ProduccionBobinaTuboCatalogoResponse = (data) => ({
  IdProduccionBobinaTubo: data.IdProduccionBobinaTubo,
  NombreEstadoProduccion: data.NombreEstadoProduccion,
  NombreTurno: data.NombreTurno,
  Operador: data.Operador,
  Ci: data.Ci,
  NombreRol: data.NombreRol,
  TipoBobina: data.TipoBobina,
  CodigoBobina1: data.CodigoBobina1,
  CodigoBobina2: data.CodigoBobina2,
  FechaInicioProduccion: data.FechaInicioProduccion,
  FechaFinProduccion: data.FechaFinProduccion ?? null,
  DuracionTotal: data.DuracionTotal ?? null,
  CantidadLogsActual: data.CantidadLogsActual
});

export const VerProduccionesBobinaTuboResponse = (data) => ({
  Total: data.Total,
  Pagina: data.Pagina,
  TamanoPagina: data.TamanoPagina,
  Producciones: (data.Producciones ?? []).map(ProduccionBobinaTuboCatalogoResponse)
});

export const ReporteProduccionBobinaTuboDetalleRequest = (idProduccion, verPausas) => ({
  IdProduccion: idProduccion,
  VerPausas: verPausas ?? false
});

export const ReporteCancelacionProduccionBobinaTuboRequest = (idProduccion) => ({
  IdProduccion: idProduccion
});

export const VerLotesBobinaPapelRequest = (filtros = {}) => ({
  FechaInicio: filtros.FechaInicio ?? null,
  FechaFin: filtros.FechaFin ?? null,
  IdProveedor: filtros.IdProveedor ?? null,
  IdsTipoBobina: filtros.IdsTipoBobina ?? null,
  Pagina: filtros.Pagina ?? 1,
  TamanoPagina: filtros.TamanoPagina ?? 50
});

export const LoteBobinaPapelCatalogoResponse = (data) => ({
  IdLoteBobina: data.IdLoteBobina,
  FechaRecepcion: data.FechaRecepcion,
  NombreProveedor: data.NombreProveedor,
  CantidadBobinas: data.CantidadBobinas
});

export const VerLotesBobinaPapelResponse = (data) => ({
  Total: data.Total,
  Pagina: data.Pagina,
  TamanoPagina: data.TamanoPagina,
  Lotes: (data.Lotes ?? []).map(LoteBobinaPapelCatalogoResponse)
});

export const ReporteLoteBobinaPapelDetalleRequest = (idLoteBobina) => ({
  IdLoteBobina: idLoteBobina
});

export const ReporteLotesPorPeriodoRequest = (fechaInicio, fechaFin) => ({
  FechaInicio: fechaInicio,
  FechaFin: fechaFin
});

export const ReporteProduccionPorPeriodoRequest = (fechaInicio, fechaFin, verCancelaciones) => ({
  FechaInicio: fechaInicio,
  FechaFin: fechaFin,
  VerCancelaciones: verCancelaciones ?? false
});

export const VerBobinasPapelRequest = (filtros = {}) => ({
  CodigoBobina: filtros.CodigoBobina ?? null,
  IdProveedor: filtros.IdProveedor ?? null,
  IdsTipoBobina: filtros.IdsTipoBobina ?? null,
  IdEstadoMateriaPrima: filtros.IdEstadoMateriaPrima ?? null,
  IdBobinaPapel: filtros.IdBobinaPapel ?? null,
  Pagina: filtros.Pagina ?? 1,
  TamanoPagina: filtros.TamanoPagina ?? 50
});

export const BobinaPapelCatalogoResponse = (data) => ({
  IdBobinaPapel: data.IdBobinaPapel,
  CodigoBobina: data.CodigoBobina,
  PesoBrutoKg: data.PesoBrutoKg ?? null,
  Gramaje: data.Gramaje ?? null,
  NombreTipoBobina: data.NombreTipoBobina,
  TipoEstado: data.TipoEstado,
  NombreProveedor: data.NombreProveedor
});

export const VerBobinasPapelResponse = (data) => ({
  Total: data.Total,
  Pagina: data.Pagina,
  TamanoPagina: data.TamanoPagina,
  Bobinas: (data.Bobinas ?? []).map(BobinaPapelCatalogoResponse)
});

export const ReporteHistorialMovimientosBobinaRequest = (idBobinaPapel) => ({
  IdBobinaPapel: idBobinaPapel
});
