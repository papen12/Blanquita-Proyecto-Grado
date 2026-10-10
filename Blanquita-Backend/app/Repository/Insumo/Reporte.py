from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.Repository.Consultas import filtro_rango
from app.Repository.DbCaller import DbCaller
from app.Schemas.Insumo import InventarioInsumo, MovimientoInsumo, TipoInsumo
from app.Schemas.MateriaPrima import TipoMovimientoMateriaPrima
from app.Schemas.Usuario import Rol, Usuario


class ReporteInsumoRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def ObtenerTiposInsumo(self) -> list[dict]:
        consulta = select(TipoInsumo.IdTipoInsumo, TipoInsumo.NombreInsumo).order_by(
            TipoInsumo.NombreInsumo
        )
        return self.caller.Consultar(consulta)

    def ReporteInventario(self, params: dict) -> list[dict]:
        ultimo_movimiento = (
            select(func.max(MovimientoInsumo.FechaMovimiento))
            .where(MovimientoInsumo.IdTipoInsumo == InventarioInsumo.IdTipoInsumo)
            .correlate(InventarioInsumo)
            .scalar_subquery()
            .label("FechaUltimoMovimiento")
        )

        consulta = (
            select(
                InventarioInsumo.IdTipoInsumo,
                TipoInsumo.NombreInsumo,
                TipoInsumo.DescripcionInsumo,
                InventarioInsumo.CantidadActual,
                ultimo_movimiento,
            )
            .join(TipoInsumo, InventarioInsumo.IdTipoInsumo == TipoInsumo.IdTipoInsumo)
            .order_by(TipoInsumo.NombreInsumo)
        )

        if params.get("p_IdsTipoInsumo"):
            consulta = consulta.where(
                InventarioInsumo.IdTipoInsumo.in_(params["p_IdsTipoInsumo"])
            )

        return self.caller.Consultar(consulta)

    def ReporteMovimientos(self, params: dict) -> list[dict]:
        mi = MovimientoInsumo

        consulta = (
            select(
                mi.IdMovimientoInsumo,
                mi.FechaMovimiento,
                mi.IdTipoInsumo,
                TipoInsumo.NombreInsumo,
                TipoMovimientoMateriaPrima.IdTipoMovimiento,
                TipoMovimientoMateriaPrima.NombreMovimiento,
                mi.CantidadMovimiento,
                mi.Observacion,
                Usuario.Ci,
                Usuario.PrimerNombre,
                Usuario.ApellidoPaterno,
                Rol.NombreRol,
            )
            .join(TipoInsumo, mi.IdTipoInsumo == TipoInsumo.IdTipoInsumo)
            .join(
                TipoMovimientoMateriaPrima,
                mi.IdTipoMovimiento == TipoMovimientoMateriaPrima.IdTipoMovimiento,
            )
            .join(Usuario, mi.IdUsuario == Usuario.IdUsuario)
            .join(Rol, Usuario.IdRol == Rol.IdRol)
            .where(
                *filtro_rango(
                    mi.FechaMovimiento, params.get("p_FechaInicio"), params.get("p_FechaFin")
                )
            )
            .order_by(mi.FechaMovimiento.desc(), mi.IdMovimientoInsumo.desc())
        )

        if params.get("p_IdsTipoInsumo"):
            consulta = consulta.where(mi.IdTipoInsumo.in_(params["p_IdsTipoInsumo"]))

        return self.caller.Consultar(consulta)
