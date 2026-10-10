export const CatalogoInsumoResponse = (data) => ({
  IdInventarioInsumo: data.IdInventarioInsumo,
  IdTipoInsumo: data.IdTipoInsumo,
  CantidadActual: data.CantidadActual,
  NombreInsumo: data.NombreInsumo,
  DescripcionInsumo: data.DescripcionInsumo ?? null
});

export const MovimientoInsumoRequest = (idTipoInsumo, cantidad, observacion) => ({
  IdTipoInsumo: idTipoInsumo,
  Cantidad: cantidad,
  Observacion: observacion
});

export const MovimientoInsumoResponse = (data) => ({
  IdMovimientoInsumo: data.IdMovimientoInsumo,
  IdTipoInsumo: data.IdTipoInsumo,
  NombreInsumo: data.NombreInsumo,
  NombreMovimiento: data.NombreMovimiento,
  CantidadMovimiento: data.CantidadMovimiento,
  CantidadActual: data.CantidadActual,
  FechaMovimiento: data.FechaMovimiento
});
