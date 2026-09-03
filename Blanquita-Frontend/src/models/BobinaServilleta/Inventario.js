export const ReingresarSubBobinaInventarioRequest = (idSubBobina, observacion) => ({
  IdSubBobina: idSubBobina,
  Observacion: observacion ?? null
});

export const ReingresarSubBobinaInventarioResponse = (data) => ({
  IdSubBobina: data.IdSubBobina,
  IdEstadoMateriaPrima: data.IdEstadoMateriaPrima,
  FechaMovimiento: data.FechaMovimiento
});

export const DarDeBajaSubBobinaRequest = (idSubBobina, observacion) => ({
  IdSubBobina: idSubBobina,
  Observacion: observacion ?? null
});

export const DarDeBajaSubBobinaResponse = (data) => ({
  IdSubBobina: data.IdSubBobina,
  IdEstadoMateriaPrima: data.IdEstadoMateriaPrima,
  FechaMovimiento: data.FechaMovimiento
});

export const ResumenInventarioBobinaServilletaResponse = (data) => ({
  IdTipoBobinaServilleta: data.IdTipoBobinaServilleta,
  NombreTipoBobinaServilleta: data.NombreTipoBobinaServilleta,
  CantidadBobinaServilleta: data.CantidadBobinaServilleta
});

export const DetalleInventarioBobinaServilletaRequest = (idTipoBobinaServilleta) => ({
  IdTipoBobinaServilleta: idTipoBobinaServilleta
});

export const DetalleInventarioBobinaServilletaResponse = (data) => ({
  IdBobinaServilleta: data.IdBobinaServilleta,
  FechaRecepcion: data.FechaRecepcion,
  NombreProveedor: data.NombreProveedor,
  IdUnidad1: data.IdUnidad1,
  CodigoUnidad1: data.CodigoUnidad1,
  IdFormatoSubBobina1: data.IdFormatoSubBobina1,
  DescripcionFormato1: data.DescripcionFormato1,
  IdUnidad2: data.IdUnidad2,
  CodigoUnidad2: data.CodigoUnidad2,
  IdFormatoSubBobina2: data.IdFormatoSubBobina2,
  DescripcionFormato2: data.DescripcionFormato2
});

export const ResumenInventarioSubBobinaServilletaResponse = (data) => ({
  IdTipoMedidaSubBobina: data.IdTipoMedidaSubBobina,
  NombreTipoMedida: data.NombreTipoMedida,
  CantidadSubBobinas: data.CantidadSubBobinas
});

export const DetalleInventarioSubBobinaServilletaRequest = (idTipoMedidaSubBobina) => ({
  IdTipoMedidaSubBobina: idTipoMedidaSubBobina
});

export const DetalleInventarioSubBobinaServilletaResponse = (data) => ({
  IdSubBobinaServilleta: data.IdSubBobinaServilleta,
  CodigoUnidadOrigen: data.CodigoUnidadOrigen
});

export const SubBobinaServilletaFueraInventarioResponse = (data) => ({
  IdSubBobinaServilleta: data.IdSubBobinaServilleta,
  CodigoUnidadOrigen: data.CodigoUnidadOrigen,
  NombreTipoMedida: data.NombreTipoMedida,
  UltimaObservacion: data.UltimaObservacion ?? null,
  FechaUltimoMovimiento: data.FechaUltimoMovimiento ?? null
});
