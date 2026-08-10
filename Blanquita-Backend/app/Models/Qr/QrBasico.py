import io

import segno
from pydantic import BaseModel, Field
from reportlab.lib.colors import black, white
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas


class QrParametros(BaseModel):
    ruta: str = Field(min_length=1)
    titulo: str = Field(min_length=1)
    subtitulo: str = Field(min_length=1)


class QrCartel:
    LADO_QR = 8 * cm
    BORDE = 4
    MARGEN_TITULO = 2.2 * cm
    MARGEN_SUBTITULO = 1.6 * cm
    TAMANIO_TITULO = 30
    TAMANIO_SUBTITULO = 15
    FUENTE_TITULO = "Helvetica-Bold"
    FUENTE_SUBTITULO = "Helvetica"

    def __init__(self, parametros: QrParametros):
        self.parametros = parametros
        self.codigo = segno.make_qr(parametros.ruta, error="Q")

    def _DibujarQr(self, lienzo: canvas.Canvas, x: float, y: float) -> None:
        modulos = self.codigo.symbol_size(border=self.BORDE)[0]
        lado = self.LADO_QR / modulos

        lienzo.setFillColor(white)
        lienzo.rect(x, y, self.LADO_QR, self.LADO_QR, stroke=0, fill=1)

        lienzo.setFillColor(black)
        origenX = x + self.BORDE * lado
        topeY = y + self.LADO_QR - self.BORDE * lado

        for indiceFila, fila in enumerate(self.codigo.matrix):
            filaY = topeY - (indiceFila + 1) * lado
            inicio = None
            for indiceColumna, valor in enumerate(fila):
                if valor and inicio is None:
                    inicio = indiceColumna
                elif not valor and inicio is not None:
                    lienzo.rect(
                        origenX + inicio * lado,
                        filaY,
                        (indiceColumna - inicio) * lado,
                        lado,
                        stroke=0,
                        fill=1,
                    )
                    inicio = None
            if inicio is not None:
                lienzo.rect(
                    origenX + inicio * lado,
                    filaY,
                    (len(fila) - inicio) * lado,
                    lado,
                    stroke=0,
                    fill=1,
                )

    def aPdf(self) -> bytes:
        buffer = io.BytesIO()
        anchoHoja, altoHoja = letter

        lienzo = canvas.Canvas(buffer, pagesize=letter)
        lienzo.setTitle(self.parametros.titulo)
        lienzo.setSubject(self.parametros.subtitulo)
        lienzo.setAuthor("Papel Blanquita")

        centroX = anchoHoja / 2
        centroY = altoHoja / 2

        self._DibujarQr(
            lienzo,
            centroX - self.LADO_QR / 2,
            centroY - self.LADO_QR / 2,
        )

        lienzo.setFillColor(black)

        lienzo.setFont(self.FUENTE_TITULO, self.TAMANIO_TITULO)
        lienzo.drawCentredString(
            centroX,
            centroY + self.LADO_QR / 2 + self.MARGEN_TITULO,
            self.parametros.titulo.upper(),
        )

        lienzo.setFont(self.FUENTE_SUBTITULO, self.TAMANIO_SUBTITULO)
        lienzo.drawCentredString(
            centroX,
            centroY - self.LADO_QR / 2 - self.MARGEN_SUBTITULO,
            self.parametros.subtitulo,
        )

        lienzo.showPage()
        lienzo.save()
        return buffer.getvalue()