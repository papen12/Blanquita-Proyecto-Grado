export const UnidadBobinaServilletaItem = (data) => ({
  CodigoBobina: data.CodigoBobina,
  IdFormatoSubBobina: data.IdFormatoSubBobina,
  PesoBrutoKg: data.PesoBrutoKg ?? null,
  GramajeGr: data.GramajeGr ?? null
});

export const BobinaServilletaItem = (data) => ({
  Unidades: (data.Unidades ?? []).map(UnidadBobinaServilletaItem)
});

export const IngresoBobinaServilletaRequest = (idProveedor, idTipoBobinaServilleta, bobinas) => ({
  IdProveedor: idProveedor,
  IdTipoBobinaServilleta: idTipoBobinaServilleta,
  Bobinas: (bobinas ?? []).map(BobinaServilletaItem)
});

export const IngresoBobinaServilletaResponse = (data) => ({
  FechaRecepcion: data.FechaRecepcion,
  CantidadBobinasServilleta: data.CantidadBobinasServilleta,
  CantidadUnidades: data.CantidadUnidades
});
