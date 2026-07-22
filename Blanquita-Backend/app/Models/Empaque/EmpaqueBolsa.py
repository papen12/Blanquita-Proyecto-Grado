from datetime import date
from pydantic import BaseModel


class EmpaqueBolsaItem(BaseModel):
    IdTipoEmpaqueBolsa: int
    CantidadMovimiento: int
    Observacion: str | None = None


class IngresoEmpaqueBolsaRequest(BaseModel):
    IdProveedor: int
    CantidadToneladasPedida: float | None = None
    EmpaquesBolsa: list[EmpaqueBolsaItem]


class IngresoEmpaqueBolsaResponse(BaseModel):
    FechaRecepcion: date
    IdTipoEmpaqueBolsa: int
    NombreEmpaqueBolsa: str
    CantidadIngresada: int
    CantidadActual: int



class DescontarEmpaqueBolsaItem(BaseModel):
    IdTipoEmpaqueBolsa: int
    CantidadMovimiento: int
    Observacion: str | None = None


class DescontarEmpaqueBolsaRequest(BaseModel):
    EmpaquesBolsa: list[DescontarEmpaqueBolsaItem]


class DescontarEmpaqueBolsaResponse(BaseModel):
    IdTipoEmpaqueBolsa: int
    NombreEmpaqueBolsa: str
    CantidadDescontada: int
    CantidadActual: int



class ReingresarEmpaqueBolsaRequest(BaseModel):
    IdTipoEmpaqueBolsa: int
    CantidadMovimiento: int
    Observacion: str | None = None


class ReingresarEmpaqueBolsaResponse(BaseModel):
    IdTipoEmpaqueBolsa: int
    NombreEmpaqueBolsa: str
    CantidadReingresada: int
    CantidadActual: int



class CatalogoEmpaqueBolsaResponse(BaseModel):
    IdTipoEmpaqueBolsa: int
    NombreEmpaqueBolsa: str
    DescripcionEmpaqueBolsa: str | None = None
    CantidadActual: int