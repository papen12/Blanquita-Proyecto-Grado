from decimal import Decimal

from pydantic import BaseModel, Field

from app.Constants.Cantidades import (
    LONGITUD_MINIMA_NOMBRE_TIPO_BOBINA,
    LONGITUD_MAXIMA_NOMBRE_TIPO_BOBINA,
    LONGITUD_MINIMA_DESCRIPCION,
    LONGITUD_MAXIMA_DESCRIPCION,
    DIAMETRO_MAXIMO_MM,
    CREPADO_MAXIMO_PORCENTAJE,
    RESISTENCIA_MAXIMA_KGF,
)


class TipoBobinaServilletaItem(BaseModel):
    IdTipoBobinaServilleta: int
    NombreTipoBobinaServilleta: str
    Descripcion: str | None
    DiametroMm: Decimal
    CrepadoPorcentaje: Decimal
    ResistenciaKgf: Decimal
    CantidadBobinas: int
    CantidadEnAlmacen: int


class ListarTiposBobinaServilletaRequest(BaseModel):
    Busqueda: str | None = Field(default=None, max_length=50)
    Pagina: int = Field(default=1, ge=1)
    TamanoPagina: int = Field(default=20, ge=1, le=100)


class ListarTiposBobinaServilletaResponse(BaseModel):
    Total: int
    Pagina: int
    TamanoPagina: int
    Tipos: list[TipoBobinaServilletaItem]


class TipoBobinaServilletaEditables(BaseModel):
    Descripcion: str = Field(
        ...,
        min_length=LONGITUD_MINIMA_DESCRIPCION,
        max_length=LONGITUD_MAXIMA_DESCRIPCION,
    )
    DiametroMm: Decimal = Field(..., gt=0, le=DIAMETRO_MAXIMO_MM, decimal_places=2)
    CrepadoPorcentaje: Decimal = Field(
        ..., gt=0, le=CREPADO_MAXIMO_PORCENTAJE, decimal_places=2
    )
    ResistenciaKgf: Decimal = Field(..., gt=0, le=RESISTENCIA_MAXIMA_KGF, decimal_places=2)


class CrearTipoBobinaServilletaRequest(TipoBobinaServilletaEditables):
    NombreTipoBobinaServilleta: str = Field(
        ...,
        min_length=LONGITUD_MINIMA_NOMBRE_TIPO_BOBINA,
        max_length=LONGITUD_MAXIMA_NOMBRE_TIPO_BOBINA,
    )


class EditarTipoBobinaServilletaRequest(TipoBobinaServilletaEditables):
    """El nombre no se edita: queda fijo desde la creación."""

    IdTipoBobinaServilleta: int = Field(..., gt=0)


class TipoBobinaServilletaResponse(BaseModel):
    IdTipoBobinaServilleta: int
    NombreTipoBobinaServilleta: str
    Descripcion: str | None
    DiametroMm: Decimal
    CrepadoPorcentaje: Decimal
    ResistenciaKgf: Decimal
