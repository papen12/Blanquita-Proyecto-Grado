from datetime import datetime

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status

from app.Models.BobinaServilleta.Reporte import (
    ReporteInventarioBobinaServilletaRequest,
    ReporteInventarioBobinaServilletaResponse,
    ReporteInventarioResumenTipoServilletaResponse,
    ReporteInventarioBobinaServilletaDetalleResponse,
    VerBobinasServilletaRequest,
    VerBobinasServilletaResponse,
    BobinaServilletaCatalogoResponse,
    VerSubBobinasServilletaRequest,
    VerSubBobinasServilletaResponse,
    SubBobinaServilletaCatalogoResponse,
    ReporteInventarioResumenMedidaResponse,
    ReporteInventarioSubBobinaServilletaResponse,
    ReporteHistorialMovimientosUnidadServilletaRequest,
    ReporteHistorialMovimientosUnidadServilletaResponse,
    MovimientoSubBobinaHistorialResponse,
    ReporteDetalleBobinaServilletaRequest,
    ReporteDetalleBobinaServilletaResponse,
    UnidadDetalleBobinaServilletaResponse,
    VerLotesBobinaServilletaRequest,
    VerLotesBobinaServilletaResponse,
    LoteBobinaServilletaCatalogoResponse,
    ReporteLoteBobinaServilletaDetalleRequest,
    ReporteLoteBobinaServilletaDetalleResponse,
    BobinaLoteServilletaDetalleResponse,
    ReporteLotesServilletaPorPeriodoRequest,
    ReporteLotesServilletaPorPeriodoResponse,
)
from app.Repository.BobinaServilleta.Reporte import ReporteBobinaServilletaRepository
from app.utils.dates import ZONA_BOLIVIA


class ReporteBobinaServilletaService:
    def __init__(self, db: Session):
        self.repository = ReporteBobinaServilletaRepository(db)

    def ReporteInventario(
        self, data: ReporteInventarioBobinaServilletaRequest
    ) -> ReporteInventarioBobinaServilletaResponse:
        params = {
            "p_IdsTipoBobinaServilleta": data.IdsTipoBobinaServilleta or None,
        }

        try:
            filas = self.repository.ReporteInventario(params)
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo generar el informe de inventario de bobinas de servilleta, verifica los datos ingresados",
            )

        if not filas:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No hay bobinas de servilleta en almacén para el informe solicitado",
            )

        primera = filas[0]

        resumen: dict[int, ReporteInventarioResumenTipoServilletaResponse] = {}
        bobinas: list[ReporteInventarioBobinaServilletaDetalleResponse] = []

        for fila in filas:
            id_tipo = fila["IdTipoBobinaServilleta"]

            if id_tipo not in resumen:
                resumen[id_tipo] = ReporteInventarioResumenTipoServilletaResponse(
                    IdTipoBobinaServilleta=id_tipo,
                    NombreTipoBobinaServilleta=fila["NombreTipoBobinaServilleta"],
                    CantidadBobinas=fila["CantidadBobinasTipo"],
                    PesoBrutoTotalKg=fila["PesoBrutoTotalTipoKg"],
                    GramajePromedio=fila["GramajePromedioTipo"],
                    RecepcionMasAntigua=fila["RecepcionMasAntiguaTipo"],
                    RecepcionMasReciente=fila["RecepcionMasRecienteTipo"],
                )

            bobinas.append(
                ReporteInventarioBobinaServilletaDetalleResponse(
                    IdTipoBobinaServilleta=id_tipo,
                    NombreTipoBobinaServilleta=fila["NombreTipoBobinaServilleta"],
                    IdBobinaServilleta=fila["IdBobinaServilleta"],
                    CodigoLote=fila["CodigoLote"],
                    FechaRecepcion=fila["FechaRecepcion"],
                    NombreProveedor=fila["NombreProveedor"],
                    CodigoUnidad1=fila["CodigoUnidad1"],
                    DescripcionFormato1=fila["DescripcionFormato1"],
                    PesoBrutoKg1=fila["PesoBrutoKg1"],
                    GramajeGr1=fila["GramajeGr1"],
                    CodigoUnidad2=fila["CodigoUnidad2"],
                    DescripcionFormato2=fila["DescripcionFormato2"],
                    PesoBrutoKg2=fila["PesoBrutoKg2"],
                    GramajeGr2=fila["GramajeGr2"],
                )
            )

        return ReporteInventarioBobinaServilletaResponse(
            FechaGeneracion=primera["FechaGeneracion"],
            TotalBobinas=primera["TotalBobinasInforme"],
            PesoBrutoGeneralKg=primera["PesoBrutoGeneralKg"],
            Resumen=list(resumen.values()),
            Bobinas=bobinas,
        )

    def VerBobinasServilleta(
        self, data: VerBobinasServilletaRequest
    ) -> VerBobinasServilletaResponse:
        params = {
            "p_CodigoBobina": data.CodigoBobina,
            "p_IdProveedor": data.IdProveedor,
            "p_IdTipoBobinaServilleta": data.IdTipoBobinaServilleta,
            "p_IdEstadoMateriaPrima": data.IdEstadoMateriaPrima,
            "p_IdBobinaServilleta": data.IdBobinaServilleta,
        }

        try:
            filas = self.repository.VerBobinasServilleta(params)
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo obtener el catálogo de bobinas de servilleta, verifica los datos ingresados",
            )

        total = len(filas)
        inicio = (data.Pagina - 1) * data.TamanoPagina
        fin = inicio + data.TamanoPagina
        filas_pagina = filas[inicio:fin]

        bobinas = [BobinaServilletaCatalogoResponse(**fila) for fila in filas_pagina]

        return VerBobinasServilletaResponse(
            Total=total,
            Pagina=data.Pagina,
            TamanoPagina=data.TamanoPagina,
            Bobinas=bobinas,
        )

    def VerSubBobinasServilleta(
        self, data: VerSubBobinasServilletaRequest
    ) -> VerSubBobinasServilletaResponse:
        params = {
            "p_CodigoBobina": data.CodigoBobina,
            "p_IdProveedor": data.IdProveedor,
            "p_IdTipoBobinaServilleta": data.IdTipoBobinaServilleta,
            "p_IdsTipoMedidaSubBobina": data.IdsTipoMedidaSubBobina or None,
            "p_IdEstadoMateriaPrima": data.IdEstadoMateriaPrima,
            "p_IdBobinaServilleta": data.IdBobinaServilleta,
            "p_IdSubBobinaServilleta": data.IdSubBobinaServilleta,
        }

        try:
            filas = self.repository.VerSubBobinasServilleta(params)
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo obtener el catálogo de sub-bobinas de servilleta, verifica los datos ingresados",
            )

        total = len(filas)
        inicio = (data.Pagina - 1) * data.TamanoPagina
        fin = inicio + data.TamanoPagina
        filas_pagina = filas[inicio:fin]

        sub_bobinas = [
            SubBobinaServilletaCatalogoResponse(**fila) for fila in filas_pagina
        ]

        return VerSubBobinasServilletaResponse(
            Total=total,
            Pagina=data.Pagina,
            TamanoPagina=data.TamanoPagina,
            SubBobinas=sub_bobinas,
        )

    def ReporteInventarioSubBobina(self) -> ReporteInventarioSubBobinaServilletaResponse:
        try:
            filas_resumen = self.repository.VerResumenSubBobinas()
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo generar el resumen de sub-bobinas de servilleta",
            )

        resumen = [
            ReporteInventarioResumenMedidaResponse(**fila) for fila in filas_resumen
        ]
        total = sum(r.CantidadSubBobinas for r in resumen)

        if total == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No hay sub-bobinas de servilleta en almacén para el informe solicitado",
            )

        try:
            filas_detalle = self.repository.VerSubBobinasServilleta(
                {
                    "p_CodigoBobina": None,
                    "p_IdProveedor": None,
                    "p_IdTipoBobinaServilleta": None,
                    "p_IdsTipoMedidaSubBobina": None,
                    "p_IdEstadoMateriaPrima": 1,
                    "p_IdBobinaServilleta": None,
                    "p_IdSubBobinaServilleta": None,
                }
            )
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo obtener el detalle de sub-bobinas de servilleta",
            )

        sub_bobinas = [
            SubBobinaServilletaCatalogoResponse(**fila) for fila in filas_detalle
        ]

        return ReporteInventarioSubBobinaServilletaResponse(
            FechaGeneracion=datetime.now(ZONA_BOLIVIA),
            TotalSubBobinas=total,
            Resumen=resumen,
            SubBobinas=sub_bobinas,
        )

    def ReporteHistorialMovimientosUnidad(
        self, data: ReporteHistorialMovimientosUnidadServilletaRequest
    ) -> ReporteHistorialMovimientosUnidadServilletaResponse:
        try:
            filas = self.repository.ReporteHistorialMovimientosUnidadServilleta(
                {"p_IdUnidadBobinaServilleta": data.IdUnidadBobinaServilleta}
            )
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo obtener el historial de movimientos de la unidad, verifica los datos ingresados",
            )

        if not filas:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No se encontró la unidad de bobina de servilleta solicitada",
            )

        primera = filas[0]

        movimientos = [
            MovimientoSubBobinaHistorialResponse(**fila)
            for fila in filas
            if fila["IdMovimientoSubBobina"] is not None
        ]

        return ReporteHistorialMovimientosUnidadServilletaResponse(
            IdUnidadBobinaServilleta=primera["IdUnidadBobinaServilleta"],
            CodigoBobina=primera["CodigoBobina"],
            DescripcionFormato=primera["DescripcionFormato"],
            PesoBrutoKg=primera["PesoBrutoKg"],
            GramajeGr=primera["GramajeGr"],
            IdBobinaServilleta=primera["IdBobinaServilleta"],
            NombreTipoBobinaServilleta=primera["NombreTipoBobinaServilleta"],
            TipoEstado=primera["TipoEstado"],
            Movimientos=movimientos,
        )

    def ReporteDetalleBobinaServilleta(
        self, data: ReporteDetalleBobinaServilletaRequest
    ) -> ReporteDetalleBobinaServilletaResponse:
        try:
            filas = self.repository.ReporteDetalleBobinaServilleta(
                {"p_IdBobinaServilleta": data.IdBobinaServilleta}
            )
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo obtener el detalle de la bobina de servilleta, verifica los datos ingresados",
            )

        if not filas:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No se encontró la bobina de servilleta solicitada",
            )

        primera = filas[0]

        unidades: dict[int, UnidadDetalleBobinaServilletaResponse] = {}

        for fila in filas:
            id_unidad = fila["IdUnidadBobinaServilleta"]

            if id_unidad not in unidades:
                unidades[id_unidad] = UnidadDetalleBobinaServilletaResponse(
                    IdUnidadBobinaServilleta=id_unidad,
                    CodigoUnidad=fila["CodigoUnidad"],
                    DescripcionFormato=fila["DescripcionFormato"],
                    PesoBrutoKg=fila["PesoBrutoKg"],
                    GramajeGr=fila["GramajeGr"],
                    Movimientos=[],
                )

            if fila["IdMovimientoSubBobina"] is not None:
                unidades[id_unidad].Movimientos.append(
                    MovimientoSubBobinaHistorialResponse(**fila)
                )

        return ReporteDetalleBobinaServilletaResponse(
            IdBobinaServilleta=primera["IdBobinaServilleta"],
            NombreTipoBobinaServilleta=primera["NombreTipoBobinaServilleta"],
            TipoEstado=primera["TipoEstado"],
            CodigoLote=primera["CodigoLote"],
            FechaRecepcion=primera["FechaRecepcion"],
            NombreProveedor=primera["NombreProveedor"],
            Unidades=list(unidades.values()),
        )

    def VerLotesBobinaServilleta(
        self, data: VerLotesBobinaServilletaRequest
    ) -> VerLotesBobinaServilletaResponse:
        params = {
            "p_FechaInicio": data.FechaInicio,
            "p_FechaFin": data.FechaFin,
            "p_IdProveedor": data.IdProveedor,
            "p_IdsTipoBobinaServilleta": data.IdsTipoBobinaServilleta or None,
        }

        try:
            filas = self.repository.VerLotesBobinaServilleta(params)
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo obtener el catálogo de lotes, verifica los datos ingresados",
            )

        total = len(filas)
        inicio = (data.Pagina - 1) * data.TamanoPagina
        fin = inicio + data.TamanoPagina
        filas_pagina = filas[inicio:fin]

        lotes = [
            LoteBobinaServilletaCatalogoResponse(**fila) for fila in filas_pagina
        ]

        return VerLotesBobinaServilletaResponse(
            Total=total,
            Pagina=data.Pagina,
            TamanoPagina=data.TamanoPagina,
            Lotes=lotes,
        )

    def _ObtenerDetalleLoteServilleta(
        self, id_lote_bobina_servilleta: int
    ) -> ReporteLoteBobinaServilletaDetalleResponse | None:
        try:
            filas = self.repository.ReporteLoteBobinaServilletaDetalle(
                {"p_IdLoteBobinaServilleta": id_lote_bobina_servilleta}
            )
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo obtener el detalle del lote, verifica los datos ingresados",
            )

        if not filas:
            return None

        primera = filas[0]
        bobinas = [BobinaLoteServilletaDetalleResponse(**fila) for fila in filas]

        return ReporteLoteBobinaServilletaDetalleResponse(
            IdLoteBobinaServilleta=id_lote_bobina_servilleta,
            FechaRecepcion=primera["FechaRecepcion"],
            NombreProveedor=primera["NombreProveedor"],
            CantidadBobinas=primera["CantidadBobinas"],
            Bobinas=bobinas,
        )

    def ReporteLoteBobinaServilletaDetalle(
        self, data: ReporteLoteBobinaServilletaDetalleRequest
    ) -> ReporteLoteBobinaServilletaDetalleResponse:
        detalle = self._ObtenerDetalleLoteServilleta(data.IdLoteBobinaServilleta)

        if detalle is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No se encontró el lote solicitado",
            )

        return detalle

    def ReporteLotesServilletaPorPeriodo(
        self, data: ReporteLotesServilletaPorPeriodoRequest
    ) -> ReporteLotesServilletaPorPeriodoResponse:
        try:
            filas_lotes = self.repository.VerLotesBobinaServilleta(
                {
                    "p_FechaInicio": data.FechaInicio,
                    "p_FechaFin": data.FechaFin,
                    "p_IdProveedor": None,
                    "p_IdsTipoBobinaServilleta": None,
                }
            )
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudieron obtener los lotes del período, verifica los datos ingresados",
            )

        lotes = [
            detalle
            for fila in filas_lotes
            if (
                detalle := self._ObtenerDetalleLoteServilleta(
                    fila["IdLoteBobinaServilleta"]
                )
            )
            is not None
        ]
        total_bobinas = sum(lote.CantidadBobinas for lote in lotes)

        return ReporteLotesServilletaPorPeriodoResponse(
            PeriodoInicio=data.FechaInicio,
            PeriodoFin=data.FechaFin,
            TotalLotes=len(lotes),
            TotalBobinas=total_bobinas,
            Lotes=lotes,
        )
