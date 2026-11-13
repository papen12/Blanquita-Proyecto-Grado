from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db
from app.Services.Notificacion.Push import avisar_push
from app.Services.Notificacion.Avisos import (
    aviso_cambio_linea,
    aviso_cancelacion,
    aviso_finalizacion,
    aviso_inicio_produccion,
    aviso_pausa,
    aviso_posposicion,
    aviso_reanudacion,
    aviso_retomada,
    RUTA_PRODUCCION_BOBINA_PAPEL,
)

from app.Services.BobinaPapel.ProduccionBobinaPapelService import (
    ProduccionBobinaPapelService,
)

from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR, ROL_GERENTE_GENERAL

from app.Models.BobinaPapel.ProduccionBobinaPapel import (
    IniciarProduccionBobinaTuboRequest,
    IniciarProduccionBobinaTuboResponse,
    CambiarLineaProduccionBobinaTuboRequest,
    CambiarLineaProduccionBobinaTuboResponse,
    FinalizarProduccionBobinaTuboRequest,
    FinalizarProduccionBobinaTuboResponse,
    PausarProduccionBobinaTuboRequest,
    PausarProduccionBobinaTuboResponse,
    ReanudarProduccionBobinaTuboRequest,
    ReanudarProduccionBobinaTuboResponse,
    PosponerProduccionBobinaTuboRequest,
    PosponerProduccionBobinaTuboResponse,
    RetomarProduccionBobinaTuboRequest,
    RetomarProduccionBobinaTuboResponse,
    CancelarProduccionBobinaTuboRequest,
    CancelarProduccionBobinaTuboResponse,
    InsertarMovimientoOperadorLogsRequest,
    InsertarMovimientoOperadorLogsResponse,
    VerProduccionBobinaTuboRequest,
    VerProduccionBobinaTuboResponse,
    VerPausasProduccionBobinaTuboActivasRequest,
    VerPausasProduccionBobinaTuboActivasResponse,
    VerPospuestasProduccionBobinaTuboResponse,
)


def produccion_bobina_papel_service(
    db: Session = Depends(get_db),
) -> ProduccionBobinaPapelService:
    return ProduccionBobinaPapelService(db)


ProduccionBobinaPapelRouter = APIRouter(
    prefix="/papelbobina/produccion", tags=["Papel Bobina - Producción"]
)


@ProduccionBobinaPapelRouter.post(
    "/iniciar",
    response_model=IniciarProduccionBobinaTuboResponse,
    status_code=201,
)
def IniciarProduccion(
    data: IniciarProduccionBobinaTuboRequest,
    tareas: BackgroundTasks,
    usuario_actual: dict = Depends(
        require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])
    ),
    service: ProduccionBobinaPapelService = Depends(produccion_bobina_papel_service),
):
    resultado = service.IniciarProduccionBobinaTubo(data, usuario_actual["IdUsuario"])
    avisar_push(tareas, aviso_inicio_produccion("bobina papel", f"{resultado.NombreProducto}, turno {resultado.NombreTurno}.", RUTA_PRODUCCION_BOBINA_PAPEL), usuario_actual["IdUsuario"])
    return resultado


@ProduccionBobinaPapelRouter.post(
    "/cambiarlinea",
    response_model=CambiarLineaProduccionBobinaTuboResponse,
    status_code=201,
)
def CambiarLineaProduccion(
    data: CambiarLineaProduccionBobinaTuboRequest,
    tareas: BackgroundTasks,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: ProduccionBobinaPapelService = Depends(produccion_bobina_papel_service),
):
    resultado = service.CambiarLineaProduccion(data, usuario_actual["IdUsuario"])
    avisar_push(tareas, aviso_cambio_linea(resultado.NombreProducto, resultado.NombreTurno), usuario_actual["IdUsuario"])
    return resultado


@ProduccionBobinaPapelRouter.post(
    "/finalizar",
    response_model=FinalizarProduccionBobinaTuboResponse,
    status_code=200,
)
def FinalizarProduccion(
    data: FinalizarProduccionBobinaTuboRequest,
    tareas: BackgroundTasks,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: ProduccionBobinaPapelService = Depends(produccion_bobina_papel_service),
):
    resultado = service.FinalizarProduccion(data, usuario_actual["IdUsuario"])
    avisar_push(tareas, aviso_finalizacion("bobina papel", f"{resultado.NombreProducto}: {resultado.CantidadLogs} logs.", RUTA_PRODUCCION_BOBINA_PAPEL), usuario_actual["IdUsuario"])
    return resultado


@ProduccionBobinaPapelRouter.post(
    "/pausar",
    response_model=PausarProduccionBobinaTuboResponse,
    status_code=200,
)
def PausarProduccion(
    data: PausarProduccionBobinaTuboRequest,
    tareas: BackgroundTasks,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: ProduccionBobinaPapelService = Depends(produccion_bobina_papel_service),
):
    resultado = service.PausarProduccion(data, usuario_actual["IdUsuario"])
    avisar_push(tareas, aviso_pausa("bobina papel", resultado.MotivoPausaProduccion, RUTA_PRODUCCION_BOBINA_PAPEL), usuario_actual["IdUsuario"])
    return resultado


@ProduccionBobinaPapelRouter.post(
    "/reanudar",
    response_model=ReanudarProduccionBobinaTuboResponse,
    status_code=200,
)
def ReanudarProduccion(
    data: ReanudarProduccionBobinaTuboRequest,
    tareas: BackgroundTasks,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: ProduccionBobinaPapelService = Depends(produccion_bobina_papel_service),
):
    resultado = service.ReanudarProduccion(data, usuario_actual["IdUsuario"])
    avisar_push(tareas, aviso_reanudacion("bobina papel", resultado.MotivoReanudacion, RUTA_PRODUCCION_BOBINA_PAPEL), usuario_actual["IdUsuario"])
    return resultado


@ProduccionBobinaPapelRouter.post(
    "/posponer",
    response_model=PosponerProduccionBobinaTuboResponse,
    status_code=200,
)
def PosponerProduccion(
    data: PosponerProduccionBobinaTuboRequest,
    tareas: BackgroundTasks,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: ProduccionBobinaPapelService = Depends(produccion_bobina_papel_service),
):
    resultado = service.PosponerProduccion(data, usuario_actual["IdUsuario"])
    avisar_push(tareas, aviso_posposicion("bobina papel", data.MotivoPosposicion, RUTA_PRODUCCION_BOBINA_PAPEL), usuario_actual["IdUsuario"])
    return resultado


@ProduccionBobinaPapelRouter.post(
    "/retomar",
    response_model=RetomarProduccionBobinaTuboResponse,
    status_code=200,
)
def RetomarProduccion(
    data: RetomarProduccionBobinaTuboRequest,
    tareas: BackgroundTasks,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: ProduccionBobinaPapelService = Depends(produccion_bobina_papel_service),
):
    resultado = service.RetomarProduccion(data, usuario_actual["IdUsuario"])
    avisar_push(tareas, aviso_retomada("bobina papel", resultado.MotivoReanudacion, RUTA_PRODUCCION_BOBINA_PAPEL), usuario_actual["IdUsuario"])
    return resultado


@ProduccionBobinaPapelRouter.post(
    "/cancelar",
    response_model=CancelarProduccionBobinaTuboResponse,
    status_code=200,
)
def CancelarProduccion(
    data: CancelarProduccionBobinaTuboRequest,
    tareas: BackgroundTasks,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: ProduccionBobinaPapelService = Depends(produccion_bobina_papel_service),
):
    resultado = service.CancelarProduccion(data, usuario_actual["IdUsuario"])
    avisar_push(tareas, aviso_cancelacion("bobina papel", data.MotivoCancelacion, RUTA_PRODUCCION_BOBINA_PAPEL), usuario_actual["IdUsuario"])
    return resultado


@ProduccionBobinaPapelRouter.post(
    "/insertarlog",
    response_model=InsertarMovimientoOperadorLogsResponse,
    status_code=201,
)
def InsertarMovimientoLog(
    data: InsertarMovimientoOperadorLogsRequest,
    usuario_actual: dict = Depends(
        require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])
    ),
    service: ProduccionBobinaPapelService = Depends(produccion_bobina_papel_service),
):
    return service.InsertarMovimientoOperadorLogs(data, usuario_actual["IdUsuario"])


@ProduccionBobinaPapelRouter.get(
    "/activas",
    response_model=list[VerProduccionBobinaTuboResponse],
    status_code=200,
    dependencies=[
        Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR, ROL_GERENTE_GENERAL]))
    ],
)
def VerProduccionBobinaTubo(
    IdTipoBobina: int | None = None,
    IdProducto: int | None = None,
    service: ProduccionBobinaPapelService = Depends(produccion_bobina_papel_service),
):
    return service.VerProduccionBobinaTubo(
        VerProduccionBobinaTuboRequest(IdTipoBobina=IdTipoBobina, IdProducto=IdProducto)
    )


@ProduccionBobinaPapelRouter.get(
    "/pausadas",
    response_model=list[VerPausasProduccionBobinaTuboActivasResponse],
    status_code=200,
    dependencies=[
        Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR, ROL_GERENTE_GENERAL]))
    ],
)
def VerPausasProduccionBobinaTuboActivas(
    FiltroIdTipoBobina: int | None = None,
    FiltroIdProducto: int | None = None,
    service: ProduccionBobinaPapelService = Depends(produccion_bobina_papel_service),
):
    return service.VerPausasActivas(
        VerPausasProduccionBobinaTuboActivasRequest(
            FiltroIdTipoBobina=FiltroIdTipoBobina,
            FiltroIdProducto=FiltroIdProducto,
        )
    )


@ProduccionBobinaPapelRouter.get(
    "/pospuestas",
    response_model=list[VerPospuestasProduccionBobinaTuboResponse],
    status_code=200,
    dependencies=[
        Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR, ROL_GERENTE_GENERAL]))
    ],
)
def VerPospuestasProduccionBobinaTubo(
    FiltroIdTipoBobina: int | None = None,
    FiltroIdProducto: int | None = None,
    service: ProduccionBobinaPapelService = Depends(produccion_bobina_papel_service),
):
    return service.VerPospuestas(
        VerPausasProduccionBobinaTuboActivasRequest(
            FiltroIdTipoBobina=FiltroIdTipoBobina,
            FiltroIdProducto=FiltroIdProducto,
        )
    )
