import json

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status

from app.Repository.Empaque.EmpaqueBolsa import EmpaqueBolsaRepository
from app.Models.Empaque.EmpaqueBolsa import (
    IngresoEmpaqueBolsaRequest,
    IngresoEmpaqueBolsaResponse,
    DescontarEmpaqueBolsaRequest,
    DescontarEmpaqueBolsaResponse,
    ReingresarEmpaqueBolsaRequest,
    ReingresarEmpaqueBolsaResponse,
    CatalogoEmpaqueBolsaResponse
)


class EmpaqueBolsaService:
    def __init__(self, db: Session):
        self.repository = EmpaqueBolsaRepository(db)

    def InsertarEmpaqueBolsa(
        self, data: IngresoEmpaqueBolsaRequest, id_usuario: int
    ) -> list[IngresoEmpaqueBolsaResponse]:
        self._ValidarItems(data.EmpaquesBolsa)

        params = {
            "p_IdProveedor": data.IdProveedor,
            "p_IdUsuario": id_usuario,
            "p_CantidadToneladasPedida": data.CantidadToneladasPedida,
            "p_EmpaquesBolsa": json.dumps(
                [item.model_dump() for item in data.EmpaquesBolsa]
            ),
        }
        return self.repository.InsertarEmpaqueBolsa(params)

    def DescontarEmpaqueBolsa(
        self, data: DescontarEmpaqueBolsaRequest, id_usuario: int
    ) -> list[DescontarEmpaqueBolsaResponse]:
        self._ValidarItems(data.EmpaquesBolsa)

        params = {
            "p_IdUsuario": id_usuario,
            "p_EmpaquesBolsa": json.dumps(
                [item.model_dump() for item in data.EmpaquesBolsa]
            ),
        }
        return self.repository.DescontarEmpaqueBolsa(params)

    def ReingresarEmpaqueBolsaAInventario(
        self, data: ReingresarEmpaqueBolsaRequest, id_usuario: int
    ) -> ReingresarEmpaqueBolsaResponse:
        if data.CantidadMovimiento <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La cantidad a reingresar debe ser mayor a 0"
            )

        params = {
            "p_IdUsuario": id_usuario,
            "p_IdTipoEmpaqueBolsa": data.IdTipoEmpaqueBolsa,
            "p_CantidadMovimiento": data.CantidadMovimiento,
            "p_Observacion": data.Observacion,
        }
        return self.repository.ReingresarEmpaqueBolsaAInventario(params)

    def _ValidarItems(self, items: list) -> None:
        if not items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debe proporcionar al menos un tipo de empaque bolsa"
            )

        ids_vistos = set()
        for item in items:
            if item.CantidadMovimiento <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"La cantidad para el tipo de empaque bolsa {item.IdTipoEmpaqueBolsa} debe ser mayor a 0"
                )

            if item.IdTipoEmpaqueBolsa in ids_vistos:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El tipo de empaque bolsa {item.IdTipoEmpaqueBolsa} está duplicado en la solicitud"
                )
            ids_vistos.add(item.IdTipoEmpaqueBolsa)

    def VerCatalogoEmpaqueBolsa(self) -> list[CatalogoEmpaqueBolsaResponse]:
        return self.repository.VerCatalogoEmpaqueBolsa()