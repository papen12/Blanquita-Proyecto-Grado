export const ResumenInventarioRodelaResponse = (data) => ({
  IdTipoRodela: data.IdTipoRodela,
  NombreTipoRodela: data.NombreTipoRodela,
  Descripcion: data.Descripcion ?? null,
  CantidadEnAlmacen: data.CantidadEnAlmacen,
  CantidadAbiertas: data.CantidadAbiertas
});

export const DetalleInventarioRodelaRequest = (idTipoRodela) => ({
  IdTipoRodela: idTipoRodela
});

export const DetalleInventarioRodelaResponse = (data) => ({
  IdRodela: data.IdRodela,
  CodigoRodela: data.CodigoRodela,
  CodigoLote: data.CodigoLote,
  FechaRecepcion: data.FechaRecepcion,
  NombreProveedor: data.NombreProveedor,
  TipoEstado: data.TipoEstado
});

export const RodelaEnAlmacenResponse = (data) => ({
  IdRodela: data.IdRodela,
  CodigoRodela: data.CodigoRodela
});

export const TrasladarRodelaRequest = (idRodela, observacion) => ({
  IdRodela: idRodela,
  Observacion: observacion ?? null
});

export const TrasladarRodelaResponse = (data) => ({
  IdRodela: data.IdRodela,
  CodigoRodela: data.CodigoRodela,
  IdEstadoMateriaPrima: data.IdEstadoMateriaPrima,
  FechaMovimiento: data.FechaMovimiento
});

export const CorregirTrasladoRodelaRequest = (idRodela, observacion) => ({
  IdRodela: idRodela,
  Observacion: observacion ?? null
});

export const CorregirTrasladoRodelaResponse = (data) => ({
  IdRodela: data.IdRodela,
  CodigoRodela: data.CodigoRodela,
  IdEstadoMateriaPrima: data.IdEstadoMateriaPrima,
  FechaMovimiento: data.FechaMovimiento
});

export const DarDeBajaRodelaRequest = (idRodela, observacion) => ({
  IdRodela: idRodela,
  Observacion: observacion
});

export const DarDeBajaRodelaResponse = (data) => ({
  IdRodela: data.IdRodela,
  CodigoRodela: data.CodigoRodela,
  IdEstadoMateriaPrima: data.IdEstadoMateriaPrima,
  FechaMovimiento: data.FechaMovimiento
});
