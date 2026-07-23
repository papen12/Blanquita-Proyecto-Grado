import json

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status

from app.Repository.BobinaServilleta.BobinaServilleta import BobinaServilletaRepository
from app.Models.BobinaServilleta.BobinaServilleta import (
    IngresoBobinaServilletaRequest,
    IngresoBobinaServilletaResponse
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