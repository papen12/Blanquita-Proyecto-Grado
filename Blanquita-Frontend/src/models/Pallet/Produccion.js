export const IniciarProduccionPalletRequest = (idPallet) => ({
  IdPallet: idPallet
});

export const IniciarProduccionPalletResponse = (data) => ({
  IdProduccionPalletTubo: data.IdProduccionPalletTubo,
  FechaInicioProduccion: data.FechaInicioProduccion,
  IdTurno: data.IdTurno,
  NombreTurno: data.NombreTurno
});

export const PausaProduccionPalletRequest = (idProduccionPalletTubo, motivoPausaProduccion) => ({
  IdProduccionPalletTubo: idProduccionPalletTubo,
  MotivoPausaProduccion: motivoPausaProduccion ?? null
});

export const PausaProduccionPalletResponse = (data) => ({
  IdPausaProduccionPalletTubo: data.IdPausaProduccionPalletTubo,
  IdProduccionPalletTubo: data.IdProduccionPalletTubo,
  FechaHoraPausa: data.FechaHoraPausa,
  MotivoPausaProduccion: data.MotivoPausaProduccion ?? null,
  FechaHoraReanudacion: data.FechaHoraReanudacion ?? null,
  IdEstadoProduccion: data.IdEstadoProduccion
});

export const ReanudarProduccionPalletRequest = (idProduccionPalletTubo) => ({
  IdProduccionPalletTubo: idProduccionPalletTubo
});

export const ReanudarProduccionPalletResponse = (data) => ({
  IdPausaProduccionPalletTubo: data.IdPausaProduccionPalletTubo,
  IdProduccionPalletTubo: data.IdProduccionPalletTubo,
  FechaHoraPausa: data.FechaHoraPausa,
  MotivoPausaProduccion: data.MotivoPausaProduccion ?? null,
  FechaHoraReanudacion: data.FechaHoraReanudacion,
  IdEstadoProduccion: data.IdEstadoProduccion
});

export const FinalizarProduccionPalletRequest = (idProduccionPalletTubo) => ({
  IdProduccionPalletTubo: idProduccionPalletTubo
});

export const FinalizarProduccionPalletResponse = (data) => ({
  IdProduccionPalletTubo: data.IdProduccionPalletTubo,
  FechaFinProduccion: data.FechaFinProduccion,
  IdEstadoProduccion: data.IdEstadoProduccion,
  NombreEstadoProduccion: data.NombreEstadoProduccion
});

export const CancelarProduccionPalletRequest = (idProduccionPalletTubo, motivoCancelacion) => ({
  IdProduccionPalletTubo: idProduccionPalletTubo,
  MotivoCancelacion: motivoCancelacion ?? null
});

export const CancelarProduccionPalletResponse = (data) => ({
  IdCancelacionProduccionPalletTubo: data.IdCancelacionProduccionPalletTubo,
  IdProduccionPalletTubo: data.IdProduccionPalletTubo,
  FechaHoraCancelacion: data.FechaHoraCancelacion,
  MotivoCancelacion: data.MotivoCancelacion ?? null,
  IdEstadoProduccion: data.IdEstadoProduccion
});

export const VerProduccionPalletRequest = (idTipoPallet) => ({
  IdTipoPallet: idTipoPallet ?? null
});

export const VerProduccionPalletResponse = (data) => ({
  IdProduccionPalletTubo: data.IdProduccionPalletTubo,
  NombreEstadoProduccion: data.NombreEstadoProduccion,
  CodigoPallet: data.CodigoPallet,
  IdTipoPallet: data.IdTipoPallet,
  NombreTurno: data.NombreTurno,
  FechaInicioProduccion: data.FechaInicioProduccion
});

export const VerPausasProduccionPalletActivasRequest = (idTipoPallet) => ({
  IdTipoPallet: idTipoPallet ?? null
});

export const VerPausasProduccionPalletActivasResponse = (data) => ({
  IdPausaProduccionPalletTubo: data.IdPausaProduccionPalletTubo,
  IdProduccionPalletTubo: data.IdProduccionPalletTubo,
  CodigoPallet: data.CodigoPallet,
  IdTipoPallet: data.IdTipoPallet,
  FechaHoraPausa: data.FechaHoraPausa,
  NombreEstadoProduccion: data.NombreEstadoProduccion
});