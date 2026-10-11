from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.Constants.Cantidades import DIAS_MAXIMOS_REPORTE_PRODUCCION
from app.Models.Insumo.Reporte import (
    InventarioInsumoResponse,
    MovimientoInsumoReporteResponse,
    ReporteInventarioInsumoRequest,
    ReporteInventarioInsumoResponse,
    ReporteMovimientosInsumoRequest,
    ReporteMovimientosInsumoResponse,
    ResumenMovimientosInsumoResponse,
)
from app.Repository.Insumo.Reporte import ReporteInsumoRepository
from app.utils.dates import ZONA_BOLIVIA

ID_TIPO_MOVIMIENTO_INGRESO = 1
ID_TIPO_MOVIMIENTO_SALIDA = 2


class ReporteInsumoService:
    def __init__(self, db: Session):
        self.repository = ReporteInsumoRepository(db)

    def ReporteInventario(
        self, data: ReporteInventarioInsumoRequest
    ) -> ReporteInventarioInsumoResponse:
        todos_los_tipos = self._ValidarTipos(data.IdsTipoInsumo)

        filas = self.repository.ReporteInventario(
            {"p_IdsTipoInsumo": data.IdsTipoInsumo or None}
        )

        if not filas:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No hay insumos registrados para los tipos seleccionados",
            )

        return ReporteInventarioInsumoResponse(
            FechaGeneracion=datetime.now(ZONA_BOLIVIA),
            TodosLosTipos=todos_los_tipos,
            Insumos=[InventarioInsumoResponse(**fila) for fila in filas],
        )

    def ReporteMovimientos(
        self, data: ReporteMovimientosInsumoRequest
    ) -> ReporteMovimientosInsumoResponse:
        resumen = self.ResumenMovimientos(data)

        if not resumen.Movimientos:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No se registraron movimientos de insumos en el período y los tipos seleccionados",
            )

        return resumen

    def ResumenMovimientos(
        self, data: ReporteMovimientosInsumoRequest
    ) -> ReporteMovimientosInsumoResponse:
        if data.FechaInicio > data.FechaFin:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="La fecha de inicio no puede ser posterior a la fecha de fin",
            )

        dias_periodo = (data.FechaFin - data.FechaInicio).days + 1
        if dias_periodo > DIAS_MAXIMOS_REPORTE_PRODUCCION:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"El rango de fechas no puede superar los {DIAS_MAXIMOS_REPORTE_PRODUCCION} días",
            )

        todos_los_tipos = self._ValidarTipos(data.IdsTipoInsumo)
        ids_tipo = data.IdsTipoInsumo or None

        movimientos = [
            MovimientoInsumoReporteResponse(**fila)
            for fila in self.repository.ReporteMovimientos(
                {
                    "p_FechaInicio": data.FechaInicio,
                    "p_FechaFin": data.FechaFin,
                    "p_IdsTipoInsumo": ids_tipo,
                }
            )
        ]

        inventario = self.repository.ReporteInventario({"p_IdsTipoInsumo": ids_tipo})

        return ReporteMovimientosInsumoResponse(
            PeriodoInicio=data.FechaInicio,
            PeriodoFin=data.FechaFin,
            TodosLosTipos=todos_los_tipos,
            Resumen=[self._ResumenInsumo(fila, movimientos) for fila in inventario],
            Movimientos=movimientos,
        )

    def _ResumenInsumo(
        self, fila: dict, movimientos: list[MovimientoInsumoReporteResponse]
    ) -> ResumenMovimientosInsumoResponse:
        propios = [m for m in movimientos if m.IdTipoInsumo == fila["IdTipoInsumo"]]
        ingresos = sum(
            m.CantidadMovimiento for m in propios if m.IdTipoMovimiento == ID_TIPO_MOVIMIENTO_INGRESO
        )
        salidas = sum(
            m.CantidadMovimiento for m in propios if m.IdTipoMovimiento == ID_TIPO_MOVIMIENTO_SALIDA
        )

        return ResumenMovimientosInsumoResponse(
            IdTipoInsumo=fila["IdTipoInsumo"],
            NombreInsumo=fila["NombreInsumo"],
            Ingresos=ingresos,
            Salidas=salidas,
            Neto=ingresos - salidas,
            NumeroMovimientos=len(propios),
            CantidadActual=fila["CantidadActual"],
        )

    def _ValidarTipos(self, ids_tipo_insumo: list[int] | None) -> bool:
        tipos = self.repository.ObtenerTiposInsumo()
        ids_solicitados = set(ids_tipo_insumo or [])

        if ids_solicitados - {t["IdTipoInsumo"] for t in tipos}:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Uno o más insumos seleccionados no existen",
            )

        return not ids_solicitados or ids_solicitados == {t["IdTipoInsumo"] for t in tipos}
