from datetime import date
from pydantic import BaseModel
from datetime import datetime

class ResumenInventarioPalletResponse(BaseModel):
    IdTipoPallet: int
    NumeroRodelas: int | None
    Descripcion: str | None
    CantidadPallets: int


class DetalleInventarioPalletRequest(BaseModel):
    IdTipoPallet: int


class DetalleInventarioPalletResponse(BaseModel):
    IdPallet: int
    CodigoPallet: str
    CodigoLote: str
    FechaRecepcion: date
    NombreProveedor: str


class ReingresarPalletInventarioRequest(BaseModel):
    IdPallet: int
    Observacion: str | None = None


class ReingresarPalletInventarioResponse(BaseModel):
    IdPallet: int
    IdEstadoMateriaPrima: int
    FechaMovimiento: datetime
