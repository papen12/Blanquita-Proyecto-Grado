from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status

from app.Models.BobinaPapel.Reportes import (
    ReporteInventarioBobinaPapelRequest,
    ReporteInventarioBobinaPapelResponse,
    ReporteInventarioResumenTipoResponse,
    ReporteInventarioBobinaResponse,
)
from app.Repository.BobinaPapel.Reportes import ReporteBobinaPapelRepository


class ReporteBobinaPapelService:
    def __init__(self, db: Session):
        self.repository = ReporteBobinaPapelRepository(db)

    def ReporteInventario(
        self, data: ReporteInventarioBobinaPapelRequest
    ) -> ReporteInventarioBobinaPapelResponse:
        params = {
            "p_IdsTipoBobina": data.IdsTipoBobina or None,
        }

        try:
            filas = self.repository.ReporteInventario(params)
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo generar el informe de inventario de bobinas de papel, verifica los datos ingresados",
            )

        if not filas:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No hay bobinas en almacén para el informe solicitado",
            )

        primera = filas[0]

        resumen: dict[int, ReporteInventarioResumenTipoResponse] = {}
        bobinas: list[ReporteInventarioBobinaResponse] = []

        for fila in filas:
            id_tipo = fila["IdTipoBobina"]

            if id_tipo not in resumen:
                resumen[id_tipo] = ReporteInventarioResumenTipoResponse(
                    IdTipoBobina=id_tipo,
                    NombreTipoBobina=fila["NombreTipoBobina"],
                    CantidadBobinas=fila["CantidadBobinasTipo"],
                    PesoNetoTotalKg=fila["PesoNetoTotalTipoKg"],
                    GramajePromedio=fila["GramajePromedioTipo"],
                    RecepcionMasAntigua=fila["RecepcionMasAntiguaTipo"],
                    RecepcionMasReciente=fila["RecepcionMasRecienteTipo"],
                )

            bobinas.append(
                ReporteInventarioBobinaResponse(
                    IdTipoBobina=id_tipo,
                    NombreTipoBobina=fila["NombreTipoBobina"],
                    IdBobinaPapel=fila["IdBobinaPapel"],
                    CodigoBobina=fila["CodigoBobina"],
                    CodigoLote=fila["CodigoLote"],
                    FechaRecepcion=fila["FechaRecepcion"],
                    NombreProveedor=fila["NombreProveedor"],
                    PesoBrutoKg=fila["PesoBrutoKg"],
                    PesoNetoKg=fila["PesoNetoKg"],
                    Gramaje=fila["Gramaje"],
                )
            )

        return ReporteInventarioBobinaPapelResponse(
            FechaGeneracion=primera["FechaGeneracion"],
            TotalBobinas=primera["TotalBobinasInforme"],
            PesoNetoGeneralKg=primera["PesoNetoGeneralKg"],
            Resumen=list(resumen.values()),
            Bobinas=bobinas,
        )
