import json
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from app.Repository.Rodela.RodelaRepository import RodelaRepository
from app.Models.Rodela.Rodela import (
    IngresoRodelaRequest,
    IngresoRodelaResponse,
    TipoRodela,
)


class RodelaService:
    def __init__(self, db: Session):
        self.repository = RodelaRepository(db)

    def InsertarRodelas(self, data: IngresoRodelaRequest, id_usuario: int) -> IngresoRodelaResponse:
        params = {
            "p_IdProveedor": data.IdProveedor,
            "p_IdTipoRodela": data.IdTipoRodela,
            "p_IdUsuario": id_usuario,
            "p_Rodelas": json.dumps([rodela.model_dump() for rodela in data.Rodelas]),
        }

        try:
            resultado = self.repository.InsertarRodelas(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "duplicate key" in mensaje or "CodigoRodela" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Ya existe una rodela registrada con ese código"
                )
            if "al menos una rodela" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Debe enviar al menos una rodela para registrar"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo registrar el lote de rodelas, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo registrar el lote de rodelas"
            )

        return IngresoRodelaResponse(**resultado)

    def ObtenerTiposRodela(self) -> List[TipoRodela]:
        try:
            resultado = self.repository.ObtenerTipoRodela()
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudieron obtener los tipos de rodela"
            )
        if not resultado:
            return []
        return [TipoRodela(**tipo) for tipo in resultado]
