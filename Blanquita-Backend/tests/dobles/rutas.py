import re
from dataclasses import dataclass

from fastapi.routing import APIRoute

from app.Auth.Dependencies import get_current_user, require_admin_db

VALORES_PARAMETRO = {"clase": "bobina", "periodo": "semana"}


@dataclass(frozen=True)
class RutaApi:
    metodo: str
    ruta: str
    roles: frozenset[int]
    autenticada: bool
    solo_admin: bool

    @property
    def clave(self) -> str:
        return f"{self.metodo} {self.ruta}"

    @property
    def es_lectura(self) -> bool:
        return self.metodo == "GET"

    def url(self) -> str:
        return re.sub(r"\{(\w+)\}", lambda m: VALORES_PARAMETRO.get(m.group(1), "1"), self.ruta)

    def __str__(self) -> str:
        return self.clave


def _rutas(lista):
    for ruta in lista:
        if hasattr(ruta, "original_router"):
            yield from _rutas(ruta.original_router.routes)
        elif isinstance(ruta, APIRoute):
            yield ruta


def _dependencias(dependant):
    yield dependant.call
    for sub in dependant.dependencies:
        yield from _dependencias(sub)


def rutas_api(app) -> list[RutaApi]:
    resultado = []
    for ruta in _rutas(app.routes):
        llamadas = list(_dependencias(ruta.dependant))
        roles = set()
        for llamada in llamadas:
            if getattr(llamada, "__name__", "") == "verificar_rol":
                roles |= set(llamada.__closure__[0].cell_contents)
        for metodo in sorted(ruta.methods):
            resultado.append(
                RutaApi(
                    metodo=metodo,
                    ruta=ruta.path,
                    roles=frozenset(roles),
                    autenticada=get_current_user in llamadas,
                    solo_admin=require_admin_db in llamadas,
                )
            )
    return sorted(resultado, key=lambda r: r.clave)
