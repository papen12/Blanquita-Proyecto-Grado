export const TipoBobinaPapelItem = (data) => ({
  IdTipoBobina: data.IdTipoBobina,
  NombreTipoBobina: data.NombreTipoBobina,
  DiametroMm: Number(data.DiametroMm),
  Formato: Number(data.Formato),
  TaraKg: Number(data.TaraKg),
  CantidadBobinas: data.CantidadBobinas ?? 0,
  CantidadEnAlmacen: data.CantidadEnAlmacen ?? 0,
});

export const TipoBobinaPapelDatos = (datos) => ({
  NombreTipoBobina: (datos.NombreTipoBobina ?? "").trim().replace(/\s+/g, " "),
  DiametroMm: Number(datos.DiametroMm),
  Formato: Number(datos.Formato),
  TaraKg: Number(datos.TaraKg),
});

export const EditarTipoBobinaPapelRequest = (idTipoBobina, datos) => ({
  IdTipoBobina: idTipoBobina,
  ...TipoBobinaPapelDatos(datos),
});

export const TipoBobinaPapelResponse = (data) => ({
  IdTipoBobina: data.IdTipoBobina,
  NombreTipoBobina: data.NombreTipoBobina,
  DiametroMm: Number(data.DiametroMm),
  Formato: Number(data.Formato),
  TaraKg: Number(data.TaraKg),
});
