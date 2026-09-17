export const VerRodelasRequest = (filtros = {}) => ({
  CodigoRodela: filtros.CodigoRodela ?? null,
  IdProveedor: filtros.IdProveedor ?? null,
  IdsTipoRodela: filtros.IdsTipoRodela ?? null,
  IdEstadoMateriaPrima: filtros.IdEstadoMateriaPrima ?? null,
  IdLoteRodela: filtros.IdLoteRodela ?? null,
  Pagina: filtros.Pagina ?? 1,
  TamanoPagina: filtros.TamanoPagina ?? 50
});

export const RodelaCatalogoResponse = (data) => ({
  IdRodela: data.IdRodela,
  CodigoRodela: data.CodigoRodela,
  TipoEstado: data.TipoEstado,
  NombreTipoRodela: data.NombreTipoRodela,
  NombreProveedor: data.NombreProveedor,
  FechaRecepcion: data.FechaRecepcion,
  IdLoteRodela: data.IdLoteRodela
});

export const VerRodelasResponse = (data) => ({
  Total: data.Total,
  Pagina: data.Pagina,
  TamanoPagina: data.TamanoPagina,
  Rodelas: (data.Rodelas ?? []).map(RodelaCatalogoResponse)
});

export const ReporteInventarioRodelaRequest = (idsTipoRodela) => ({
  IdsTipoRodela: idsTipoRodela ?? null
});

export const ReporteHistorialMovimientosRodelaRequest = (idRodela) => ({
  IdRodela: idRodela
});

export const VerLotesRodelaRequest = (filtros = {}) => ({
  FechaInicio: filtros.FechaInicio ?? null,
  FechaFin: filtros.FechaFin ?? null,
  IdProveedor: filtros.IdProveedor ?? null,
  IdsTipoRodela: filtros.IdsTipoRodela ?? null,
  Pagina: filtros.Pagina ?? 1,
  TamanoPagina: filtros.TamanoPagina ?? 50
});

export const LoteRodelaCatalogoResponse = (data) => ({
  IdLoteRodela: data.IdLoteRodela,
  FechaRecepcion: data.FechaRecepcion,
  NombreProveedor: data.NombreProveedor,
  CantidadRodelas: data.CantidadRodelas
});

export const VerLotesRodelaResponse = (data) => ({
  Total: data.Total,
  Pagina: data.Pagina,
  TamanoPagina: data.TamanoPagina,
  Lotes: (data.Lotes ?? []).map(LoteRodelaCatalogoResponse)
});

export const ReporteLoteRodelaDetalleRequest = (idLoteRodela) => ({
  IdLoteRodela: idLoteRodela
});

export const ReporteLotesRodelaPorPeriodoRequest = (fechaInicio, fechaFin) => ({
  FechaInicio: fechaInicio,
  FechaFin: fechaFin
});
