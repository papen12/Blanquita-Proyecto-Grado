from decimal import Decimal

from pydantic import BaseModel, Field

from app.Constants.Cantidades import (
    LONGITUD_MINIMA_NOMBRE_TIPO_BOBINA,
    LONGITUD_MAXIMA_NOMBRE_TIPO_BOBINA,
    LONGITUD_MINIMA_DESCRIPCION,
    LONGITUD_MAXIMA_DESCRIPCION,
    DIAMETRO_MAXIMO_MM,
    FORMATO_MAXIMO_MM,
    TARA_MAXIMA_KG,
)


class TipoBobinaPapelItem(BaseModel):
    IdTipoBobina: int
    NombreTipoBobina: str
    Descripcion: str | None
    DiametroMm: Decimal
    Formato: Decimal
    TaraKg: Decimal
    CantidadBobinas: int
    CantidadEnAlmacen: int


class ListarTiposBobinaPapelRequest(BaseModel):
    Busqueda: str | None = Field(default=None, max_length=50)
    Pagina: int = Field(default=1, ge=1)
    TamanoPagina: int = Field(default=20, ge=1, le=100)


class ListarTiposBobinaPapelResponse(BaseModel):
    Total: int
    Pagina: int
    TamanoPagina: int
    Tipos: list[TipoBobinaPapelItem]


class TipoBobinaPapelEditables(BaseModel):
    Descripcion: str = Field(
        ...,
        min_length=LONGITUD_MINIMA_DESCRIPCION,
        max_length=LONGITUD_MAXIMA_DESCRIPCION,
    )
    DiametroMm: Decimal = Field(..., gt=0, le=DIAMETRO_MAXIMO_MM, decimal_places=2)
    Formato: Decimal = Field(..., gt=0, le=FORMATO_MAXIMO_MM, decimal_places=2)
    TaraKg: Decimal = Field(..., gt=0, le=TARA_MAXIMA_KG, decimal_places=2)


class CrearTipoBobinaPapelRequest(TipoBobinaPapelEditables):
    NombreTipoBobina: str = Field(
        ...,
        min_length=LONGITUD_MINIMA_NOMBRE_TIPO_BOBINA,
        max_length=LONGITUD_MAXIMA_NOMBRE_TIPO_BOBINA,
    )


class EditarTipoBobinaPapelRequest(TipoBobinaPapelEditables):
    """El nombre no se edita: queda fijo desde la creación."""

    IdTipoBobina: int = Field(..., gt=0)


class TipoBobinaPapelResponse(BaseModel):
    IdTipoBobina: int
    NombreTipoBobina: str
    Descripcion: str | None
    DiametroMm: Decimal
    Formato: Decimal
    TaraKg: Decimal
