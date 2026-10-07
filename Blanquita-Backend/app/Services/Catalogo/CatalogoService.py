import re

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.Models.Catalogo.Catalogo import (
    CrearLineaRequest,
    CrearPresentacionRequest,
    LineaItem,
    LineaResponse,
    PresentacionItem,
    PresentacionResponse,
)
from app.Repository.Catalogo.CatalogoRepository import CatalogoRepository
from app.Schemas.Producto import PresentacionProducto, Producto

PATRON_NOMBRE_LINEA = r"^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 -]+$"


def _limpiar(texto: str) -> str:
    return " ".join(texto.split())


class CatalogoService:
    def __init__(self, db: Session):
        self.repository = CatalogoRepository(db)

    def ListarLineas(self) -> list[LineaItem]:
        return [LineaItem(**fila) for fila in self.repository.ListarLineas()]

    def ListarPresentaciones(self) -> list[PresentacionItem]:
        return [PresentacionItem(**fila) for fila in self.repository.ListarPresentaciones()]

    def CrearLinea(self, datos: CrearLineaRequest, id_admin: int) -> LineaResponse:
        nombre = _limpiar(datos.NombreProducto)

        if not re.fullmatch(PATRON_NOMBRE_LINEA, nombre):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="El nombre de la línea solo puede tener letras, números, espacios y guiones",
            )

        siglas = datos.SiglasProducto.upper()

        if self.repository.NombreLineaEnUso(nombre):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe una línea llamada {nombre}",
            )

        linea_con_siglas = self.repository.LineaConSiglas(siglas)
        if linea_con_siglas:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Las siglas {siglas} ya las usa la línea {linea_con_siglas}",
            )

        creada = self.repository.CrearLinea(
            Producto(NombreProducto=nombre, SiglasProducto=siglas),
            lambda l: f"Crear línea de producción · #{l.IdProducto} {l.NombreProducto} ({l.SiglasProducto})",
            id_admin,
        )
        return LineaResponse(
            IdProducto=creada.IdProducto,
            NombreProducto=creada.NombreProducto,
            SiglasProducto=creada.SiglasProducto,
        )

    def CrearPresentacion(
        self, datos: CrearPresentacionRequest, id_admin: int
    ) -> PresentacionResponse:
        linea = self.repository.ObtenerLinea(datos.IdProducto)
        if linea is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="La línea de producción no existe",
            )

        codigo = f"{linea.SiglasProducto}-{datos.TipoContenedor[0]}{datos.CantidadRollosUnidades:02d}"

        if self.repository.CodigoEnUso(codigo):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"El producto {codigo} ya existe",
            )

        presentacion = PresentacionProducto(
            IdProducto=linea.IdProducto,
            TipoContenedor=datos.TipoContenedor,
            CantidadRollosUnidades=datos.CantidadRollosUnidades,
            CantidadPorUnidadTerminada=datos.CantidadPorUnidadTerminada,
            CodigoPresentacion=codigo,
        )
        observacion = (
            f"{codigo} ({datos.TipoContenedor}, {datos.CantidadRollosUnidades} "
            f"{datos.TipoCantidad.lower()}, {datos.CantidadPorUnidadTerminada} por unidad terminada) "
            f"en línea #{linea.IdProducto} {linea.NombreProducto}"
        )

        creada = self.repository.CrearPresentacion(presentacion, observacion, id_admin)

        return PresentacionResponse(
            IdPresentacion=creada.IdPresentacion,
            IdProducto=creada.IdProducto,
            TipoContenedor=creada.TipoContenedor,
            CantidadRollosUnidades=creada.CantidadRollosUnidades,
            CantidadPorUnidadTerminada=creada.CantidadPorUnidadTerminada,
            CodigoPresentacion=creada.CodigoPresentacion,
            NombreProducto=linea.NombreProducto,
        )
