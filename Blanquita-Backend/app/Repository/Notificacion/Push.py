from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import delete, func, select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.Constants.Estados import ESTADO_USUARIO_ACTIVO
from app.Constants.Push import CLAVE_CURSOR_HISTORIAL_ADMIN
from app.Constants.RegistroIngreso import REGISTRO_INTENTO_FALLIDO
from app.Repository.DbCaller import DbCaller
from app.Schemas.HistorialAdmin import HistorialAdmin
from app.Schemas.Notificacion import AlertaPushEnviada, SuscripcionPush
from app.Schemas.RegistroIngreso import RegistroIngreso
from app.Schemas.Usuario import Usuario


class PushRepository:
    def __init__(self, db: Session):
        self.db = db
        self.caller = DbCaller(db)

    def _Confirmar(self, mensaje_error: str) -> None:
        try:
            self.db.commit()
        except SQLAlchemyError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=mensaje_error,
            )

    def _Ejecutar(self, consulta, mensaje_error: str):
        try:
            resultado = self.db.execute(consulta)
        except SQLAlchemyError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=mensaje_error,
            )
        return resultado

    def GuardarSuscripcion(self, id_usuario: int, endpoint: str, claves: dict) -> None:
        mensaje = "No se pudo guardar la suscripción a las notificaciones"
        consulta = (
            insert(SuscripcionPush)
            .values(IdUsuario=id_usuario, Endpoint=endpoint, Claves=claves)
            .on_conflict_do_update(
                index_elements=[SuscripcionPush.Endpoint],
                set_={"IdUsuario": id_usuario, "Claves": claves},
            )
        )
        self._Ejecutar(consulta, mensaje)
        self._Confirmar(mensaje)

    def EliminarSuscripcionDeUsuario(self, id_usuario: int, endpoint: str) -> None:
        mensaje = "No se pudo eliminar la suscripción a las notificaciones"
        consulta = delete(SuscripcionPush).where(
            SuscripcionPush.Endpoint == endpoint,
            SuscripcionPush.IdUsuario == id_usuario,
        )
        self._Ejecutar(consulta, mensaje)
        self._Confirmar(mensaje)

    def EliminarSuscripcion(self, endpoint: str) -> None:
        mensaje = "No se pudo eliminar la suscripción vencida"
        self._Ejecutar(delete(SuscripcionPush).where(SuscripcionPush.Endpoint == endpoint), mensaje)
        self._Confirmar(mensaje)

    def SuscripcionDeUsuarioExiste(self, id_usuario: int, endpoint: str) -> bool:
        consulta = select(SuscripcionPush.IdSuscripcionPush).where(
            SuscripcionPush.Endpoint == endpoint,
            SuscripcionPush.IdUsuario == id_usuario,
        )
        return bool(self.caller.Consultar(consulta))

    def Destinatarios(
        self,
        roles: tuple[int, ...],
        solo_admin: bool,
        excluir: int | None,
    ) -> list[dict]:
        consulta = (
            select(
                SuscripcionPush.Endpoint,
                SuscripcionPush.Claves,
                Usuario.IdRol,
            )
            .join(Usuario, Usuario.IdUsuario == SuscripcionPush.IdUsuario)
            .where(Usuario.IdEstadoUsuario == ESTADO_USUARIO_ACTIVO)
        )
        if solo_admin:
            consulta = consulta.where(Usuario.IsAdmin.is_(True))
        else:
            consulta = consulta.where(Usuario.IdRol.in_(roles))
        if excluir is not None:
            consulta = consulta.where(Usuario.IdUsuario != excluir)
        return self.caller.Consultar(consulta)

    def ClavesAbiertas(self) -> set[str]:
        consulta = select(AlertaPushEnviada.Clave).where(
            AlertaPushEnviada.FechaResuelta.is_(None),
            AlertaPushEnviada.Clave != CLAVE_CURSOR_HISTORIAL_ADMIN,
        )
        return {fila["Clave"] for fila in self.caller.Consultar(consulta)}

    def RegistrarAlerta(self, clave: str, datos: dict) -> bool:
        mensaje = "No se pudo registrar la alerta"
        consulta = (
            insert(AlertaPushEnviada)
            .values(Clave=clave, Datos=datos)
            .on_conflict_do_nothing(
                index_elements=[AlertaPushEnviada.Clave],
                index_where=AlertaPushEnviada.FechaResuelta.is_(None),
            )
            .returning(AlertaPushEnviada.IdAlertaPushEnviada)
        )
        registrada = self._Ejecutar(consulta, mensaje).first() is not None
        self._Confirmar(mensaje)
        return registrada

    def ResolverAlertas(self, claves: set[str]) -> None:
        if not claves:
            return
        mensaje = "No se pudieron cerrar las alertas resueltas"
        consulta = (
            update(AlertaPushEnviada)
            .where(
                AlertaPushEnviada.Clave.in_(claves),
                AlertaPushEnviada.FechaResuelta.is_(None),
            )
            .values(FechaResuelta=datetime.now(timezone.utc))
        )
        self._Ejecutar(consulta, mensaje)
        self._Confirmar(mensaje)

    def ObtenerCursorBloqueado(self) -> AlertaPushEnviada | None:
        consulta = (
            select(AlertaPushEnviada)
            .where(
                AlertaPushEnviada.Clave == CLAVE_CURSOR_HISTORIAL_ADMIN,
                AlertaPushEnviada.FechaResuelta.is_(None),
            )
            .with_for_update()
        )
        return self._Ejecutar(consulta, "No se pudo leer el avance de las alertas").scalars().first()

    def ActualizarCursor(self, cursor: AlertaPushEnviada, id_historial: int) -> None:
        cursor.Datos = {"IdHistorialAdmin": id_historial}
        self._Confirmar("No se pudo guardar el avance de las alertas")

    def LiberarCursor(self) -> None:
        self.db.rollback()

    def UltimoHistorialAdmin(self) -> int:
        consulta = select(func.coalesce(func.max(HistorialAdmin.IdHistorialAdmin), 0).label("Ultimo"))
        return self.caller.Consultar(consulta)[0]["Ultimo"]

    def HistorialAdminDesde(self, id_historial: int) -> list[dict]:
        consulta = (
            select(
                HistorialAdmin.IdHistorialAdmin,
                HistorialAdmin.IdUsuario,
                HistorialAdmin.Observacion,
            )
            .where(HistorialAdmin.IdHistorialAdmin > id_historial)
            .order_by(HistorialAdmin.IdHistorialAdmin)
        )
        return self.caller.Consultar(consulta)

    def IntentosFallidosPorCi(self, desde: datetime, minimo: int) -> list[dict]:
        intentos = func.count(RegistroIngreso.IdRegistroIngreso)
        consulta = (
            select(RegistroIngreso.CiIntentado, intentos.label("Intentos"))
            .where(
                RegistroIngreso.Registro == REGISTRO_INTENTO_FALLIDO,
                RegistroIngreso.CiIntentado.is_not(None),
                RegistroIngreso.FechaRegistro >= desde,
            )
            .group_by(RegistroIngreso.CiIntentado)
            .having(intentos >= minimo)
        )
        return self.caller.Consultar(consulta)
