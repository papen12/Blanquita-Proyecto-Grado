from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.Constants.Cantidades import (
    CANTIDAD_MOVIMIENTO_INSUMO,
    LONGITUD_MAXIMA_DESCRIPCION,
    LONGITUD_MINIMA_DESCRIPCION,
)
from app.Models.Insumo.Insumo import (
    CatalogoInsumoResponse,
    MovimientoInsumoRequest,
    MovimientoInsumoResponse,
)
from app.Repository.Insumo.Insumo import InsumoRepository
from app.Schemas.Insumo import MovimientoInsumo
from app.utils.validators import EsCantidadValida, REGLA_CARACTERES_OBSERVACION, ValidarTexto

ID_TIPO_MOVIMIENTO_INGRESO = 1
ID_TIPO_MOVIMIENTO_SALIDA = 2

NOMBRE_MOVIMIENTO = {
    ID_TIPO_MOVIMIENTO_INGRESO: "Ingreso",
    ID_TIPO_MOVIMIENTO_SALIDA: "Salida",
}


class InsumoService:
    def __init__(self, db: Session):
        self.repository = InsumoRepository(db)

    def VerCatalogoInsumo(self) -> list[CatalogoInsumoResponse]:
        return [CatalogoInsumoResponse(**fila) for fila in self.repository.VerCatalogoInsumo()]

    def IngresarInsumo(self, data: MovimientoInsumoRequest, id_usuario: int) -> MovimientoInsumoResponse:
        return self._RegistrarMovimiento(data, id_usuario, ID_TIPO_MOVIMIENTO_INGRESO)

    def SacarInsumo(self, data: MovimientoInsumoRequest, id_usuario: int) -> MovimientoInsumoResponse:
        return self._RegistrarMovimiento(data, id_usuario, ID_TIPO_MOVIMIENTO_SALIDA)

    def _RegistrarMovimiento(
        self, data: MovimientoInsumoRequest, id_usuario: int, id_tipo_movimiento: int
    ) -> MovimientoInsumoResponse:
        if data.Cantidad <= 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="La cantidad debe ser mayor a 0",
            )

        if not EsCantidadValida(data.Cantidad, CANTIDAD_MOVIMIENTO_INSUMO):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"La cantidad máxima por movimiento es de {CANTIDAD_MOVIMIENTO_INSUMO}",
            )

        observacion = (data.Observacion or "").strip()
        if not ValidarTexto(LONGITUD_MINIMA_DESCRIPCION, LONGITUD_MAXIMA_DESCRIPCION, observacion):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"La observación es obligatoria, debe tener entre {LONGITUD_MINIMA_DESCRIPCION} y {LONGITUD_MAXIMA_DESCRIPCION} caracteres, {REGLA_CARACTERES_OBSERVACION}",
            )

        encontrado = self.repository.ObtenerInventarioBloqueado(data.IdTipoInsumo)
        if encontrado is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"El insumo con id {data.IdTipoInsumo} no existe o no tiene inventario",
            )

        inventario, tipo = encontrado
        cantidad_actual = int(inventario.CantidadActual)

        if id_tipo_movimiento == ID_TIPO_MOVIMIENTO_SALIDA:
            if data.Cantidad > cantidad_actual:
                self.repository.Revertir()
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"No hay suficiente {tipo.NombreInsumo} en almacén, disponible: {cantidad_actual}",
                )
            cantidad_nueva = cantidad_actual - data.Cantidad
        else:
            cantidad_nueva = cantidad_actual + data.Cantidad

        movimiento = self.repository.RegistrarMovimiento(
            inventario,
            MovimientoInsumo(
                IdTipoInsumo=data.IdTipoInsumo,
                IdTipoMovimiento=id_tipo_movimiento,
                IdUsuario=id_usuario,
                CantidadMovimiento=data.Cantidad,
                Observacion=observacion,
            ),
            cantidad_nueva,
        )

        return MovimientoInsumoResponse(
            IdMovimientoInsumo=movimiento.IdMovimientoInsumo,
            IdTipoInsumo=movimiento.IdTipoInsumo,
            NombreInsumo=tipo.NombreInsumo,
            NombreMovimiento=NOMBRE_MOVIMIENTO[id_tipo_movimiento],
            CantidadMovimiento=data.Cantidad,
            CantidadActual=cantidad_nueva,
            FechaMovimiento=movimiento.FechaMovimiento,
        )
