from datetime import datetime

from pydantic import BaseModel, Field


class CatalogoInsumoResponse(BaseModel):
    IdInventarioInsumo: int
    IdTipoInsumo: int
    CantidadActual: int
    NombreInsumo: str
    DescripcionInsumo: str | None = None


class MovimientoInsumoRequest(BaseModel):
    IdTipoInsumo: int = Field(..., gt=0)
    Cantidad: int
    Observacion: str


class MovimientoInsumoResponse(BaseModel):
    IdMovimientoInsumo: int
    IdTipoInsumo: int
    NombreInsumo: str
    NombreMovimiento: str
    CantidadMovimiento: int
    CantidadActual: int
    FechaMovimiento: datetime
