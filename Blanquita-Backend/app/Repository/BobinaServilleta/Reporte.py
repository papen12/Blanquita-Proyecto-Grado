from sqlalchemy import case, func, or_, select
from sqlalchemy.orm import Session

from app.Repository.DbCaller import DbCaller
from app.Repository.Consultas import filtro_rango, nombre_operador
from app.Schemas.BobinaServilleta import (
    BobinaServilleta,
    SubBobinaServilleta,
    TipoBobinaServilleta,
    TipoMedidaSubBobina,
    UnidadBobinaServilleta,
)
from app.Schemas.Produccion import (
    CancelacionProduccionServilleta,
    EstadoProduccion,
    PausaProduccionServilleta,
    ProduccionServilleta,
    Turno,
)
from app.Schemas.Usuario import Rol, Usuario


class ReporteBobinaServilletaRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def ReporteInventario(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "ReporteInventarioBobinaServilleta"(
                CAST(:p_IdsTipoBobinaServilleta AS integer[])
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def VerBobinasServilleta(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerBobinasServilleta"(
                :p_CodigoBobina,
                :p_IdProveedor,
                :p_IdTipoBobinaServilleta,
                :p_IdEstadoMateriaPrima,
                :p_IdBobinaServilleta
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def VerResumenSubBobinas(self) -> list[dict]:
        sql = """
            SELECT * FROM "VerResumenInventarioSubBobinaServilleta"()
        """
        return self.caller.LlamarFuncion(sql)

    def VerSubBobinasServilleta(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerSubBobinasServilleta"(
                :p_CodigoBobina,
                :p_IdProveedor,
                :p_IdTipoBobinaServilleta,
                CAST(:p_IdsTipoMedidaSubBobina AS integer[]),
                :p_IdEstadoMateriaPrima,
                :p_IdBobinaServilleta,
                :p_IdSubBobinaServilleta
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def ReporteHistorialMovimientosUnidadServilleta(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "ReporteHistorialMovimientosUnidadServilleta"(
                :p_IdUnidadBobinaServilleta
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def ReporteDetalleBobinaServilleta(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "ReporteDetalleBobinaServilleta"(
                :p_IdBobinaServilleta
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def ReporteHistorialMovimientosBobinaServilleta(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "ReporteHistorialMovimientosBobinaServilleta"(
                :p_IdBobinaServilleta
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def VerLotesBobinaServilleta(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerLotesBobinaServilleta"(
                :p_FechaInicio,
                :p_FechaFin,
                :p_IdProveedor,
                CAST(:p_IdsTipoBobinaServilleta AS integer[])
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def ReporteLoteBobinaServilletaDetalle(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "ReporteLoteBobinaServilletaDetalle"(
                :p_IdLoteBobinaServilleta
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def VerProduccionesServilleta(self, params: dict) -> list[dict]:
        ps = ProduccionServilleta
        fecha_referencia = func.coalesce(ps.FechaFinProduccion, ps.FechaInicioProduccion)

        consulta = (
            select(
                ps.IdProduccionServilleta,
                EstadoProduccion.NombreEstadoProduccion,
                Turno.NombreTurno,
                nombre_operador(Usuario).label("Operador"),
                Usuario.Ci,
                Rol.NombreRol,
                TipoBobinaServilleta.NombreTipoBobinaServilleta,
                UnidadBobinaServilleta.CodigoBobina,
                TipoMedidaSubBobina.Descripcion.label("DescripcionMedida"),
                SubBobinaServilleta.IdSubBobinaServilleta,
                ps.FechaInicioProduccion,
                ps.FechaFinProduccion,
                (ps.FechaFinProduccion - ps.FechaInicioProduccion).label("DuracionTotal"),
            )
            .join(EstadoProduccion, EstadoProduccion.IdEstadoProduccion == ps.IdEstadoProduccion)
            .join(Turno, Turno.IdTurno == ps.IdTurno)
            .join(SubBobinaServilleta, SubBobinaServilleta.IdSubBobinaServilleta == ps.IdSubBobina)
            .join(
                TipoMedidaSubBobina,
                TipoMedidaSubBobina.IdTipoMedidaSubBobina == SubBobinaServilleta.IdTipoMedidaSubBobina,
            )
            .join(
                UnidadBobinaServilleta,
                UnidadBobinaServilleta.IdUnidadBobinaServilleta
                == SubBobinaServilleta.IdUnidadBobinaServilleta,
            )
            .join(
                BobinaServilleta,
                BobinaServilleta.IdBobinaServilleta == UnidadBobinaServilleta.IdBobinaServilleta,
            )
            .join(
                TipoBobinaServilleta,
                TipoBobinaServilleta.IdTipoBobinaServilleta == BobinaServilleta.IdTipoBobinaServilleta,
            )
            .join(Usuario, Usuario.IdUsuario == ps.IdUsuario)
            .join(Rol, Rol.IdRol == Usuario.IdRol)
            .where(
                *filtro_rango(
                    fecha_referencia, params.get("p_FechaInicio"), params.get("p_FechaFin")
                )
            )
            .order_by(fecha_referencia.desc())
        )

        if params.get("p_IdTurno") is not None:
            consulta = consulta.where(ps.IdTurno == params["p_IdTurno"])

        if params.get("p_IdsTipoBobinaServilleta"):
            consulta = consulta.where(
                BobinaServilleta.IdTipoBobinaServilleta.in_(params["p_IdsTipoBobinaServilleta"])
            )

        if params.get("p_CodigoBobina"):
            consulta = consulta.where(UnidadBobinaServilleta.CodigoBobina == params["p_CodigoBobina"])

        operador = params.get("p_Operador")
        if operador:
            consulta = consulta.where(
                or_(
                    Usuario.Ci == operador,
                    nombre_operador(Usuario).ilike(f"%{operador}%"),
                )
            )

        if params.get("p_IdEstadoProduccion") is not None:
            consulta = consulta.where(ps.IdEstadoProduccion == params["p_IdEstadoProduccion"])

        if params.get("p_IdsEstadoProduccion"):
            consulta = consulta.where(ps.IdEstadoProduccion.in_(params["p_IdsEstadoProduccion"]))

        return self.caller.Consultar(consulta)

    def ReporteProduccionServilletaDetalle(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "ReporteProduccionServilletaDetalle"(
                :p_IdProduccion
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def ReportePausasProduccionServilleta(self, params: dict) -> list[dict]:
        pausa = PausaProduccionServilleta
        ps = ProduccionServilleta

        consulta = (
            select(
                pausa.IdPausaProduccionServilleta,
                pausa.IdProduccionServilleta,
                UnidadBobinaServilleta.CodigoBobina,
                Turno.NombreTurno,
                pausa.FechaHoraPausa,
                pausa.MotivoPausaProduccion,
                pausa.FechaHoraReanudacion,
                (pausa.FechaHoraReanudacion - pausa.FechaHoraPausa).label("DuracionPausa"),
                nombre_operador(Usuario).label("OperadorPausa"),
                Rol.NombreRol.label("RolPausa"),
                case(
                    (pausa.FechaHoraReanudacion.is_(None), "Abierta"),
                    else_="Cerrada",
                ).label("EstadoPausa"),
            )
            .join(ps, ps.IdProduccionServilleta == pausa.IdProduccionServilleta)
            .join(SubBobinaServilleta, SubBobinaServilleta.IdSubBobinaServilleta == ps.IdSubBobina)
            .join(
                UnidadBobinaServilleta,
                UnidadBobinaServilleta.IdUnidadBobinaServilleta
                == SubBobinaServilleta.IdUnidadBobinaServilleta,
            )
            .join(Turno, Turno.IdTurno == ps.IdTurno)
            .join(Usuario, Usuario.IdUsuario == pausa.IdUsuario)
            .join(Rol, Rol.IdRol == Usuario.IdRol)
            .where(
                *filtro_rango(
                    pausa.FechaHoraPausa, params.get("p_FechaInicio"), params.get("p_FechaFin")
                )
            )
            .order_by(pausa.FechaHoraPausa.desc())
        )

        if params.get("p_IdProduccion") is not None:
            consulta = consulta.where(pausa.IdProduccionServilleta == params["p_IdProduccion"])

        if params.get("p_IdTurno") is not None:
            consulta = consulta.where(ps.IdTurno == params["p_IdTurno"])

        solo_abiertas = params.get("p_SoloAbiertas")
        if solo_abiertas is True:
            consulta = consulta.where(pausa.FechaHoraReanudacion.is_(None))
        elif solo_abiertas is False:
            consulta = consulta.where(pausa.FechaHoraReanudacion.is_not(None))

        return self.caller.Consultar(consulta)

    def VerCancelacionesProduccionServilleta(self, params: dict) -> list[dict]:
        cancelacion = CancelacionProduccionServilleta

        consulta = (
            select(
                cancelacion.IdProduccionServilleta,
                cancelacion.FechaHoraCancelacion,
                cancelacion.MotivoCancelacion,
                Usuario.Ci,
                Usuario.PrimerNombre,
                Usuario.ApellidoPaterno,
                Rol.NombreRol,
            )
            .join(Usuario, Usuario.IdUsuario == cancelacion.IdUsuario)
            .join(Rol, Rol.IdRol == Usuario.IdRol)
            .where(
                *filtro_rango(
                    cancelacion.FechaHoraCancelacion,
                    params.get("p_FechaInicio"),
                    params.get("p_FechaFin"),
                )
            )
            .order_by(cancelacion.FechaHoraCancelacion.desc())
        )

        return self.caller.Consultar(consulta)

    def ReporteCancelacionProduccionServilleta(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "ReporteCancelacionProduccionServilleta"(
                :p_IdProduccion
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)
