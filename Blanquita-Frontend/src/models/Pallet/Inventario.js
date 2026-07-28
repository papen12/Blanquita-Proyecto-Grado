export const ResumenInventarioPalletResponse = (data) => ({
  IdTipoPallet: data.IdTipoPallet,
  NumeroRodelas: data.NumeroRodelas ?? null,
  Descripcion: data.Descripcion ?? null,
  CantidadPallets: data.CantidadPallets
});

export const DetalleInventarioPalletRequest = (idTipoPallet) => ({
  IdTipoPallet: idTipoPallet
});

export const DetalleInventarioPalletResponse = (data) => ({
  IdPallet: data.IdPallet,
  CodigoPallet: data.CodigoPallet,
  CodigoLote: data.CodigoLote,
  FechaRecepcion: data.FechaRecepcion,
  NombreProveedor: data.NombreProveedor
});

export const ReingresarPalletInventarioRequest = (idPallet, observacion) => ({
  IdPallet: idPallet,
  Observacion: observacion ?? null
});

export const ReingresarPalletInventarioResponse = (data) => ({
  IdPallet: data.IdPallet,
  IdEstadoMateriaPrima: data.IdEstadoMateriaPrima,
  FechaMovimiento: data.FechaMovimiento
});

export const DarDeBajaPalletRequest = (idPallet, observacion) => ({
  IdPallet: idPallet,
  Observacion: observacion ?? null
});

export const DarDeBajaPalletResponse = (data) => ({
  IdPallet: data.IdPallet,
  IdEstadoMateriaPrima: data.IdEstadoMateriaPrima,
  FechaMovimiento: data.FechaMovimiento
});

export const PalletFueraInventarioResponse = (data) => ({
  IdPallet: data.IdPallet,
  CodigoPallet: data.CodigoPallet,
  NumeroRodelas: data.NumeroRodelas ?? null,
  Descripcion: data.Descripcion ?? null,
  NombreProveedor: data.NombreProveedor,
  FechaRecepcion: data.FechaRecepcion,
  UltimaObservacion: data.UltimaObservacion ?? null,
  FechaUltimoMovimiento: data.FechaUltimoMovimiento
});