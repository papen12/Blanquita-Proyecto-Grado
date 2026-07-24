from pydantic import BaseModel
from datetime import datetime,date


class AbrirBobinaServilletaRequest(BaseModel):
    IdBobinaServilleta: int
    Observacion: str | None = None


class AbrirBobinaServilletaResponse(BaseModel):
    IdBobinaServilleta: int
    IdEstadoMateriaPrima: int
    CantidadSubBobinas435: int
    CantidadSubBobinas220: int
    CantidadSubBobinasTotal: int


class ReingresarSubBobinaInventarioRequest(BaseModel):
    IdSubBobina: int
    Observacion: str | None = None


class ReingresarSubBobinaInventarioResponse(BaseModel):
    IdSubBobina: int
    IdEstadoMateriaPrima: int
    FechaMovimiento: datetime


class DarDeBajaSubBobinaRequest(BaseModel):
    IdSubBobina: int
    Observacion: str | None = None


class DarDeBajaSubBobinaResponse(BaseModel):
    IdSubBobina: int
    IdEstadoMateriaPrima: int
    FechaMovimiento: datetime


class ResumenInventarioBobinaServilletaResponse(BaseModel):
    IdTipoBobinaServilleta: int
    NombreTipoBobinaServilleta: str
    CantidadBobinaServilleta: int


class DetalleInventarioBobinaServilletaRequest(BaseModel):
    IdTipoBobinaServilleta: int


class DetalleInventarioBobinaServilletaResponse(BaseModel):
    IdBobinaServilleta: int
    FechaRecepcion: date
    NombreProveedor: str
    IdUnidad1: int 
    CodigoUnidad1: str 
    IdFormatoSubBobina1: int 
    DescripcionFormato1: str 
    IdUnidad2: int 
    CodigoUnidad2: str 
    IdFormatoSubBobina2: int 
    DescripcionFormato2: str 


class ResumenInventarioSubBobinaServilletaResponse(BaseModel):
    IdTipoMedidaSubBobina: int
    NombreTipoMedida: str
    CantidadSubBobinas: int


class DetalleInventarioSubBobinaServilletaRequest(BaseModel):
    IdTipoMedidaSubBobina: int


class DetalleInventarioSubBobinaServilletaResponse(BaseModel):
    IdSubBobinaServilleta: int
    CodigoUnidadOrigen: str



class SubBobinaServilletaFueraInventarioResponse(BaseModel):
    IdSubBobinaServilleta: int
    CodigoUnidadOrigen: str
    NombreTipoMedida: str
    UltimaObservacion: str | None
    FechaUltimoMovimiento: datetime | None