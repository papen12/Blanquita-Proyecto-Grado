from typing import Literal

from pydantic import BaseModel, Field, model_validator

from app.Constants.Cantidades import (
    LONGITUD_MINIMA_NOMBRE_LINEA,
    LONGITUD_MAXIMA_NOMBRE_LINEA,
    CANTIDAD_MINIMA_ROLLOS,
    CANTIDAD_MAXIMA_ROLLOS,
    CANTIDAD_MINIMA_UNIDADES,
    CANTIDAD_MAXIMA_UNIDADES,
    CANTIDAD_MAXIMA_POR_UNIDAD_TERMINADA,
)

LIMITES_CANTIDAD = {
    "Rollos": (CANTIDAD_MINIMA_ROLLOS, CANTIDAD_MAXIMA_ROLLOS),
    "Unidades": (CANTIDAD_MINIMA_UNIDADES, CANTIDAD_MAXIMA_UNIDADES),
}


class LineaItem(BaseModel):
    IdProducto: int
    NombreProducto: str
    SiglasProducto: str
    CantidadPresentaciones: int


class CrearLineaRequest(BaseModel):
    NombreProducto: str = Field(
        ...,
        min_length=LONGITUD_MINIMA_NOMBRE_LINEA,
        max_length=LONGITUD_MAXIMA_NOMBRE_LINEA,
    )
    SiglasProducto: str = Field(..., pattern=r"^[A-Za-z]{3}$")


class LineaResponse(BaseModel):
    IdProducto: int
    NombreProducto: str
    SiglasProducto: str


class PresentacionItem(BaseModel):
    IdPresentacion: int
    IdProducto: int
    TipoContenedor: str
    CantidadRollosUnidades: int | None
    CantidadPorUnidadTerminada: int | None
    CodigoPresentacion: str
    NombreProducto: str


class CrearPresentacionRequest(BaseModel):
    IdProducto: int = Field(..., gt=0)
    TipoContenedor: Literal["Jaba", "Plancha"]
    TipoCantidad: Literal["Rollos", "Unidades"]
    CantidadRollosUnidades: int
    CantidadPorUnidadTerminada: int = Field(
        ..., gt=0, le=CANTIDAD_MAXIMA_POR_UNIDAD_TERMINADA
    )

    @model_validator(mode="after")
    def Validar(self):
        if self.TipoCantidad == "Unidades" and self.TipoContenedor != "Jaba":
            raise ValueError("Los productos por unidades solo se empacan en jaba")

        minimo, maximo = LIMITES_CANTIDAD[self.TipoCantidad]
        if not minimo <= self.CantidadRollosUnidades <= maximo:
            raise ValueError(
                f"La cantidad de {self.TipoCantidad.lower()} debe estar entre {minimo} y {maximo}"
            )
        return self


class PresentacionResponse(PresentacionItem):
    pass
