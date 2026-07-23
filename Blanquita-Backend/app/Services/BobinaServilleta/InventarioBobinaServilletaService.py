import json

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status

from app.Repository.BobinaServilleta.InventarioBobinaServilleta import InventarioBobinaServilletaRepository
from app.Models.BobinaServilleta.InventarioBobinaServilleta import(
    ReingresarSubBobinaInventarioRequest,
    ReingresarSubBobinaInventarioResponse,
    DarDeBajaSubBobinaRequest,
    DarDeBajaSubBobinaResponse,
    ResumenInventarioBobinaServilletaResponse,
    DetalleInventarioBobinaServilletaRequest,
    DetalleInventarioBobinaServilletaResponse,
    ResumenInventarioSubBobinaServilletaResponse,
    DetalleInventarioSubBobinaServilletaRequest,
    DetalleInventarioSubBobinaServilletaResponse
)


class InventarioBobinaServilletaService:
    def __init__(self, db: Session):
            self.repository = InventarioBobinaServilletaRepository(db)
    def ReingresarSubBobinaAInventario(
    self, data: ReingresarSubBobinaInventarioRequest, id_usuario: int
    ) -> ReingresarSubBobinaInventarioResponse:
        params = {
            "p_IdSubBobina": data.IdSubBobina,
            "p_IdUsuario": id_usuario,
            "p_Observacion": data.Observacion,
        }

        resultado = self.repository.ReingresarSubBobinaAInventario(params)

        if resultado is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo reingresar la sub-bobina a inventario."
            )

        return ReingresarSubBobinaInventarioResponse(**resultado)
    def DarDeBajaSubBobina(
    self, data: DarDeBajaSubBobinaRequest, id_usuario: int
) -> DarDeBajaSubBobinaResponse:
        params = {
            "p_IdSubBobina": data.IdSubBobina,
            "p_IdUsuario": id_usuario,
            "p_Observacion": data.Observacion,
        }

        resultado = self.repository.DarDeBajaSubBobina(params)

        if resultado is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo dar de baja la sub-bobina."
            )

        return DarDeBajaSubBobinaResponse(**resultado)

    def VerResumenInventarioBobinaServilleta(self) -> list[ResumenInventarioBobinaServilletaResponse]:
        resultados = self.repository.VerResumenInventarioBobinaServilleta()
        return [ResumenInventarioBobinaServilletaResponse(**fila) for fila in resultados]

    def VerDetalleInventarioBobinaServilleta(
        self, data: DetalleInventarioBobinaServilletaRequest
    ) -> list[DetalleInventarioBobinaServilletaResponse]:
        params = {
            "p_IdTipoBobinaServilleta": data.IdTipoBobinaServilleta,
        }

        resultados = self.repository.VerDetalleInventarioBobinaServilleta(params)

        return [DetalleInventarioBobinaServilletaResponse(**fila) for fila in resultados]


    def VerResumenInventarioSubBobinaServilleta(self) -> list[ResumenInventarioSubBobinaServilletaResponse]:
        resultados = self.repository.VerResumenInventarioSubBobinaServilleta()
        return [ResumenInventarioSubBobinaServilletaResponse(**fila) for fila in resultados]

    def VerDetalleInventarioSubBobinaServilleta(
        self, data: DetalleInventarioSubBobinaServilletaRequest
    ) -> list[DetalleInventarioSubBobinaServilletaResponse]:
        params = {
            "p_IdTipoMedidaSubBobina": data.IdTipoMedidaSubBobina,
        }

        resultados = self.repository.VerDetalleInventarioSubBobinaServilleta(params)

        return [DetalleInventarioSubBobinaServilletaResponse(**fila) for fila in resultados]