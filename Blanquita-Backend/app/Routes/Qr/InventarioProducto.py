from fastapi import APIRouter, Depends, Response

from app.Auth.Dependencies import require_role
from app.Services.Qr.QrService import QrService
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR

qrRouter = APIRouter(
    prefix="/scan",
    tags=["Qr - Carteles de Escaneo"],
)

RUTA_INICIO = "/scan/inicio"
TITULO_INICIO = "Inventario de Producto Terminado"
SUBTITULO_INICIO = "Escanee para registrar ingresos y salidas"
ARCHIVO_INICIO = "QR-Inventario-Inicio.pdf"


@qrRouter.get(
    "/inicio",
    status_code=200,
    response_class=Response,
    responses={200: {"content": {"application/pdf": {}}}},
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR]))],
)
def ObtenerCartelInicio() -> Response:
    contenido = QrService.ObtenerCartel(
        RUTA_INICIO,
        TITULO_INICIO,
        SUBTITULO_INICIO,
    )
    return Response(
        content=contenido,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{ARCHIVO_INICIO}"',
            "Cache-Control": "private, max-age=86400",
        },
    )