from functools import lru_cache

from app.Models.Qr.QrBasico import QrCartel, QrParametros

class CartelesBobinaServilleta:
    @staticmethod
    @lru_cache(maxsize=32)
    def Inventario(generado_por: str | None) -> bytes:
        parametros = QrParametros(
            ruta="/bobina-servilleta/inventario",
            titulo="Inventario de Bobinas de Servilleta",
            subtitulo="Escanee para ver el inventario de bobinas de servilleta",
            generado_por=generado_por,
        )
        return QrCartel(parametros).aPdf()

    @staticmethod
    @lru_cache(maxsize=32)
    def Produccion(generado_por: str | None) -> bytes:
        parametros = QrParametros(
            ruta="/bobina-servilleta/produccion",
            titulo="Producción de Bobinas de Servilleta",
            subtitulo="Escanee para registrar la producción de bobinas de servilleta",
            generado_por=generado_por,
        )
        return QrCartel(parametros).aPdf()
