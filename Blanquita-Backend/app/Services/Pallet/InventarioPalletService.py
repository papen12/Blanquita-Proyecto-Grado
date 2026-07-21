from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status

from app.Repository.Pallet.InventarioPallet import InventarioPalletRepository
from app.Models.Pallet.InventarioPallet import (
    ResumenInventarioPalletResponse,
    DetalleInventarioPalletRequest,
    DetalleInventarioPalletResponse
)

class InventarioPalletService:
    def __init__(self, db: Session):
        self.repository = InventarioPalletRepository(db)

    def VerResumenInventarioPallet(self) -> list[ResumenInventarioPalletResponse]:
        try:
            resultado = self.repository.VerResumenInventarioPallet()
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo obtener el resumen de inventario de pallets"
            )

        return [ResumenInventarioPalletResponse(**fila) for fila in resultado]

    def VerDetalleInventarioPallet(self, data: DetalleInventarioPalletRequest) -> list[DetalleInventarioPalletResponse]:
        params = {
            "p_IdTipoPallet": data.IdTipoPallet,
        }

        try:
            resultado = self.repository.VerDetalleInventarioPallet(params)
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo obtener el detalle de inventario de pallets"
            )

        return [DetalleInventarioPalletResponse(**fila) for fila in resultado]