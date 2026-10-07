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
PATRON_TIPO_CONTENEDOR = r"^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$"
PATRON_CODIGO_PRESENTACION = r"^[A-Z0-9-]+$"


def _limpiar(texto: str) -> str:
    return " ".join(texto.split())


class CatalogoService:
    def __init__(self, db: Session):
        self.repository = CatalogoRepository(db)

    def _NombreLineaValido(self, nombre: str) -> str:
        nombre = _limpiar(nombre)

        if not re.fullmatch(PATRON_NOMBRE_LINEA, nombre):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="El nombre de la línea solo puede tener letras, números, espacios y guiones",
            )

        if self.repository.NombreLineaEnUso(nombre):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe una línea llamada {nombre}",
            )

        return nombre

    def _TipoContenedorValido(self, tipo: str) -> str:
        tipo = _limpiar(tipo)

        if not re.fullmatch(PATRON_TIPO_CONTENEDOR, tipo):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="El tipo de contenedor solo puede tener letras y espacios",
            )

        return tipo.capitalize()

    def _CodigoValido(self, codigo: str) -> str:
        codigo = codigo.strip().upper()

        if not re.fullmatch(PATRON_CODIGO_PRESENTACION, codigo):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="El código solo puede tener letras sin tilde, números y guiones",
            )

        if self.repository.CodigoEnUso(codigo):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"El código {codigo} ya está registrado",
            )

        return codigo

    def ListarLineas(self) -> list[LineaItem]:
        return [LineaItem(**fila) for fila in self.repository.ListarLineas()]

    def ListarPresentaciones(self) -> list[PresentacionItem]:
        return [PresentacionItem(**fila) for fila in self.repository.ListarPresentaciones()]

    def CrearLinea(self, datos: CrearLineaRequest, id_admin: int) -> LineaResponse:
        nombre = self._NombreLineaValido(datos.NombreProducto)

        creada = self.repository.CrearLinea(
            Producto(NombreProducto=nombre),
            lambda l: f"Crear línea de producción · #{l.IdProducto} {l.NombreProducto}",
            id_admin,
        )
        return LineaResponse(IdProducto=creada.IdProducto, NombreProducto=creada.NombreProducto)

    def CrearPresentacion(
        self, datos: CrearPresentacionRequest, id_admin: int
    ) -> PresentacionResponse:
        tipo_contenedor = self._TipoContenedorValido(datos.TipoContenedor)
        codigo = self._CodigoValido(datos.CodigoPresentacion)

        linea_creada = datos.IdProducto is None
        if linea_creada:
            linea = Producto(NombreProducto=self._NombreLineaValido(datos.NombreLineaNueva))
        else:
            linea = self.repository.ObtenerLinea(datos.IdProducto)
            if linea is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="La línea de producción no existe",
                )

        presentacion = PresentacionProducto(
            TipoContenedor=tipo_contenedor,
            CantidadRollosUnidades=datos.CantidadRollosUnidades,
            CantidadPorUnidadTerminada=datos.CantidadPorUnidadTerminada,
            CodigoPresentacion=codigo,
        )

        def observacion(l: Producto, p: PresentacionProducto) -> str:
            texto = (
                f"Crear producto · #{p.IdPresentacion} {p.CodigoPresentacion} "
                f"({p.TipoContenedor}, {p.CantidadRollosUnidades} rollos/unidades, "
                f"{p.CantidadPorUnidadTerminada} por unidad terminada) "
                f"en línea #{l.IdProducto} {l.NombreProducto}"
            )
            return texto + " (línea nueva)" if linea_creada else texto

        creada = self.repository.CrearPresentacion(linea, presentacion, observacion, id_admin)

        return PresentacionResponse(
            IdPresentacion=creada.IdPresentacion,
            IdProducto=creada.IdProducto,
            TipoContenedor=creada.TipoContenedor,
            CantidadRollosUnidades=creada.CantidadRollosUnidades,
            CantidadPorUnidadTerminada=creada.CantidadPorUnidadTerminada,
            CodigoPresentacion=creada.CodigoPresentacion,
            NombreProducto=linea.NombreProducto,
            LineaCreada=linea_creada,
        )
