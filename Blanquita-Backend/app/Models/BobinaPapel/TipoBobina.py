from decimal import Decimal

from pydantic import BaseModel, Field

from app.Constants.Cantidades import (
    LONGITUD_MINIMA_NOMBRE_TIPO_BOBINA,
    LONGITUD_MAXIMA_NOMBRE_TIPO_BOBINA,
    DIAMETRO_MAXIMO_MM,
    FORMATO_MAXIMO_MM,
    TARA_MAXIMA_KG,
)


class TipoBobinaPapelItem(BaseModel):
    IdTipoBobina: int
    NombreTipoBobina: str
    DiametroMm: Decimal
    Formato: Decimal
    TaraKg: Decimal
    CantidadBobinas: int
    CantidadEnAlmacen: int


class TipoBobinaPapelDatos(BaseModel):
    NombreTipoBobina: str = Field(
        ...,
        min_length=LONGITUD_MINIMA_NOMBRE_TIPO_BOBINA,
        max_length=LONGITUD_MAXIMA_NOMBRE_TIPO_BOBINA,
    )
    DiametroMm: Decimal = Field(..., gt=0, le=DIAMETRO_MAXIMO_MM, decimal_places=2)
    Formato: Decimal = Field(..., gt=0, le=FORMATO_MAXIMO_MM, decimal_places=2)
    TaraKg: Decimal = Field(..., gt=0, le=TARA_MAXIMA_KG, decimal_places=2)


class CrearTipoBobinaPapelRequest(TipoBobinaPapelDatos):
    pass


class EditarTipoBobinaPapelRequest(TipoBobinaPapelDatos):
    IdTipoBobina: int = Field(..., gt=0)


class TipoBobinaPapelResponse(BaseModel):
    IdTipoBobina: int
    NombreTipoBobina: str
    DiametroMm: Decimal
    Formato: Decimal
    TaraKg: Decimal
