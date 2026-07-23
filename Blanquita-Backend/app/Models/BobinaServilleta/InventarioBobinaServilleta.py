from pydantic import BaseModel

class AbrirBobinaServilletaRequest(BaseModel):
    IdBobinaServilleta: int
    Observacion: str | None = None


class AbrirBobinaServilletaResponse(BaseModel):
    IdBobinaServilleta: int
    IdEstadoMateriaPrima: int
    CantidadSubBobinas435: int
    CantidadSubBobinas220: int
    CantidadSubBobinasTotal: int