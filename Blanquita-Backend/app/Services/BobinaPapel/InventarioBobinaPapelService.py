from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from app.Models.BobinaPapel.InventarioBobinaPapel import (
    VerResumenInventarioBobinaPapelResponse,
    VerDetalleInventarioBobinaPapelRequest,
    VerDetalleInventarioBobinaPapelResponse,
)
from app.Repository.BobinaPapel.InventarioBobinaPapelRepository import InventarioBobinaPapelRepository


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