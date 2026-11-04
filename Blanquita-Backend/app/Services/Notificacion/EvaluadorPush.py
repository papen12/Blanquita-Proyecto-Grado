from dataclasses import asdict
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.Constants.AlertaStock import DOMINIO_STOCK_PRODUCTO, NIVEL_STOCK_CRITICO
from app.Constants.Cantidades import HORAS_ALERTA_PAUSA_ABIERTA, HORAS_ALERTA_PRODUCCION_LARGA
from app.Constants.Estados import ESTADO_PRODUCCION_EN_PRODUCCION, ESTADO_PRODUCCION_PAUSA
from app.Constants.Push import INTENTOS_FALLIDOS_ALERTA, MINUTOS_INTENTOS_FALLIDOS, CLAVE_CURSOR_HISTORIAL_ADMIN
from app.Models.Notificacion.Push import EvaluacionPushResponse
from app.Repository.AlertaStock.AlertaStock import AlertaStockRepository
from app.Repository.BobinaPapel.Inicio import InicioBobinaPapelRepository
from app.Repository.BobinaServilleta.Inicio import InicioBobinaServilletaRepository
from app.Services.Notificacion.Avisos import (
    RUTA_PRODUCCION_BOBINA_PAPEL,
    RUTA_PRODUCCION_BOBINA_SERVILLETA,
    aviso_accion_admin,
    aviso_intentos_fallidos,
    aviso_pausa_larga,
    aviso_produccion_larga,
    aviso_sin_cerrar,
    aviso_sin_stock,
    aviso_stock_critico,
)
from app.Services.Notificacion.Push import AvisoPush, PushService
from app.utils.horario import en_modo_consulta
from app.utils.inicio import SemanaInicio, produccion_larga, semana_inicio

ESTADOS_SIN_CERRAR = (ESTADO_PRODUCCION_EN_PRODUCCION, ESTADO_PRODUCCION_PAUSA)


def _clave_critico(id_presentacion: int) -> str:
    return f"stock:producto:{id_presentacion}:critico"


def _clave_sin_stock(id_presentacion: int) -> str:
    return f"stock:producto:{id_presentacion}:cero"


class EvaluadorPushService:
    def __init__(self, db: Session):
        self.push = PushService(db)
        self.repository = self.push.repository
        self.stock = AlertaStockRepository(db)
        self.bobina_papel = InicioBobinaPapelRepository(db)
        self.bobina_servilleta = InicioBobinaServilletaRepository(db)

    def Evaluar(self) -> EvaluacionPushResponse:
        if en_modo_consulta():
            return EvaluacionPushResponse(ModoConsulta=True, Enviadas=0, Resueltas=0)

        semana = semana_inicio()
        activas = self._AlertasActivas(semana)
        abiertas = self.repository.ClavesAbiertas()
        resueltas = abiertas - set(activas)
        self.repository.ResolverAlertas(resueltas)

        cursor = self.repository.ObtenerCursorBloqueado()
        primera_vuelta = cursor is None
        acciones_admin = self._AccionesAdminNuevas(cursor)

        nuevas = {
            clave: aviso
            for clave, aviso in activas.items()
            if clave not in abiertas and self.repository.RegistrarAlerta(clave, asdict(aviso))
        }

        if primera_vuelta:
            return EvaluacionPushResponse(ModoConsulta=False, Enviadas=0, Resueltas=len(resueltas))

        enviadas = sum(
            self.push.Enviar(aviso) for clave, aviso in nuevas.items() if not self._Reemplazada(clave, nuevas)
        )
        enviadas += sum(
            self.push.Enviar(aviso_accion_admin(accion["Observacion"]), accion["IdUsuario"])
            for accion in acciones_admin
        )
        return EvaluacionPushResponse(ModoConsulta=False, Enviadas=enviadas, Resueltas=len(resueltas))

    def _Reemplazada(self, clave: str, nuevas: dict[str, AvisoPush]) -> bool:
        return clave.endswith(":critico") and clave.replace(":critico", ":cero") in nuevas

    def _AccionesAdminNuevas(self, cursor) -> list[dict]:
        if cursor is None:
            self.repository.LiberarCursor()
            self.repository.RegistrarAlerta(
                CLAVE_CURSOR_HISTORIAL_ADMIN,
                {"IdHistorialAdmin": self.repository.UltimoHistorialAdmin()},
            )
            return []

        acciones = self.repository.HistorialAdminDesde(cursor.Datos["IdHistorialAdmin"])
        if not acciones:
            self.repository.LiberarCursor()
            return []

        self.repository.ActualizarCursor(cursor, acciones[-1]["IdHistorialAdmin"])
        return acciones

    def _AlertasActivas(self, semana: SemanaInicio) -> dict[str, AvisoPush]:
        return {
            **self._AlertasStock(),
            **self._AlertasPausa(semana),
            **self._AlertasProduccionPapel(semana),
            **self._AlertasProduccionServilleta(semana),
            **self._AlertasIngreso(semana.ahora),
        }

    def _AlertasStock(self) -> dict[str, AvisoPush]:
        alertas = {}
        for fila in self.stock.ListarStock(dominio=DOMINIO_STOCK_PRODUCTO, solo_alertas=True):
            if fila["NivelStock"] != NIVEL_STOCK_CRITICO:
                continue
            cantidad = int(fila["CantidadActual"])
            alertas[_clave_critico(fila["Id"])] = aviso_stock_critico(fila["Nombre"], cantidad, fila["StockMinimo"])
            if cantidad <= 0:
                alertas[_clave_sin_stock(fila["Id"])] = aviso_sin_stock(fila["Nombre"])
        return alertas

    def _AlertasPausa(self, semana: SemanaInicio) -> dict[str, AvisoPush]:
        alertas = {}
        for fila in self.bobina_papel.PausasAbiertas():
            if semana.pausa_atrasada(fila["FechaHoraPausa"]):
                alertas[f"pausa:papel:{fila['IdPausaProduccionBobinaTubo']}"] = aviso_pausa_larga(
                    "bobina papel",
                    fila["MotivoPausaProduccion"],
                    HORAS_ALERTA_PAUSA_ABIERTA,
                    RUTA_PRODUCCION_BOBINA_PAPEL,
                )
        for fila in self.bobina_servilleta.PausasAbiertas():
            if semana.pausa_atrasada(fila["FechaHoraPausa"]):
                alertas[f"pausa:servilleta:{fila['IdPausaProduccionServilleta']}"] = aviso_pausa_larga(
                    "bobina servilleta",
                    fila["MotivoPausaProduccion"],
                    HORAS_ALERTA_PAUSA_ABIERTA,
                    RUTA_PRODUCCION_BOBINA_SERVILLETA,
                )
        return alertas

    def _AlertasProduccionPapel(self, semana: SemanaInicio) -> dict[str, AvisoPush]:
        producciones = self.bobina_papel.ProduccionesEnCurso()
        pausas = self.bobina_papel.PausasPorProduccion(
            [fila["IdProduccionBobinaTubo"] for fila in producciones]
        )
        alertas = {}
        for fila in producciones:
            id_produccion = fila["IdProduccionBobinaTubo"]
            if produccion_larga(fila["FechaInicioProduccion"], pausas.get(id_produccion, []), semana.ahora):
                alertas[f"larga:papel:{id_produccion}"] = aviso_produccion_larga(
                    fila["NombreProducto"], HORAS_ALERTA_PRODUCCION_LARGA
                )
            if fila["IdEstadoProduccion"] in ESTADOS_SIN_CERRAR and semana.produccion_atrasada(
                fila["FechaInicioProduccion"]
            ):
                alertas[f"sincerrar:papel:{id_produccion}"] = aviso_sin_cerrar(
                    f"La producción de {fila['NombreProducto']}", RUTA_PRODUCCION_BOBINA_PAPEL
                )
        return alertas

    def _AlertasProduccionServilleta(self, semana: SemanaInicio) -> dict[str, AvisoPush]:
        alertas = {}
        for fila in self.bobina_servilleta.ProduccionesSinCerrar():
            if semana.produccion_atrasada(fila["FechaInicioProduccion"]):
                alertas[f"sincerrar:servilleta:{fila['IdProduccionServilleta']}"] = aviso_sin_cerrar(
                    f"La producción de servilleta de {fila['MedidaMm']} mm",
                    RUTA_PRODUCCION_BOBINA_SERVILLETA,
                )
        return alertas

    def _AlertasIngreso(self, ahora: datetime) -> dict[str, AvisoPush]:
        desde = ahora.astimezone(timezone.utc) - timedelta(minutes=MINUTOS_INTENTOS_FALLIDOS)
        return {
            f"ingreso:{fila['CiIntentado']}": aviso_intentos_fallidos(
                fila["CiIntentado"], fila["Intentos"], MINUTOS_INTENTOS_FALLIDOS
            )
            for fila in self.repository.IntentosFallidosPorCi(desde, INTENTOS_FALLIDOS_ALERTA)
        }
