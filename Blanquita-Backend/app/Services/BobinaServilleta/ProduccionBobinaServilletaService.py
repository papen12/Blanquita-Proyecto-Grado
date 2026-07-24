import json

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status

from app.Repository.BobinaServilleta.ProduccionBobinaServilleta import ProduccionBobinaServilletaRepository
from app.Models.BobinaServilleta.ProduccionBobinaServilleta import (
    AbrirBobinaServilletaRequest,
    AbrirBobinaServilletaResponse,
    IniciarProduccionServilletaRequest,
    IniciarProduccionServilletaResponse,
    PausaProduccionServilletaRequest,
    PausaProduccionServilletaResponse,
    ReanudarProduccionServilletaRequest,
    ReanudarProduccionServilletaResponse,
    FinalizarProduccionServilletaRequest,
    FinalizarProduccionServilletaResponse,
    CancelarProduccionServilletaRequest,
    CancelarProduccionServilletaResponse,
    VerPausasProduccionServilletaActivasResponse,
    VerProduccionServilletaActivasRequest,
    VerProduccionServilletaActivasResponse
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

    def IniciarProduccionServilleta(
        self, data: IniciarProduccionServilletaRequest, id_usuario: int
    ) -> IniciarProduccionServilletaResponse:
        params = {
            "p_IdSubBobina": data.IdSubBobina,
            "p_IdUsuario": id_usuario,
        }

        resultado = self.repository.IniciarProduccionServilleta(params)

        if resultado is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo iniciar la producción de Servilleta."
            )

        return IniciarProduccionServilletaResponse(**resultado)

    def PausaProduccionServilleta(
        self, data: PausaProduccionServilletaRequest, id_usuario: int
    ) -> PausaProduccionServilletaResponse:
        params = {
            "p_IdProduccionServilleta": data.IdProduccionServilleta,
            "p_IdUsuario": id_usuario,
            "p_MotivoPausaProduccion": data.MotivoPausaProduccion,
        }

        resultado = self.repository.PausaProduccionServilleta(params)

        if resultado is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo pausar la producción de Servilleta."
            )

        return PausaProduccionServilletaResponse(**resultado)

    def ReanudarProduccionServilleta(
        self, data: ReanudarProduccionServilletaRequest, id_usuario: int
    ) -> ReanudarProduccionServilletaResponse:
        params = {
            "p_IdProduccionServilleta": data.IdProduccionServilleta,
            "p_IdUsuario": id_usuario,
        }

        resultado = self.repository.ReanudarProduccionServilleta(params)

        if resultado is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo reanudar la producción de Servilleta."
            )

        return ReanudarProduccionServilletaResponse(**resultado)

    def FinalizarProduccionServilleta(
        self, data: FinalizarProduccionServilletaRequest, id_usuario: int
    ) -> FinalizarProduccionServilletaResponse:
        params = {
            "p_IdProduccionServilleta": data.IdProduccionServilleta,
            "p_IdUsuario": id_usuario,
        }

        resultado = self.repository.FinalizarProduccionServilleta(params)

        if resultado is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo finalizar la producción de Servilleta."
            )

        return FinalizarProduccionServilletaResponse(**resultado)

    def CancelarProduccionServilleta(
        self, data: CancelarProduccionServilletaRequest, id_usuario: int
    ) -> CancelarProduccionServilletaResponse:
        params = {
            "p_id_produccion": data.IdProduccionServilleta,
            "p_id_usuario": id_usuario,
            "p_motivo_cancelacion": data.MotivoCancelacion,
        }

        resultado = self.repository.CancelarProduccionServilleta(params)

        if resultado is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo cancelar la producción de Servilleta."
            )

        return CancelarProduccionServilletaResponse(**resultado)

    def VerProduccionServilletaActivas(
        self, data: VerProduccionServilletaActivasRequest
    ) -> list[VerProduccionServilletaActivasResponse]:
        params = {
            "p_IdTipoMedidaSubBobina": data.IdTipoMedidaSubBobina,
        }

        resultados = self.repository.VerProduccionServilletaActivas(params)

        return [VerProduccionServilletaActivasResponse(**fila) for fila in resultados]

    def VerPausasProduccionServilletaActivas(self) -> list[VerPausasProduccionServilletaActivasResponse]:
        resultados = self.repository.VerPausasProduccionServilletaActivas()
        return [VerPausasProduccionServilletaActivasResponse(**fila) for fila in resultados]