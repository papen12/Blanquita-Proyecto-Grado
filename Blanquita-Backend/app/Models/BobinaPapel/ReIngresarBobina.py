from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ReingresarBobinaAInventarioRequest(BaseModel):
    IdBobinaPapel: int
    IdUsuario: int
    Observacion: Optional[str] = None


class ReingresarBobinaAInventarioResponse(BaseModel):
    IdBobinaPapel: int
    IdEstadoMateriaPrima: int
    FechaMovimiento: datetime