export class IniciarProduccionBobinaTuboRequest {
  constructor(IdBobina1, IdBobina2, IdUsuario) {
    this.IdBobina1 = IdBobina1;
    this.IdBobina2 = IdBobina2;
    this.IdUsuario = IdUsuario;
  }
}

export class IniciarProduccionBobinaTuboResponse {
  constructor(data) {
    this.IdProduccionBobinaTubo = data.IdProduccionBobinaTubo;
    this.FechaInicioProduccion = new Date(data.FechaInicioProduccion);
    this.IdTurno = data.IdTurno;
    this.NombreTurno = data.NombreTurno;
  }
}