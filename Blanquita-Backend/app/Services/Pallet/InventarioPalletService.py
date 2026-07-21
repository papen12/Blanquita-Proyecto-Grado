from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status

from app.Repository.Pallet.InventarioPallet import InventarioPalletRepository
from app.Models.Pallet.InventarioPallet import (
    ResumenInventarioPalletResponse,
    DetalleInventarioPalletRequest,
    DetalleInventarioPalletResponse,
    ReingresarPalletInventarioRequest,
    ReingresarPalletInventarioResponse,
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
    
    def ReingresarPalletInventario(self, data: ReingresarPalletInventarioRequest, id_usuario: int) -> ReingresarPalletInventarioResponse:
        params = {
            "p_IdPallet": data.IdPallet,
            "p_IdUsuario": id_usuario,
            "p_Observacion": data.Observacion,
        }

        try:
            resultado = self.repository.ReingresarPalletInventario(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "No existe el pallet" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe el pallet con id {data.IdPallet}"
                )
            if "no está Fuera de Inventario" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El pallet indicado no está Fuera de Inventario, no puede reingresarse"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo reingresar el pallet a inventario, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo reingresar el pallet a inventario"
            )

        return ReingresarPalletInventarioResponse(**resultado)