export const PalletItem = (codigoPallet) => ({
  CodigoPallet: codigoPallet
});

export const IngresoPalletRequest = (idProveedor, idTipoPallet, pallets) => ({
  IdProveedor: idProveedor,
  IdTipoPallet: idTipoPallet,
  Pallets: pallets.map(PalletItem)
});

export const IngresoPalletResponse = (data) => ({
  FechaRecepcion: data.FechaRecepcion,
  CantidadPallets: data.CantidadPallets
});