from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db
from app.Services.Notificacion.Push import avisar_push
from app.Services.Notificacion.Avisos import (
    aviso_ajuste,
    aviso_bloqueo,
    aviso_desbloqueo,
    aviso_salida,
)

from app.Services.InventarioFinal.ProductoFinal import ProductoFinalService
from app.Models.InventarioFinal.ProductoFinal import(
      IngresoProductoTerminadoRequest,
      IngresoProductoTerminadoResponse,
      SalidaProductoTerminadoRequest,
      SalidaProductoTerminadoResponse,
      CorreccionProductoTerminadoRequest,
      CorreccionProductoTerminadoResponse,
      VerInventarioProductoTerminadoResponse,
      VerInventarioProductoTerminadoRequest,
      ProductoResponse,
      BloqueoProductoTerminadoRequest,
      EstadoBloqueoProductoTerminadoResponse
)

from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR, ROL_GERENTE_GENERAL


def producto_terminado_service(db: Session = Depends(get_db)) -> ProductoFinalService:
    return ProductoFinalService(db)


ProductoFinalRouter = APIRouter(
    prefix="/productofinal", tags=["Inventario - Producto Terminado"]
)


@ProductoFinalRouter.post(
    "/insertar",
    response_model=list[IngresoProductoTerminadoResponse],
    status_code=201
)
def InsertarIngresoProductoTerminado(
    data: IngresoProductoTerminadoRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: ProductoFinalService = Depends(producto_terminado_service)
):
    return service.InsertarIngresoProductoTerminado(data, usuario_actual["IdUsuario"])

@ProductoFinalRouter.post(
    "/salida",
    response_model=SalidaProductoTerminadoResponse,
    status_code=201
)
def InsertarSalidaInventario(
    data: SalidaProductoTerminadoRequest,
    tareas: BackgroundTasks,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: ProductoFinalService = Depends(producto_terminado_service)
):
    resultado = service.InsertarSalidaProductoTerminado(data, usuario_actual["IdUsuario"])
    avisar_push(tareas, aviso_salida(resultado.CantidadTotal, resultado.Observacion), usuario_actual["IdUsuario"])
    return resultado

@ProductoFinalRouter.post(
    "/ajuste/positivo",
    response_model=CorreccionProductoTerminadoResponse,
    status_code=201
)
def AjustePositivoInventarioProductoTerminado(
    data: CorreccionProductoTerminadoRequest,
    tareas: BackgroundTasks,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: ProductoFinalService = Depends(producto_terminado_service)
):
    resultado = service.AjustePositivoInventarioProductoTerminado(data, usuario_actual["IdUsuario"])
    avisar_push(tareas, aviso_ajuste("positivo", data.Cantidad, data.Observacion), usuario_actual["IdUsuario"])
    return resultado


@ProductoFinalRouter.post(
    "/ajuste/negativo",
    response_model=CorreccionProductoTerminadoResponse,
    status_code=201
)
def AjusteNegativoInventarioProductoTerminado(
    data: CorreccionProductoTerminadoRequest,
    tareas: BackgroundTasks,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: ProductoFinalService = Depends(producto_terminado_service)
):
    resultado = service.AjusteNegativoInventarioProductoTerminado(data, usuario_actual["IdUsuario"])
    avisar_push(tareas, aviso_ajuste("negativo", data.Cantidad, data.Observacion), usuario_actual["IdUsuario"])
    return resultado

@ProductoFinalRouter.post(
    "/correccion",
    response_model=CorreccionProductoTerminadoResponse,
    status_code=201
)
def CorregirInventarioProductoTerminado(
    data: CorreccionProductoTerminadoRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: ProductoFinalService = Depends(producto_terminado_service)
):
    return service.CorregirInventarioProductoTerminado(data, usuario_actual["IdUsuario"])

@ProductoFinalRouter.post(
    "/aumento",
    response_model=CorreccionProductoTerminadoResponse,
    status_code=201
)
def AumentarInventarioProductoTerminado(
    data: CorreccionProductoTerminadoRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: ProductoFinalService = Depends(producto_terminado_service)
):
    return service.AumentarInventarioProductoTerminado(data, usuario_actual["IdUsuario"])

@ProductoFinalRouter.get(
    "/inventario/ver",
    response_model=list[VerInventarioProductoTerminadoResponse],
    status_code=200
)
def VerInventarioProductoTerminado(
    IdProducto: int | None = None,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR, ROL_GERENTE_GENERAL])),
    service: ProductoFinalService = Depends(producto_terminado_service)
):
    return service.VerInventarioProductoTerminado(IdProducto)

@ProductoFinalRouter.get(
    "/obtenerproductos",
    response_model=list[ProductoResponse],
    status_code=200
)
def ObtenerProductos(
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR, ROL_GERENTE_GENERAL])),
    service: ProductoFinalService = Depends(producto_terminado_service)
):
    return service.ObtenerProductos()

@ProductoFinalRouter.get(
    "/bloqueo",
    response_model=EstadoBloqueoProductoTerminadoResponse,
    status_code=200
)
def VerBloqueoProductoTerminado(
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR, ROL_GERENTE_GENERAL])),
    service: ProductoFinalService = Depends(producto_terminado_service)
):
    return service.VerBloqueo()

@ProductoFinalRouter.post(
    "/bloqueo",
    response_model=EstadoBloqueoProductoTerminadoResponse,
    status_code=201
)
def BloquearMovimientosProductoTerminado(
    data: BloqueoProductoTerminadoRequest,
    tareas: BackgroundTasks,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: ProductoFinalService = Depends(producto_terminado_service)
):
    resultado = service.BloquearMovimientos(data, usuario_actual["IdUsuario"])
    avisar_push(tareas, aviso_bloqueo(data.Motivo), usuario_actual["IdUsuario"])
    return resultado

@ProductoFinalRouter.post(
    "/desbloqueo",
    response_model=EstadoBloqueoProductoTerminadoResponse,
    status_code=200
)
def DesbloquearMovimientosProductoTerminado(
    tareas: BackgroundTasks,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: ProductoFinalService = Depends(producto_terminado_service)
):
    resultado = service.DesbloquearMovimientos(usuario_actual["IdUsuario"])
    avisar_push(tareas, aviso_desbloqueo(), usuario_actual["IdUsuario"])
    return resultado