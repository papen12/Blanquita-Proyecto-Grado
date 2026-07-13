import json
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from app.Repository.BobinaPapel.LoteBobinaPapelRepository import LoteBobinaPapelRepository
from app.Models.BobinaPapel.IngresoBobina import ListaBobinasPapel,BobinaPapelIngresoItem,IngresoModelo,IngresoLoteBobinaPapelResponse



class LoteBobinaService:
    def __init__(self, db: Session):
        self.repository = LoteBobinaPapelRepository(db)

    def insertar_bobinas_papel(self, data: IngresoModelo) -> IngresoLoteBobinaPapelResponse:
        params = {
            "p_IdProveedor": data.IdProveedor,
            "p_IdTipoBobina": data.IdTipoBobina,
            "p_IdUsuario": data.IdUsuario,
            "p_Bobinas": json.dumps([b.model_dump() for b in data.Bobinas], default=str),
        }

        try:
            resultado = self.repository.insertar_bobinas_papel(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "duplicate key" in mensaje and "CodigoBobina" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Ya existe una bobina registrada con ese código"
                )
            if "IdProveedor" in mensaje and "fkey" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El proveedor con id {data.IdProveedor} no existe"
                )
            if "IdTipoBobina" in mensaje and "fkey" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El tipo de bobina con id {data.IdTipoBobina} no existe"
                )
            if "IdUsuario" in mensaje and "fkey" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El usuario con id {data.IdUsuario} no existe"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo registrar el lote de bobinas, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo registrar el lote de bobinas"
            )

        return IngresoLoteBobinaPapelResponse(**resultado)