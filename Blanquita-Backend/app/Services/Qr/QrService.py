from functools import lru_cache

from app.Models.Qr.QrBasico import QrCartel, QrParametros


class QrService:
    @staticmethod
    @lru_cache(maxsize=32)
    def _generar(ruta: str, titulo: str, subtitulo: str) -> bytes:
        parametros = QrParametros(ruta=ruta, titulo=titulo, subtitulo=subtitulo)
        return QrCartel(parametros).aPdf()

    @classmethod
    def ObtenerCartel(cls, ruta: str, titulo: str, subtitulo: str) -> bytes:
        return cls._generar(ruta, titulo, subtitulo)