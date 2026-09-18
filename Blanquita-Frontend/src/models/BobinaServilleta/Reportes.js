export const ReporteInventarioBobinaServilletaRequest = (idsTipoBobinaServilleta) => ({
  IdsTipoBobinaServilleta: idsTipoBobinaServilleta ?? null
});

export const VerBobinasServilletaRequest = (filtros = {}) => ({
  CodigoBobina: filtros.CodigoBobina ?? null,
  IdProveedor: filtros.IdProveedor ?? null,
  IdTipoBobinaServilleta: filtros.IdTipoBobinaServilleta ?? null,
  IdEstadoMateriaPrima: filtros.IdEstadoMateriaPrima ?? null,
  IdBobinaServilleta: filtros.IdBobinaServilleta ?? null,
  Pagina: filtros.Pagina ?? 1,
  TamanoPagina: filtros.TamanoPagina ?? 50
});

export const BobinaServilletaCatalogoResponse = (data) => ({
  IdBobinaServilleta: data.IdBobinaServilleta,
  TipoEstado: data.TipoEstado,
  NombreTipoBobinaServilleta: data.NombreTipoBobinaServilleta,
  CodigoLote: data.CodigoLote,
  FechaRecepcion: data.FechaRecepcion,
  NombreProveedor: data.NombreProveedor,
  IdUnidad1: data.IdUnidad1 ?? null,
  CodigoUnidad1: data.CodigoUnidad1 ?? null,
  DescripcionFormato1: data.DescripcionFormato1 ?? null,
  PesoBrutoKg1: data.PesoBrutoKg1 ?? null,
  GramajeGr1: data.GramajeGr1 ?? null,
  IdUnidad2: data.IdUnidad2 ?? null,
  CodigoUnidad2: data.CodigoUnidad2 ?? null,
  DescripcionFormato2: data.DescripcionFormato2 ?? null,
  PesoBrutoKg2: data.PesoBrutoKg2 ?? null,
  GramajeGr2: data.GramajeGr2 ?? null
});

export const VerBobinasServilletaResponse = (data) => ({
  Total: data.Total,
  Pagina: data.Pagina,
  TamanoPagina: data.TamanoPagina,
  Bobinas: (data.Bobinas ?? []).map(BobinaServilletaCatalogoResponse)
});
