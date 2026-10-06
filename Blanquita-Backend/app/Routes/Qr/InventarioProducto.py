from fastapi import APIRouter, Depends, Response

from app.Auth.Dependencies import require_role, get_generado_por
from app.Services.Qr.QrService import QrService
from app.Services.Qr.BobinaPapel import CartelesBobinaPapel
from app.Services.Qr.BobinaServilleta import CartelesBobinaServilleta
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION
qrRouter = APIRouter(
    prefix="/qr",
    tags=["Qr - Carteles de Escaneo"],
)


@qrRouter.get(
    "/producto/inventario",
    status_code=200,
    response_class=Response,
    responses={200: {"content": {"application/pdf": {}}}},
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION]))],
)
def QrPtInventario(generado_por: str | None = Depends(get_generado_por)) -> Response:
    contenido = QrService.ObtenerCartel(
        "/producto/movimientos",
        "Inventario de Producto Terminado",
        "Escanee para registrar los movimientos de producto terminado",
        generado_por,
    )
    return Response(
        content=contenido,
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="QR-ProductoTerminado-Inventario.pdf"',
            "Cache-Control": "no-store",
        },
    )
#Rutas bobina-papel
@qrRouter.get(
    "/bobina-papel/inventario",
    status_code=200,
    response_class=Response,
    responses={200: {"content": {"application/pdf": {}}}},
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION]))],
)
def QrBpInventario(generado_por: str | None = Depends(get_generado_por)) -> Response:
    contenido = CartelesBobinaPapel.Inventario(generado_por)
    return Response(
        content=contenido,
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="QR-BobinaPapel-Inventario.pdf"',
            "Cache-Control": "no-store",
        },
    )

@qrRouter.get(
    "/bobina-papel/produccion",
    status_code=200,
    response_class=Response,
    responses={200: {"content": {"application/pdf": {}}}},
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION]))],
)
def QrBpProduccion(generado_por: str | None = Depends(get_generado_por)) -> Response:
    contenido = CartelesBobinaPapel.Produccion(generado_por)
    return Response(
        content=contenido,
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="QR-BobinaPapel-Produccion.pdf"',
            "Cache-Control": "no-store",
        },
    )
#Rutas bobina-servilleta
@qrRouter.get(
    "/bobina-servilleta/inventario",
    status_code=200,
    response_class=Response,
    responses={200: {"content": {"application/pdf": {}}}},
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION]))],
)
def QrBsInventario(generado_por: str | None = Depends(get_generado_por)) -> Response:
    contenido = CartelesBobinaServilleta.Inventario(generado_por)
    return Response(
        content=contenido,
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="QR-BobinaServilleta-Inventario.pdf"',
            "Cache-Control": "no-store",
        },
    )

@qrRouter.get(
    "/bobina-servilleta/produccion",
    status_code=200,
    response_class=Response,
    responses={200: {"content": {"application/pdf": {}}}},
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION]))],
)
def QrBsProduccion(generado_por: str | None = Depends(get_generado_por)) -> Response:
    contenido = CartelesBobinaServilleta.Produccion(generado_por)
    return Response(
        content=contenido,
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="QR-BobinaServilleta-Produccion.pdf"',
            "Cache-Control": "no-store",
        },
    )
