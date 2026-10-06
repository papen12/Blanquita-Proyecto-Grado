from functools import lru_cache

from app.Models.Qr.QrBasico import QrCartel, QrParametros


class QrService:
    @staticmethod
    @lru_cache(maxsize=32)
    def _generar(ruta: str, titulo: str, subtitulo: str, generado_por: str | None) -> bytes:
        parametros = QrParametros(
            ruta=ruta, titulo=titulo, subtitulo=subtitulo, generado_por=generado_por
        )
        return QrCartel(parametros).aPdf()

    @classmethod
    def ObtenerCartel(
        cls, ruta: str, titulo: str, subtitulo: str, generado_por: str | None = None
    ) -> bytes:
        return cls._generar(ruta, titulo, subtitulo, generado_por)