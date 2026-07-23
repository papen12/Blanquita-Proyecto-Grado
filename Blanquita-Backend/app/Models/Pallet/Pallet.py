from datetime import date

from pydantic import BaseModel


class PalletItem(BaseModel):
    CodigoPallet: str


class IngresoPalletRequest(BaseModel):
    IdProveedor: int
    IdTipoPallet: int
    Pallets: list[PalletItem]


class IngresoPalletResponse(BaseModel):
    FechaRecepcion: date
    CantidadPallets: int