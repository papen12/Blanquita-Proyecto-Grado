from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
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
from app.Repository.BobinaPapel.InventarioBobinaPapel import InventarioBobinaPapelRepository


class InventarioBobinaPapelService:
    def __init__(self, db: Session):
        self.repository = InventarioBobinaPapelRepository(db)

    def VerResumen(self) -> list[VerResumenInventarioBobinaPapelResponse]:
        try:
            resultado = self.repository.VerResumen()
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo obtener el resumen del inventario de bobinas de papel, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo obtener el resumen del inventario de bobinas de papel"
            )

        return [VerResumenInventarioBobinaPapelResponse(**fila) for fila in resultado]

    def VerDetalle(self, data: VerDetalleInventarioBobinaPapelRequest) -> list[VerDetalleInventarioBobinaPapelResponse]:
        params = {
            "p_IdTipoBobina": data.IdTipoBobina,
        }

        try:
            resultado = self.repository.VerDetalle(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "IdTipoBobina" in mensaje and "fkey" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El tipo de bobina con id {data.IdTipoBobina} no existe"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo obtener el detalle del inventario de bobinas de papel, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No hay bobinas en almacén para el tipo de bobina con id {data.IdTipoBobina}"
            )

        return [VerDetalleInventarioBobinaPapelResponse(**fila) for fila in resultado]

    def ReingresarBobinaInventario(self, data: ReingresarBobinaAInventarioRequest, id_usuario: int) -> ReingresarBobinaAInventarioResponse:
        params = {
            "p_IdBobinaPapel": data.IdBobinaPapel,
            "p_IdUsuario": id_usuario,
            "p_Observacion": data.Observacion,
        }

        try:
            resultado = self.repository.ReingresarBobinaInventario(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "IdBobinaPapel" in mensaje and "fkey" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"La bobina de papel con id {data.IdBobinaPapel} no existe"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo reingresar la bobina al inventario, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No se pudo reingresar la bobina con id {data.IdBobinaPapel}, verifica que se encuentre fuera de inventario"
            )

        return ReingresarBobinaAInventarioResponse(**resultado)

    def DarDeBajaBobina(self, data: DarDeBajaBobinaRequest, id_usuario: int) -> DarDeBajaBobinaResponse:
        params = {
            "p_IdBobinaPapel": data.IdBobinaPapel,
            "p_IdUsuario": id_usuario,
            "p_Observacion": data.Observacion,
        }

        try:
            resultado = self.repository.DarDeBajaBobina(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "IdBobinaPapel" in mensaje and "fkey" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"La bobina de papel con id {data.IdBobinaPapel} no existe"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo dar de baja la bobina, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No se pudo dar de baja la bobina con id {data.IdBobinaPapel}"
            )

        return DarDeBajaBobinaResponse(**resultado)

    def VerBobinasFueraInventario(self) -> list[VerBobinasPapelFueraInventarioResponse]:
        try:
            resultado = self.repository.VerBobinasFueraInventario()
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo obtener las bobinas fuera de inventario, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No hay bobinas fuera de inventario"
            )

        return [VerBobinasPapelFueraInventarioResponse(**fila) for fila in resultado]