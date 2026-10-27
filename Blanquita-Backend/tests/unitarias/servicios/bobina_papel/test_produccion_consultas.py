import pytest

from app.Models.BobinaPapel.ProduccionBobinaPapel import (
    VerPausasProduccionBobinaTuboActivasRequest,
    VerProduccionBobinaTuboRequest,
)
from tests.dobles.fabricas import FECHA_BASE

pytestmark = [pytest.mark.servicio, pytest.mark.bobina_papel]

FILA_PRODUCCION = {
    "IdProduccionBobinaTubo": 10,
    "IdTipoBobina": 1,
    "NombreTipoBobina": "Higiénico",
    "IdProducto": 1,
    "NombreProducto": "Luxury",
    "NombreEstadoProduccion": "En Producción",
    "CodigoBobina1": "BP-0001",
    "CodigoBobina2": "BP-0002",
    "NombreTurno": "Mañana",
    "FechaInicioProduccion": FECHA_BASE,
    "CantidadLogsActual": 35,
}

FILA_PAUSA = {
    "IdPausaProduccionBobinaTubo": 50,
    "IdProduccionBobinaTubo": 10,
    "IdProducto": 1,
    "NombreProducto": "Luxury",
    "CodigoBobina1": "BP-0001",
    "CodigoBobina2": "BP-0002",
    "FechaHoraPausa": FECHA_BASE,
    "NombreEstadoProduccion": "Pausa",
    "CantidadLogsActual": 35,
}


def test_ver_producciones_traduce_los_filtros_a_parametros_del_repositorio(servicio, repo):
    repo.VerProduccionBobinaTubo.return_value = [FILA_PRODUCCION]

    respuesta = servicio.VerProduccionBobinaTubo(VerProduccionBobinaTuboRequest(IdTipoBobina=1, IdProducto=2))

    repo.VerProduccionBobinaTubo.assert_called_once_with({"p_IdTipoBobina": 1, "p_IdProducto": 2})
    assert len(respuesta) == 1
    assert respuesta[0].CodigoBobina1 == "BP-0001"
    assert respuesta[0].CantidadLogsActual == 35


def test_ver_producciones_sin_filtros_envia_none(servicio, repo):
    repo.VerProduccionBobinaTubo.return_value = []

    assert servicio.VerProduccionBobinaTubo(VerProduccionBobinaTuboRequest()) == []
    repo.VerProduccionBobinaTubo.assert_called_once_with({"p_IdTipoBobina": None, "p_IdProducto": None})


def test_ver_pausas_activas_traduce_los_filtros(servicio, repo):
    repo.VerPausasProduccionBobinaTuboActivas.return_value = [FILA_PAUSA]

    respuesta = servicio.VerPausasActivas(
        VerPausasProduccionBobinaTuboActivasRequest(FiltroIdTipoBobina=1, FiltroIdProducto=None)
    )

    repo.VerPausasProduccionBobinaTuboActivas.assert_called_once_with(
        {"p_FiltroIdTipoBobina": 1, "p_FiltroIdProducto": None}
    )
    assert respuesta[0].IdPausaProduccionBobinaTubo == 50


def test_las_consultas_no_escriben_ni_revierten(servicio, repo):
    repo.VerProduccionBobinaTubo.return_value = [FILA_PRODUCCION]
    repo.VerPausasProduccionBobinaTuboActivas.return_value = [FILA_PAUSA]

    servicio.VerProduccionBobinaTubo(VerProduccionBobinaTuboRequest())
    servicio.VerPausasActivas(VerPausasProduccionBobinaTuboActivasRequest())

    repo.Guardar.assert_not_called()
    repo.Agregar.assert_not_called()
    repo.Revertir.assert_not_called()
