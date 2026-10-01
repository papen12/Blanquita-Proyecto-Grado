import json
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from typing import List
from app.Repository.BobinaPapel.BobinaPapelRepository import BobinaPapelRepository
from app.Models.BobinaPapel.BobinaPapel import (
    ListaBobinasPapel,
    BobinaPapelIngresoItem,
    IngresoModelo,
    IngresoLoteBobinaPapelResponse,
    TipoBobinaPapelIngreso,
    EditarBobinaPapelRequest,
    EditarBobinaPapelResponse,
)
from app.utils.validators import ValidarTexto
from app.Constants.Cantidades import (
    LONGITUD_MINIMA_DESCRIPCION,
    LONGITUD_MAXIMA_DESCRIPCION,
)


class BobinaPapelService:
    def __init__(self, db: Session):
        self.repository = BobinaPapelRepository(db)

    def InsertarBobinasPapel(self, data: IngresoModelo, id_usuario: int) -> IngresoLoteBobinaPapelResponse:
        params = {
            "p_IdProveedor": data.IdProveedor,
            "p_IdTipoBobina": data.IdTipoBobina,
            "p_IdUsuario": id_usuario,
            "p_Bobinas": json.dumps([b.model_dump() for b in data.Bobinas], default=str),
        }

        try:
            resultado = self.repository.InsertarBobinasPapel(params)
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

    def ObtenerTiposBobinaPapel(self) -> List[TipoBobinaPapelIngreso]:
        try:
            resultado = self.repository.ObtenerTipoBobinaPapel()
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudieron obtener los tipos de bobina"
            )
        if not resultado:
            return []

        return [TipoBobinaPapelIngreso(**tipo) for tipo in resultado]

    def EditarBobinaPapel(self, data: EditarBobinaPapelRequest, id_usuario: int) -> EditarBobinaPapelResponse:
        motivo = (data.Observacion or "").strip()
        if not ValidarTexto(LONGITUD_MINIMA_DESCRIPCION, LONGITUD_MAXIMA_DESCRIPCION, motivo):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"El motivo de la corrección es obligatorio y debe tener entre {LONGITUD_MINIMA_DESCRIPCION} y {LONGITUD_MAXIMA_DESCRIPCION} caracteres",
            )

        params = {
            "p_IdBobinaPapel": data.IdBobinaPapel,
            "p_IdUsuario": id_usuario,
            "p_CodigoBobina": data.CodigoBobina.strip(),
            "p_PesoBrutoKg": data.PesoBrutoKg,
            "p_PesoNetoKg": data.PesoNetoKg,
            "p_Gramaje": data.Gramaje,
            "p_Observacion": motivo,
        }

        resultado = self.repository.EditarBobinaPapel(params)

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo corregir la bobina",
            )

        return EditarBobinaPapelResponse(**resultado)