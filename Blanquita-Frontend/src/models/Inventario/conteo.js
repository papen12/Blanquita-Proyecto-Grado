const numeroONulo = (valor) => (valor === null || valor === undefined ? null : Number(valor));

export const IniciarConteoRequest = ({ Motivo }) => ({ Motivo });

export const RegistrarCantidadesConteoRequest = (cantidades) => ({
  Cantidades: cantidades.map(({ IdPresentacion, CantidadFisica }) => ({
    IdPresentacion,
    CantidadFisica: Number(CantidadFisica),
  })),
});

export const CerrarConteoRequest = ({ Motivos, Reconteos = [], Confirmado }) => ({
  Motivos: Object.entries(Motivos).map(([IdPresentacion, Motivo]) => ({
    IdPresentacion: Number(IdPresentacion),
    Motivo,
  })),
  Reconteos: Reconteos.map(Number),
  Confirmado: Boolean(Confirmado),
});

export const AnularConteoRequest = ({ Motivo, Confirmado }) => ({
  Motivo,
  Confirmado: Boolean(Confirmado),
});

export const DetalleConteoResponse = (data) => ({
  IdPresentacion: data.IdPresentacion,
  CodigoPresentacion: data.CodigoPresentacion,
  IdProducto: data.IdProducto,
  NombreProducto: data.NombreProducto,
  NombrePresentacion: data.NombrePresentacion,
  Unidad: data.Unidad,
  TipoContenedor: data.TipoContenedor,
  CantidadPorUnidadTerminada: data.CantidadPorUnidadTerminada ?? null,
  Activo: Boolean(data.Activo),
  CantidadSistema: Number(data.CantidadSistema ?? 0),
  CantidadFisica: numeroONulo(data.CantidadFisica),
  Diferencia: numeroONulo(data.Diferencia),
  TipoDiferencia: data.TipoDiferencia ?? null,
  PorcentajeDiferencia: numeroONulo(data.PorcentajeDiferencia),
  Nivel: data.Nivel ?? null,
  RequiereReconteo: Boolean(data.RequiereReconteo),
  MotivoDiferencia: data.MotivoDiferencia ?? null,
  UsuarioConteo: data.UsuarioConteo ?? null,
  FechaHoraConteo: data.FechaHoraConteo ?? null,
  IdMovimientoProductoTerminado: data.IdMovimientoProductoTerminado ?? null,
});

export const IndicadorLineaConteoResponse = (data) => ({
  IdProducto: data.IdProducto,
  NombreProducto: data.NombreProducto,
  Unidad: data.Unidad,
  CantidadSistema: Number(data.CantidadSistema ?? 0),
  Faltante: Number(data.Faltante ?? 0),
  Sobrante: Number(data.Sobrante ?? 0),
  PorcentajeDiferencia: Number(data.PorcentajeDiferencia ?? 0),
  PorcentajeFaltante: Number(data.PorcentajeFaltante ?? 0),
  PorcentajeSobrante: Number(data.PorcentajeSobrante ?? 0),
  Nivel: data.Nivel,
});

export const IndicadoresConteoResponse = (data) => ({
  PorcentajeDiferencia: Number(data.PorcentajeDiferencia ?? 0),
  PorcentajeFaltante: Number(data.PorcentajeFaltante ?? 0),
  PorcentajeSobrante: Number(data.PorcentajeSobrante ?? 0),
  Nivel: data.Nivel,
  PorcentajeAdecuado: Number(data.PorcentajeAdecuado ?? 0),
  PorcentajeAtencion: Number(data.PorcentajeAtencion ?? 0),
  Lineas: (data.Lineas ?? []).map(IndicadorLineaConteoResponse),
});

export const ResumenConteoResponse = (data) => ({
  IdConteoProductoTerminado: data.IdConteoProductoTerminado,
  Estado: data.Estado,
  UsuarioInicio: data.UsuarioInicio,
  FechaHoraInicio: data.FechaHoraInicio,
  MotivoInicio: data.MotivoInicio,
  UsuarioCierre: data.UsuarioCierre ?? null,
  FechaHoraCierre: data.FechaHoraCierre ?? null,
  MotivoAnulacion: data.MotivoAnulacion ?? null,
  TotalPresentaciones: Number(data.TotalPresentaciones ?? 0),
  Contadas: Number(data.Contadas ?? 0),
  ConDiferencia: Number(data.ConDiferencia ?? 0),
  Faltante: Number(data.Faltante ?? 0),
  Sobrante: Number(data.Sobrante ?? 0),
  Atrasado: Boolean(data.Atrasado),
  Indicadores: data.Indicadores ? IndicadoresConteoResponse(data.Indicadores) : null,
});

export const ConteoResponse = (data) => ({
  ...ResumenConteoResponse(data),
  Detalle: (data.Detalle ?? []).map(DetalleConteoResponse),
});

export const EstadoConteoResponse = (data) => ({
  Abierto: Boolean(data?.Abierto),
  HorasAlerta: Number(data?.HorasAlerta ?? 0),
  Conteo: data?.Conteo ? ConteoResponse(data.Conteo) : null,
});
