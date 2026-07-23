# Services/BobinaServilleta/ProduccionBobinaServilletaService.py

import json

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status

from app.Repository.BobinaServilleta.ProduccionBobinaServilleta import ProduccionBobinaServilletaRepository
from app.Models.BobinaServilleta.ProduccionBobinaServilleta import (
    AbrirBobinaServilletaRequest,
    AbrirBobinaServilletaResponse
)


class ProduccionBobinaServilletaService:
    def __init__(self, db: Session):
        self.repository = ProduccionBobinaServilletaRepository(db)

    def AbrirBobinaServilleta(
        self, data: AbrirBobinaServilletaRequest, id_usuario: int
    ) -> AbrirBobinaServilletaResponse:
        params = {
            "p_IdBobinaServilleta": data.IdBobinaServilleta,
            "p_IdUsuario": id_usuario,
            "p_Observacion": data.Observacion,
        }

        resultado = self.repository.AbrirBobinaServilleta(params)

        if resultado is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo abrir la BobinaServilleta."
            )

        return AbrirBobinaServilletaResponse(**resultado)