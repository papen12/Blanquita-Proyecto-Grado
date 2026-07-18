export class VerResumenInventarioBobinaPapelResponse {
  constructor({ IdTipoBobina, NombreTipoBobina, CantidadBobinas, PesoNetoTotalKg, GramajePromedio }) {
    this.IdTipoBobina = IdTipoBobina;
    this.NombreTipoBobina = NombreTipoBobina;
    this.CantidadBobinas = CantidadBobinas;
    this.PesoNetoTotalKg = PesoNetoTotalKg;
    this.GramajePromedio = GramajePromedio;
  }
}

export class VerDetalleInventarioBobinaPapelRequest {
  constructor({ IdTipoBobina }) {
    this.IdTipoBobina = IdTipoBobina;
  }
}

export class VerDetalleInventarioBobinaPapelResponse {
  constructor({
    IdBobinaPapel,
    CodigoBobina,
    CodigoLote,
    FechaRecepcion,
    NombreProveedor,
    PesoBrutoKg,
    PesoNetoKg,
    Gramaje,
  }) {
    this.IdBobinaPapel = IdBobinaPapel;
    this.CodigoBobina = CodigoBobina;
    this.CodigoLote = CodigoLote;
    this.FechaRecepcion = FechaRecepcion;
    this.NombreProveedor = NombreProveedor;
    this.PesoBrutoKg = PesoBrutoKg;
    this.PesoNetoKg = PesoNetoKg;
    this.Gramaje = Gramaje;
  }
}