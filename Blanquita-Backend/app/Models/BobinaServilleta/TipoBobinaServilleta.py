from decimal import Decimal

from pydantic import BaseModel, Field

from app.Constants.Cantidades import (
    LONGITUD_MINIMA_NOMBRE_TIPO_BOBINA,
    LONGITUD_MAXIMA_NOMBRE_TIPO_BOBINA,
    DIAMETRO_MAXIMO_MM,
    CREPADO_MAXIMO_PORCENTAJE,
    RESISTENCIA_MAXIMA_KGF,
)


class TipoBobinaServilletaItem(BaseModel):
    IdTipoBobinaServilleta: int
    NombreTipoBobinaServilleta: str
    DiametroMm: Decimal
    CrepadoPorcentaje: Decimal
    ResistenciaKgf: Decimal
    CantidadBobinas: int
    CantidadEnAlmacen: int


class TipoBobinaServilletaDatos(BaseModel):
    NombreTipoBobinaServilleta: str = Field(
        ...,
        min_length=LONGITUD_MINIMA_NOMBRE_TIPO_BOBINA,
        max_length=LONGITUD_MAXIMA_NOMBRE_TIPO_BOBINA,
    )
    DiametroMm: Decimal = Field(..., gt=0, le=DIAMETRO_MAXIMO_MM, decimal_places=2)
    CrepadoPorcentaje: Decimal = Field(
        ..., gt=0, le=CREPADO_MAXIMO_PORCENTAJE, decimal_places=2
    )
    ResistenciaKgf: Decimal = Field(..., gt=0, le=RESISTENCIA_MAXIMA_KGF, decimal_places=2)


class CrearTipoBobinaServilletaRequest(TipoBobinaServilletaDatos):
    pass


class EditarTipoBobinaServilletaRequest(TipoBobinaServilletaDatos):
    IdTipoBobinaServilleta: int = Field(..., gt=0)


class TipoBobinaServilletaResponse(BaseModel):
    IdTipoBobinaServilleta: int
    NombreTipoBobinaServilleta: str
    DiametroMm: Decimal
    CrepadoPorcentaje: Decimal
    ResistenciaKgf: Decimal
