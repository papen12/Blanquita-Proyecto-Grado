from pydantic import BaseModel, Field, model_validator

from app.Constants.Cantidades import (
    LONGITUD_MINIMA_NOMBRE_LINEA,
    LONGITUD_MAXIMA_NOMBRE_LINEA,
    LONGITUD_MINIMA_TIPO_CONTENEDOR,
    LONGITUD_MAXIMA_TIPO_CONTENEDOR,
    LONGITUD_MINIMA_CODIGO_PRESENTACION,
    LONGITUD_MAXIMA_CODIGO_PRESENTACION,
    CANTIDAD_MAXIMA_ROLLOS_UNIDADES,
    CANTIDAD_MAXIMA_POR_UNIDAD_TERMINADA,
)


class LineaItem(BaseModel):
    IdProducto: int
    NombreProducto: str
    CantidadPresentaciones: int


class CrearLineaRequest(BaseModel):
    NombreProducto: str = Field(
        ...,
        min_length=LONGITUD_MINIMA_NOMBRE_LINEA,
        max_length=LONGITUD_MAXIMA_NOMBRE_LINEA,
    )


class LineaResponse(BaseModel):
    IdProducto: int
    NombreProducto: str


class PresentacionItem(BaseModel):
    IdPresentacion: int
    IdProducto: int
    TipoContenedor: str
    CantidadRollosUnidades: int | None
    CantidadPorUnidadTerminada: int | None
    CodigoPresentacion: str
    NombreProducto: str


class CrearPresentacionRequest(BaseModel):
    """Se envía `IdProducto` para usar una línea existente o `NombreLineaNueva` para crearla."""

    IdProducto: int | None = Field(None, gt=0)
    NombreLineaNueva: str | None = Field(
        None,
        min_length=LONGITUD_MINIMA_NOMBRE_LINEA,
        max_length=LONGITUD_MAXIMA_NOMBRE_LINEA,
    )
    TipoContenedor: str = Field(
        ...,
        min_length=LONGITUD_MINIMA_TIPO_CONTENEDOR,
        max_length=LONGITUD_MAXIMA_TIPO_CONTENEDOR,
    )
    CantidadRollosUnidades: int = Field(..., gt=0, le=CANTIDAD_MAXIMA_ROLLOS_UNIDADES)
    CantidadPorUnidadTerminada: int = Field(
        ..., gt=0, le=CANTIDAD_MAXIMA_POR_UNIDAD_TERMINADA
    )
    CodigoPresentacion: str = Field(
        ...,
        min_length=LONGITUD_MINIMA_CODIGO_PRESENTACION,
        max_length=LONGITUD_MAXIMA_CODIGO_PRESENTACION,
    )

    @model_validator(mode="after")
    def UnaSolaLinea(self):
        if (self.IdProducto is None) == (self.NombreLineaNueva is None):
            raise ValueError("Debe elegir una línea existente o indicar una línea nueva, no ambas")
        return self


class PresentacionResponse(PresentacionItem):
    LineaCreada: bool
