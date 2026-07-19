export class VerProduccionBobinaTuboRequest {
  constructor(IdTipoBobina = null) {
    this.IdTipoBobina = IdTipoBobina;
  }
}

export class VerProduccionBobinaTuboResponse {
  constructor(data) {
    this.IdProduccionBobinaTubo = data.IdProduccionBobinaTubo;
    this.IdTipoBobina = data.IdTipoBobina;
    this.NombreTipoBobina = data.NombreTipoBobina;
    this.NombreEstadoProduccion = data.NombreEstadoProduccion;
    this.CodigoBobina1 = data.CodigoBobina1;
    this.CodigoBobina2 = data.CodigoBobina2;
    this.NombreTurno = data.NombreTurno;
    this.FechaInicioProduccion = new Date(data.FechaInicioProduccion);
    this.CantidadLogsActual = data.CantidadLogsActual;
  }
}