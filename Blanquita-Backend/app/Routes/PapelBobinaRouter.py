from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db
from app.Services.BobinaPapel.LoteBobinaPapelService import LoteBobinaService
from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION
from app.Models.BobinaPapel.IngresoBobina import ListaBobinasPapel,BobinaPapelIngresoItem,IngresoModelo,IngresoLoteBobinaPapelResponse


PapelBobinaRouter = APIRouter(prefix="/papelbobina", tags=["Operaciones sobre Papel Bobina"])


def bobina_papel_service(db: Session = Depends(get_db)) -> LoteBobinaService:
    return LoteBobinaService(db)


@PapelBobinaRouter.post(
    "/cargarlotebobinapapel",
    response_model=IngresoLoteBobinaPapelResponse,
    status_code=201,
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION]))]
)
def CargarLoteBobinaPapel(
    data: IngresoModelo,
    service: LoteBobinaService = Depends(bobina_papel_service)
):
    return service.insertar_bobinas_papel(data)