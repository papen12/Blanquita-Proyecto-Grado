import json

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status

from app.Repository.BobinaServilleta.InventarioBobinaServilleta import InventarioBobinaServilletaRepository
from app.Models.BobinaServilleta.InventarioBobinaServilleta import(
    ReingresarSubBobinaInventarioRequest,
    ReingresarSubBobinaInventarioResponse,
    ResumenInventarioBobinaServilletaResponse,
    DetalleInventarioBobinaServilletaRequest,
    DetalleInventarioBobinaServilletaResponse,
    ResumenInventarioSubBobinaServilletaResponse,
    DetalleInventarioSubBobinaServilletaRequest,
    DetalleInventarioSubBobinaServilletaResponse,
    SubBobinaServilletaFueraInventarioResponse,
    EditarBobinaServilletaRequest,
    EditarBobinaServilletaResponse
)
from app.utils.validators import ValidarTexto, REGLA_CARACTERES_OBSERVACION
from app.Constants.Cantidades import (
    LONGITUD_MINIMA_DESCRIPCION,
    LONGITUD_MAXIMA_DESCRIPCION,
)


class InventarioBobinaServilletaService:
    def __init__(self, db: Session):
            self.repository = InventarioBobinaServilletaRepository(db)
    def ReingresarSubBobinaAInventario(
    self, data: ReingresarSubBobinaInventarioRequest, id_usuario: int
    ) -> ReingresarSubBobinaInventarioResponse:
        observacion = (data.Observacion or "").strip()
        if not ValidarTexto(LONGITUD_MINIMA_DESCRIPCION, LONGITUD_MAXIMA_DESCRIPCION, observacion):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"La observación es obligatoria, debe tener entre {LONGITUD_MINIMA_DESCRIPCION} y {LONGITUD_MAXIMA_DESCRIPCION} caracteres, {REGLA_CARACTERES_OBSERVACION}",
            )

        params = {
            "p_IdSubBobina": data.IdSubBobina,
            "p_IdUsuario": id_usuario,
            "p_Observacion": observacion,
        }

        resultado = self.repository.ReingresarSubBobinaAInventario(params)

        if resultado is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo reingresar la sub-bobina a inventario."
            )

        return ReingresarSubBobinaInventarioResponse(**resultado)

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

    def VerSubBobinasServilletaFueraInventario(self) -> list[SubBobinaServilletaFueraInventarioResponse]:
        resultados = self.repository.VerSubBobinasServilletaFueraInventario()
        return [SubBobinaServilletaFueraInventarioResponse(**fila) for fila in resultados]

    def EditarBobinaServilleta(
        self, data: EditarBobinaServilletaRequest, id_usuario: int
    ) -> list[EditarBobinaServilletaResponse]:
        observacion = data.Observacion.strip()
        if not ValidarTexto(LONGITUD_MINIMA_DESCRIPCION, LONGITUD_MAXIMA_DESCRIPCION, observacion):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=(
                    "El motivo de la corrección es obligatorio, debe tener entre "
                    f"{LONGITUD_MINIMA_DESCRIPCION} y {LONGITUD_MAXIMA_DESCRIPCION} caracteres, {REGLA_CARACTERES_OBSERVACION}"
                ),
            )

        unidades = []
        for unidad in data.Unidades:
            codigo = unidad.CodigoBobina.strip()
            if not codigo:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                    detail="El código de cada unidad es obligatorio",
                )
            unidades.append({**unidad.model_dump(), "CodigoBobina": codigo})

        if unidades[0]["IdUnidadBobinaServilleta"] == unidades[1]["IdUnidadBobinaServilleta"]:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Las dos unidades deben ser distintas",
            )

        if unidades[0]["CodigoBobina"].lower() == unidades[1]["CodigoBobina"].lower():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Las dos unidades no pueden tener el mismo código",
            )

        params = {
            "p_IdBobinaServilleta": data.IdBobinaServilleta,
            "p_IdUsuario": id_usuario,
            "p_Unidades": json.dumps(unidades),
            "p_Observacion": observacion,
        }

        resultados = self.repository.EditarBobinaServilleta(params)

        if not resultados:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo editar la bobina servilleta.",
            )

        return [EditarBobinaServilletaResponse(**fila) for fila in resultados]
