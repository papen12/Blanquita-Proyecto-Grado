from pydantic import BaseModel


class IngresoProductoTerminadoItem(BaseModel):
    IdPresentacion: int
    Cantidad: int
    Observacion: str | None = None


class IngresoProductoTerminadoRequest(BaseModel):
    Presentaciones: list[IngresoProductoTerminadoItem]


class IngresoProductoTerminadoResponse(BaseModel):
    IdPresentacion: int
    CodigoPresentacion: str
    NombreProducto: str
    CantidadIngresada: int
    CantidadActual: int



class SalidaProductoTerminadoItem(BaseModel):
    IdPresentacion: int
    Cantidad: int
    Observacion: str | None = None


class SalidaProductoTerminadoRequest(BaseModel):
    Presentaciones: list[SalidaProductoTerminadoItem]


class SalidaProductoTerminadoResponse(BaseModel):
    IdPresentacion: int
    CodigoPresentacion: str
    NombreProducto: str
    CantidadSalida: int
    CantidadActual: int



class AjustePositivoInventarioRequest(BaseModel):
    IdPresentacion: int
    Cantidad: int
    Observacion: str | None = None


class AjustePositivoInventarioResponse(BaseModel):
    IdPresentacion: int
    CodigoPresentacion: str
    NombreProducto: str
    CantidadAjustada: int
    CantidadActual: int


class AjusteNegativoInventarioRequest(BaseModel):
    IdPresentacion: int
    Cantidad: int
    Observacion: str | None = None


class AjusteNegativoInventarioResponse(BaseModel):
    IdPresentacion: int
    CodigoPresentacion: str
    NombreProducto: str
    CantidadAjustada: int
    CantidadActual: int



class VerInventarioProductoTerminadoRequest(BaseModel):
    IdProducto: int | None = None


class VerInventarioProductoTerminadoResponse(BaseModel):
    IdPresentacion: int
    CodigoPresentacion: str
    NombreProducto: str
    TipoContenedor: str
    CantidadRollosUnidades: int | None
    CantidadPorUnidadTerminada: int | None
    CantidadActual: int