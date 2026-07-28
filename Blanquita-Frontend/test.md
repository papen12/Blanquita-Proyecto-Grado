from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class VerResumenInventarioBobinaPapelResponse(BaseModel):
    IdTipoBobina: int
    NombreTipoBobina: str
    CantidadBobinas: int
    PesoNetoTotalKg: Decimal
    GramajePromedio: Decimal


class VerDetalleInventarioBobinaPapelRequest(BaseModel):
    IdTipoBobina: int


class VerDetalleInventarioBobinaPapelResponse(BaseModel):
    IdBobinaPapel: int
    CodigoBobina: str
    CodigoLote: str
    FechaRecepcion: date
    NombreProveedor: str
    PesoBrutoKg: Decimal
    PesoNetoKg: Decimal
    Gramaje: Decimal


class ReingresarBobinaAInventarioRequest(BaseModel):
    IdBobinaPapel: int
    Observacion: Optional[str] = None


class ReingresarBobinaAInventarioResponse(BaseModel):
    IdBobinaPapel: int
    IdEstadoMateriaPrima: int
    FechaMovimiento: datetime


class DarDeBajaBobinaRequest(BaseModel):
    IdBobinaPapel: int
    Observacion: Optional[str] = None


class DarDeBajaBobinaResponse(BaseModel):
    IdBobinaPapel: int
    IdEstadoMateriaPrima: int
    FechaMovimiento: datetime


class VerBobinasPapelFueraInventarioResponse(BaseModel):
    IdBobinaPapel: int
    CodigoBobina: str
    NombreTipoBobina: str
    PesoBrutoKg: Optional[float]
    Gramaje: Optional[float]
    NombreProveedor: str
    FechaRecepcion: date
    UltimaObservacion: Optional[str]
    FechaUltimoMovimiento: Optional[datetime]


from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db

from app.Services.BobinaPapel.InventarioBobinaPapelService import (
    InventarioBobinaPapelService,
)

from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR

from app.Models.BobinaPapel.InventarioBobinaPapel import (
    VerResumenInventarioBobinaPapelResponse,
    VerDetalleInventarioBobinaPapelRequest,
    VerDetalleInventarioBobinaPapelResponse,
    ReingresarBobinaAInventarioRequest,
    ReingresarBobinaAInventarioResponse,
    DarDeBajaBobinaRequest,
    DarDeBajaBobinaResponse,
    VerBobinasPapelFueraInventarioResponse,
)


def inventario_bobina_papel_service(
    db: Session = Depends(get_db),
) -> InventarioBobinaPapelService:
    return InventarioBobinaPapelService(db)


InventarioBobinaPapelRouter = APIRouter(
    prefix="/papelbobina/inventario", tags=["Papel Bobina - Inventario"]
)


@InventarioBobinaPapelRouter.get(
    "/resumen",
    response_model=list[VerResumenInventarioBobinaPapelResponse],
    status_code=200,
    dependencies=[
        Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR]))
    ],
)
def VerInventarioBobinaPapel(
    service: InventarioBobinaPapelService = Depends(inventario_bobina_papel_service),
):
    return service.VerResumen()


@InventarioBobinaPapelRouter.get(
    "/detalle/{IdTipoBobina}",
    response_model=list[VerDetalleInventarioBobinaPapelResponse],
    status_code=200,
    dependencies=[
        Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR]))
    ],
)
def VerDetalleInventarioBobinaPapel(
    IdTipoBobina: int,
    service: InventarioBobinaPapelService = Depends(inventario_bobina_papel_service),
):
    return service.VerDetalle(
        VerDetalleInventarioBobinaPapelRequest(IdTipoBobina=IdTipoBobina)
    )


@InventarioBobinaPapelRouter.post(
    "/reingresar",
    response_model=ReingresarBobinaAInventarioResponse,
    status_code=200,
)
def ReingresarInventarioBobinaPapel(
    data: ReingresarBobinaAInventarioRequest,
    usuario_actual: dict = Depends(
        require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])
    ),
    service: InventarioBobinaPapelService = Depends(inventario_bobina_papel_service),
):
    return service.ReingresarBobinaInventario(data, usuario_actual["IdUsuario"])


@InventarioBobinaPapelRouter.post(
    "/dardebaja",
    response_model=DarDeBajaBobinaResponse,
    status_code=200,
)
def DarDeBajaBobinaPapel(
    data: DarDeBajaBobinaRequest,
    usuario_actual: dict = Depends(
        require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])
    ),
    service: InventarioBobinaPapelService = Depends(inventario_bobina_papel_service),
):
    return service.DarDeBajaBobina(data, usuario_actual["IdUsuario"])


@InventarioBobinaPapelRouter.get(
    "/fuera",
    response_model=list[VerBobinasPapelFueraInventarioResponse],
    status_code=200,
    dependencies=[
        Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR]))
    ],
)
def VerBobinasPapelFueraInventario(
    service: InventarioBobinaPapelService = Depends(inventario_bobina_papel_service),
):
    return service.VerBobinasFueraInventario()




export const VerResumenInventarioBobinaPapelResponse = (data) => ({
  IdTipoBobina: data.IdTipoBobina,
  NombreTipoBobina: data.NombreTipoBobina,
  CantidadBobinas: data.CantidadBobinas,
  PesoNetoTotalKg: data.PesoNetoTotalKg,
  GramajePromedio: data.GramajePromedio
});

export const VerDetalleInventarioBobinaPapelRequest = (idTipoBobina) => ({
  IdTipoBobina: idTipoBobina
});

export const VerDetalleInventarioBobinaPapelResponse = (data) => ({
  IdBobinaPapel: data.IdBobinaPapel,
  CodigoBobina: data.CodigoBobina,
  CodigoLote: data.CodigoLote,
  FechaRecepcion: data.FechaRecepcion,
  NombreProveedor: data.NombreProveedor,
  PesoBrutoKg: data.PesoBrutoKg,
  PesoNetoKg: data.PesoNetoKg,
  Gramaje: data.Gramaje
});

export const ReingresarBobinaAInventarioRequest = (idBobinaPapel, observacion) => ({
  IdBobinaPapel: idBobinaPapel,
  Observacion: observacion ?? null
});

export const ReingresarBobinaAInventarioResponse = (data) => ({
  IdBobinaPapel: data.IdBobinaPapel,
  IdEstadoMateriaPrima: data.IdEstadoMateriaPrima,
  FechaMovimiento: data.FechaMovimiento
});

export const DarDeBajaBobinaRequest = (idBobinaPapel, observacion) => ({
  IdBobinaPapel: idBobinaPapel,
  Observacion: observacion ?? null
});

export const DarDeBajaBobinaResponse = (data) => ({
  IdBobinaPapel: data.IdBobinaPapel,
  IdEstadoMateriaPrima: data.IdEstadoMateriaPrima,
  FechaMovimiento: data.FechaMovimiento
});

export const VerBobinasPapelFueraInventarioResponse = (data) => ({
  IdBobinaPapel: data.IdBobinaPapel,
  CodigoBobina: data.CodigoBobina,
  NombreTipoBobina: data.NombreTipoBobina,
  PesoBrutoKg: data.PesoBrutoKg ?? null,
  Gramaje: data.Gramaje ?? null,
  NombreProveedor: data.NombreProveedor,
  FechaRecepcion: data.FechaRecepcion,
  UltimaObservacion: data.UltimaObservacion ?? null,
  FechaUltimoMovimiento: data.FechaUltimoMovimiento ?? null
});











import {
  VerResumenInventarioBobinaPapelResponse,
  VerDetalleInventarioBobinaPapelResponse,
  ReingresarBobinaAInventarioRequest,
  ReingresarBobinaAInventarioResponse,
  DarDeBajaBobinaRequest,
  DarDeBajaBobinaResponse,
  VerBobinasPapelFueraInventarioResponse
} from "../../models/BobinaPapel/Inventario";

async function manejarErrorBackend(response) {
  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    const error = new Error("Sesión no válida, inicia sesión nuevamente");
    error.status = 401;
    throw error;
  }

  const error = new Error(data.detail || "Error al procesar la solicitud");
  error.status = response.status;
  throw error;
}

export async function verResumenInventarioBobinaPapel() {
  const response = await fetch("/api/papelbobina/inventario/resumen");

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(VerResumenInventarioBobinaPapelResponse);
}

export async function verDetalleInventarioBobinaPapel(idTipoBobina) {
  const response = await fetch(`/api/papelbobina/inventario/detalle/${idTipoBobina}`);

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(VerDetalleInventarioBobinaPapelResponse);
}

export async function reingresarBobinaInventario(idBobinaPapel, observacion) {
  const payload = ReingresarBobinaAInventarioRequest(idBobinaPapel, observacion);

  const response = await fetch("/api/papelbobina/inventario/reingresar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return ReingresarBobinaAInventarioResponse(data);
}

export async function darDeBajaBobina(idBobinaPapel, observacion) {
  const payload = DarDeBajaBobinaRequest(idBobinaPapel, observacion);

  const response = await fetch("/api/papelbobina/inventario/dardebaja", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return DarDeBajaBobinaResponse(data);
}

export async function verBobinasPapelFueraInventario() {
  const response = await fetch("/api/papelbobina/inventario/fuera");

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(VerBobinasPapelFueraInventarioResponse);
}