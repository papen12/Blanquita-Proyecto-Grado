export const TipoBobinaServilletaItem = (data) => ({
  IdTipoBobinaServilleta: data.IdTipoBobinaServilleta,
  NombreTipoBobinaServilleta: data.NombreTipoBobinaServilleta,
  DiametroMm: Number(data.DiametroMm),
  CrepadoPorcentaje: Number(data.CrepadoPorcentaje),
  ResistenciaKgf: Number(data.ResistenciaKgf),
  CantidadBobinas: data.CantidadBobinas ?? 0,
  CantidadEnAlmacen: data.CantidadEnAlmacen ?? 0,
});

export const TipoBobinaServilletaDatos = (datos) => ({
  NombreTipoBobinaServilleta: (datos.NombreTipoBobinaServilleta ?? "").trim().replace(/\s+/g, " "),
  DiametroMm: Number(datos.DiametroMm),
  CrepadoPorcentaje: Number(datos.CrepadoPorcentaje),
  ResistenciaKgf: Number(datos.ResistenciaKgf),
});

export const EditarTipoBobinaServilletaRequest = (idTipoBobinaServilleta, datos) => ({
  IdTipoBobinaServilleta: idTipoBobinaServilleta,
  ...TipoBobinaServilletaDatos(datos),
});

export const TipoBobinaServilletaResponse = (data) => ({
  IdTipoBobinaServilleta: data.IdTipoBobinaServilleta,
  NombreTipoBobinaServilleta: data.NombreTipoBobinaServilleta,
  DiametroMm: Number(data.DiametroMm),
  CrepadoPorcentaje: Number(data.CrepadoPorcentaje),
  ResistenciaKgf: Number(data.ResistenciaKgf),
});
