from datetime import timedelta

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status

from app.Models.BobinaPapel.Reportes import (
    ReporteInventarioBobinaPapelRequest,
    ReporteInventarioBobinaPapelResponse,
    ReporteInventarioResumenTipoResponse,
    ReporteInventarioBobinaResponse,
    VerProduccionesBobinaTuboRequest,
    VerProduccionesBobinaTuboResponse,
    ProduccionBobinaTuboCatalogoResponse,
    ReporteProduccionBobinaTuboDetalleRequest,
    ReporteProduccionBobinaTuboDetalleResponse,
    PausaProduccionBobinaTuboResponse,
    VerLotesBobinaPapelRequest,
    VerLotesBobinaPapelResponse,
    LoteBobinaPapelCatalogoResponse,
    ReporteLoteBobinaPapelDetalleRequest,
    ReporteLoteBobinaPapelDetalleResponse,
    BobinaLoteDetalleResponse,
    ReporteCancelacionProduccionBobinaTuboRequest,
    ReporteCancelacionProduccionBobinaTuboResponse,
    CancelacionProduccionBobinaTuboResponse,
    ReporteProduccionPorPeriodoRequest,
    ReporteProduccionPorPeriodoResponse,
    PausaPorMotivoResponse,
    CancelacionPeriodoResponse,
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

    def VerProduccionesBobinaTubo(
        self, data: VerProduccionesBobinaTuboRequest
    ) -> VerProduccionesBobinaTuboResponse:
        params = {
            "p_FechaInicio": data.FechaInicio,
            "p_FechaFin": data.FechaFin,
            "p_IdTurno": data.IdTurno,
            "p_IdsTipoBobina": data.IdsTipoBobina or None,
            "p_CodigoBobina": data.CodigoBobina,
            "p_Operador": data.Operador,
            "p_IdEstadoProduccion": data.IdEstadoProduccion,
        }

        try:
            filas = self.repository.VerProduccionesBobinaTubo(params)
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo obtener el catálogo de producciones, verifica los datos ingresados",
            )

        total = len(filas)
        inicio = (data.Pagina - 1) * data.TamanoPagina
        fin = inicio + data.TamanoPagina
        filas_pagina = filas[inicio:fin]

        producciones = [
            ProduccionBobinaTuboCatalogoResponse(**fila) for fila in filas_pagina
        ]

        return VerProduccionesBobinaTuboResponse(
            Total=total,
            Pagina=data.Pagina,
            TamanoPagina=data.TamanoPagina,
            Producciones=producciones,
        )

    def ReporteDetalleProduccion(
        self, data: ReporteProduccionBobinaTuboDetalleRequest
    ) -> ReporteProduccionBobinaTuboDetalleResponse:
        try:
            fila = self.repository.ReporteProduccionBobinaTuboDetalle(
                {"p_IdProduccion": data.IdProduccion}
            )
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo obtener el detalle de la producción, verifica los datos ingresados",
            )

        if not fila:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No se encontró la producción solicitada",
            )

        pausas = None
        total_tiempo_pausado = None

        if data.VerPausas:
            try:
                filas_pausas = self.repository.ReportePausasProduccionBobinaTubo(
                    {
                        "p_IdProduccion": data.IdProduccion,
                        "p_FechaInicio": None,
                        "p_FechaFin": None,
                        "p_IdTurno": None,
                        "p_SoloAbiertas": None,
                    }
                )
            except SQLAlchemyError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No se pudieron obtener las pausas de la producción",
                )

            pausas = [
                PausaProduccionBobinaTuboResponse(**fila_pausa)
                for fila_pausa in filas_pausas
            ]
            total_tiempo_pausado = sum(
                (p.DuracionPausa for p in pausas if p.DuracionPausa is not None),
                timedelta(),
            )

        return ReporteProduccionBobinaTuboDetalleResponse(
            **fila,
            Pausas=pausas,
            TotalTiempoPausado=total_tiempo_pausado,
        )

    def VerLotesBobinaPapel(
        self, data: VerLotesBobinaPapelRequest
    ) -> VerLotesBobinaPapelResponse:
        params = {
            "p_FechaInicio": data.FechaInicio,
            "p_FechaFin": data.FechaFin,
            "p_IdProveedor": data.IdProveedor,
            "p_IdsTipoBobina": data.IdsTipoBobina or None,
        }

        try:
            filas = self.repository.VerLotesBobinaPapel(params)
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo obtener el catálogo de lotes, verifica los datos ingresados",
            )

        total = len(filas)
        inicio = (data.Pagina - 1) * data.TamanoPagina
        fin = inicio + data.TamanoPagina
        filas_pagina = filas[inicio:fin]

        lotes = [LoteBobinaPapelCatalogoResponse(**fila) for fila in filas_pagina]

        return VerLotesBobinaPapelResponse(
            Total=total,
            Pagina=data.Pagina,
            TamanoPagina=data.TamanoPagina,
            Lotes=lotes,
        )

    def ReporteLoteBobinaPapelDetalle(
        self, data: ReporteLoteBobinaPapelDetalleRequest
    ) -> ReporteLoteBobinaPapelDetalleResponse:
        try:
            filas = self.repository.ReporteLoteBobinaPapelDetalle(
                {"p_IdLoteBobina": data.IdLoteBobina}
            )
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo obtener el detalle del lote, verifica los datos ingresados",
            )

        if not filas:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No se encontró el lote solicitado",
            )

        primera = filas[0]

        bobinas = [BobinaLoteDetalleResponse(**fila) for fila in filas]

        return ReporteLoteBobinaPapelDetalleResponse(
            IdLoteBobina=data.IdLoteBobina,
            FechaRecepcion=primera["FechaRecepcion"],
            NombreProveedor=primera["NombreProveedor"],
            CantidadBobinas=primera["CantidadBobinas"],
            Ci=primera["Ci"],
            PrimerNombre=primera["PrimerNombre"],
            ApellidoPaterno=primera["ApellidoPaterno"],
            NombreRol=primera["NombreRol"],
            Bobinas=bobinas,
        )

    def ReporteCancelacionProduccion(
        self, data: ReporteCancelacionProduccionBobinaTuboRequest
    ) -> ReporteCancelacionProduccionBobinaTuboResponse:
        try:
            fila = self.repository.ReporteProduccionBobinaTuboDetalle(
                {"p_IdProduccion": data.IdProduccion}
            )
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo obtener el detalle de la producción, verifica los datos ingresados",
            )

        if not fila:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No se encontró la producción solicitada",
            )

        if fila["NombreEstadoProduccion"] != "Cancelada":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La producción solicitada no está cancelada",
            )

        try:
            filas_pausas = self.repository.ReportePausasProduccionBobinaTubo(
                {
                    "p_IdProduccion": data.IdProduccion,
                    "p_FechaInicio": None,
                    "p_FechaFin": None,
                    "p_IdTurno": None,
                    "p_SoloAbiertas": None,
                }
            )
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudieron obtener las pausas de la producción",
            )

        pausas = [
            PausaProduccionBobinaTuboResponse(**fila_pausa)
            for fila_pausa in filas_pausas
        ]
        total_tiempo_pausado = sum(
            (p.DuracionPausa for p in pausas if p.DuracionPausa is not None),
            timedelta(),
        )

        try:
            fila_cancelacion = self.repository.ReporteCancelacionProduccionBobinaTubo(
                {"p_IdProduccion": data.IdProduccion}
            )
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo obtener la información de cancelación de la producción",
            )

        if not fila_cancelacion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No se encontró el registro de cancelación de la producción",
            )

        cancelacion = CancelacionProduccionBobinaTuboResponse(**fila_cancelacion)

        return ReporteCancelacionProduccionBobinaTuboResponse(
            **fila,
            Pausas=pausas,
            TotalTiempoPausado=total_tiempo_pausado,
            Cancelacion=cancelacion,
        )

    def ReporteProduccionPorPeriodo(
        self, data: ReporteProduccionPorPeriodoRequest
    ) -> ReporteProduccionPorPeriodoResponse:
        try:
            filas_producciones = self.repository.VerProduccionesBobinaTubo(
                {
                    "p_FechaInicio": data.FechaInicio,
                    "p_FechaFin": data.FechaFin,
                    "p_IdTurno": None,
                    "p_IdsTipoBobina": None,
                    "p_CodigoBobina": None,
                    "p_Operador": None,
                    "p_IdEstadoProduccion": None,
                }
            )
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudieron obtener las producciones del período, verifica los datos ingresados",
            )

        producciones = [
            ProduccionBobinaTuboCatalogoResponse(**fila) for fila in filas_producciones
        ]
        total_logs = sum(p.CantidadLogsActual for p in producciones)

        try:
            filas_pausas = self.repository.ReportePausasProduccionBobinaTubo(
                {
                    "p_IdProduccion": None,
                    "p_FechaInicio": data.FechaInicio,
                    "p_FechaFin": data.FechaFin,
                    "p_IdTurno": None,
                    "p_SoloAbiertas": None,
                }
            )
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudieron obtener las pausas del período",
            )

        pausas_por_motivo: dict[str, dict] = {}
        for fila_pausa in filas_pausas:
            motivo = fila_pausa["MotivoPausaProduccion"] or "Sin motivo especificado"
            duracion = fila_pausa["DuracionPausa"] or timedelta()

            if motivo not in pausas_por_motivo:
                pausas_por_motivo[motivo] = {
                    "CantidadPausas": 0,
                    "TiempoTotal": timedelta(),
                }

            pausas_por_motivo[motivo]["CantidadPausas"] += 1
            pausas_por_motivo[motivo]["TiempoTotal"] += duracion

        pausas_agrupadas = [
            PausaPorMotivoResponse(
                Motivo=motivo,
                CantidadPausas=datos["CantidadPausas"],
                TiempoTotal=datos["TiempoTotal"],
            )
            for motivo, datos in pausas_por_motivo.items()
        ]
        total_tiempo_pausado = sum(
            (p.TiempoTotal for p in pausas_agrupadas), timedelta()
        )

        cancelaciones = None

        if data.VerCancelaciones:
            try:
                filas_cancelaciones = (
                    self.repository.VerCancelacionesProduccionBobinaTubo(
                        {
                            "p_FechaInicio": data.FechaInicio,
                            "p_FechaFin": data.FechaFin,
                        }
                    )
                )
            except SQLAlchemyError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No se pudieron obtener las cancelaciones del período",
                )

            cancelaciones = [
                CancelacionPeriodoResponse(**fila) for fila in filas_cancelaciones
            ]

        return ReporteProduccionPorPeriodoResponse(
            PeriodoInicio=data.FechaInicio,
            PeriodoFin=data.FechaFin,
            TotalProducciones=len(producciones),
            TotalLogs=total_logs,
            Producciones=producciones,
            PausasPorMotivo=pausas_agrupadas,
            TotalPausas=len(filas_pausas),
            TotalTiempoPausado=total_tiempo_pausado,
            Cancelaciones=cancelaciones,
        )
