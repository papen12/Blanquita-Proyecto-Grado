import json
from typing import List

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status

from app.Repository.BobinaServilleta.BobinaServilleta import BobinaServilletaRepository
from app.Models.BobinaServilleta.BobinaServilleta import (
    IngresoBobinaServilletaRequest,
    IngresoBobinaServilletaResponse,
    TipoBobinaServilletaIngreso
)


class BobinaServilletaService:
    def __init__(self, db: Session):
        self.repository = BobinaServilletaRepository(db)

    def InsertarBobinasServilleta(
        self, data: IngresoBobinaServilletaRequest, id_usuario: int
    ) -> IngresoBobinaServilletaResponse:
        params = {
            "p_IdProveedor": data.IdProveedor,
            "p_IdTipoBobinaServilleta": data.IdTipoBobinaServilleta,
            "p_IdUsuario": id_usuario,
            "p_Bobinas": json.dumps([b.model_dump() for b in data.Bobinas]),
        }

        resultado = self.repository.InsertarBobinasServilleta(params)

        if resultado is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo registrar el ingreso de BobinasServilleta."
            )

        return IngresoBobinaServilletaResponse(**resultado)

    def ObtenerTiposBobinaServilleta(self) -> List[TipoBobinaServilletaIngreso]:
        try:
            resultado = self.repository.ObtenerTipoBobinaServilleta()
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudieron obtener los tipos de bobina servilleta"
            )
        if not resultado:
            return []
        return [TipoBobinaServilletaIngreso(**tipo) for tipo in resultado]