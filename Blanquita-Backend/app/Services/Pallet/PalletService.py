import json
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from app.Repository.Pallet.PalletRepository import PalletRepository
from app.Models.Pallet.Pallet import (
    IngresoPalletRequest, 
    IngresoPalletResponse,
    TipoPapllet
)


class PalletService:
    def __init__(self, db: Session):
        self.repository = PalletRepository(db)

    def InsertarPallets(self, data: IngresoPalletRequest, id_usuario: int) -> IngresoPalletResponse:
        params = {
            "p_IdProveedor": data.IdProveedor,
            "p_IdTipoPallet": data.IdTipoPallet,
            "p_IdUsuario": id_usuario,
            "p_Pallets": json.dumps([pallet.model_dump() for pallet in data.Pallets]),
        }

        try:
            resultado = self.repository.InsertarPallets(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "duplicate key" in mensaje or "CodigoPallet" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Ya existe un pallet registrado con ese código"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo registrar el lote de pallets, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo registrar el lote de pallets"
            )

        return IngresoPalletResponse(**resultado)

    def ObtenerTiposPallet(self)->List[TipoPapllet]:
        try:
            resultado=self.repository.ObtenerTipoPallet()
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail= "No se pudieron obtener los tipos de pallet"
            )
        if not resultado:
            return []
        return [TipoPapllet(**tipo) for tipo in resultado]