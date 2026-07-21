from datetime import date
from pydantic import BaseModel


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