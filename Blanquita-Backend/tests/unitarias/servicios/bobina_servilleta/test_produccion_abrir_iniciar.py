import pytest
import time_machine
from fastapi import HTTPException, status

from app.Constants.Estados import (
    ESTADO_MATERIA_PRIMA_ABIERTA,
    ESTADO_MATERIA_PRIMA_AGOTADO,
    ESTADO_MATERIA_PRIMA_EN_ALMACEN,
    ESTADO_MATERIA_PRIMA_EN_PRODUCCION,
    ESTADO_PRODUCCION_EN_PRODUCCION,
    MOVIMIENTO_MATERIA_PRIMA_INGRESO,
    MOVIMIENTO_MATERIA_PRIMA_TRASLADO,
)
from app.Models.BobinaServilleta.ProduccionBobinaServilleta import (
    AbrirBobinaServilletaRequest,
    IniciarProduccionServilletaRequest,
)
from app.Schemas.BobinaServilleta import MovimientoBobinaServilleta, MovimientoSubBobina, SubBobinaServilleta
from app.Schemas.Produccion import ProduccionServilleta
from tests.dobles.fabricas import (
    COMPOSICION_G18,
    FECHA_BASE,
    ID_MEDIDA_220,
    ID_MEDIDA_435,
    crear_bobina_servilleta,
    crear_sub_bobina,
)

pytestmark = [pytest.mark.servicio, pytest.mark.bobina_servilleta]


def _abrir(servicio, observacion=None, id_bobina=1):
    return servicio.AbrirBobinaServilleta(
        AbrirBobinaServilletaRequest(IdBobinaServilleta=id_bobina, Observacion=observacion), id_usuario=7
    )


def _iniciar(servicio, id_sub=30):
    return servicio.IniciarProduccionServilleta(IniciarProduccionServilletaRequest(IdSubBobina=id_sub), id_usuario=7)


def _guardados(repo, clase):
    return [r for r in repo.Guardar.call_args.args if isinstance(r, clase)]


class TestAbrir:
    def test_bobina_inexistente_revierte_y_lanza_404(self, servicio, repo):
        repo.ObtenerBobinaBloqueada.return_value = None

        with pytest.raises(HTTPException) as error:
            _abrir(servicio, id_bobina=99)

        assert error.value.status_code == status.HTTP_404_NOT_FOUND
        assert error.value.detail == "No existe la bobina servilleta con id 99"
        repo.Revertir.assert_called_once()

    @pytest.mark.parametrize("estado", [ESTADO_MATERIA_PRIMA_ABIERTA, ESTADO_MATERIA_PRIMA_AGOTADO])
    def test_bobina_que_no_esta_en_almacen_lanza_409(self, servicio, repo, estado):
        repo.ObtenerBobinaBloqueada.return_value = crear_bobina_servilleta(id_estado=estado)

        with pytest.raises(HTTPException) as error:
            _abrir(servicio)

        assert error.value.status_code == status.HTTP_409_CONFLICT
        assert "no está En almacén" in error.value.detail
        repo.SubBobinasPorUnidad.assert_not_called()

    def test_formato_sin_sub_bobinas_configuradas_lanza_409(self, servicio, repo):
        bobina = crear_bobina_servilleta()
        repo.ObtenerBobinaBloqueada.return_value = bobina
        repo.SubBobinasPorUnidad.return_value = []

        with pytest.raises(HTTPException) as error:
            _abrir(servicio)

        assert error.value.status_code == status.HTTP_409_CONFLICT
        assert error.value.detail == "Los formatos de la bobina servilleta no tienen sub-bobinas configuradas"
        assert bobina.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_EN_ALMACEN
        repo.Agregar.assert_not_called()

    def test_abrir_genera_las_sub_bobinas_de_cada_unidad_segun_su_formato(self, servicio, repo):
        repo.ObtenerBobinaBloqueada.return_value = crear_bobina_servilleta()
        repo.SubBobinasPorUnidad.return_value = COMPOSICION_G18

        respuesta = _abrir(servicio)

        sub_bobinas = repo.Agregar.call_args.args
        assert len(sub_bobinas) == 6
        assert all(isinstance(s, SubBobinaServilleta) for s in sub_bobinas)
        assert all(s.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_EN_ALMACEN for s in sub_bobinas)
        assert [(s.IdUnidadBobinaServilleta, s.IdTipoMedidaSubBobina) for s in sub_bobinas] == [
            (11, ID_MEDIDA_435), (11, ID_MEDIDA_435), (11, ID_MEDIDA_435),
            (12, ID_MEDIDA_435), (12, ID_MEDIDA_435),
            (12, ID_MEDIDA_220),
        ]
        assert respuesta.CantidadSubBobinasTotal == 6
        assert [(m.MedidaMm, m.Cantidad) for m in respuesta.SubBobinas] == [(435, 5), (220, 1)]

    def test_abrir_deja_la_madre_abierta_y_registra_los_movimientos(self, servicio, repo):
        bobina = crear_bobina_servilleta()
        repo.ObtenerBobinaBloqueada.return_value = bobina
        repo.SubBobinasPorUnidad.return_value = COMPOSICION_G18

        respuesta = _abrir(servicio)

        assert bobina.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_ABIERTA
        assert respuesta.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_ABIERTA
        madre = _guardados(repo, MovimientoBobinaServilleta)
        assert len(madre) == 1
        assert madre[0].IdTipoMovimiento == MOVIMIENTO_MATERIA_PRIMA_TRASLADO
        assert madre[0].Observacion == "Apertura de BobinaServilleta #1"

        movimientos = _guardados(repo, MovimientoSubBobina)
        ids_sub = [s.IdSubBobinaServilleta for s in repo.Agregar.call_args.args]
        assert [m.IdSubBobinaServilleta for m in movimientos] == ids_sub
        assert None not in ids_sub
        assert all(m.IdTipoMovimiento == MOVIMIENTO_MATERIA_PRIMA_INGRESO for m in movimientos)
        assert all(m.Observacion == "Generada por apertura de BobinaServilleta #1" for m in movimientos)

    def test_las_sub_bobinas_se_agregan_antes_de_guardar_los_movimientos(self, servicio, repo):
        repo.ObtenerBobinaBloqueada.return_value = crear_bobina_servilleta()
        repo.SubBobinasPorUnidad.return_value = COMPOSICION_G18

        _abrir(servicio)

        llamadas = [c[0] for c in repo.mock_calls if c[0] in ("Agregar", "Guardar")]
        assert llamadas == ["Agregar", "Guardar"]

    def test_la_observacion_del_usuario_reemplaza_a_la_automatica(self, servicio, repo):
        repo.ObtenerBobinaBloqueada.return_value = crear_bobina_servilleta()
        repo.SubBobinasPorUnidad.return_value = COMPOSICION_G18

        _abrir(servicio, observacion="Abierta para maquina 2")

        assert _guardados(repo, MovimientoBobinaServilleta)[0].Observacion == "Abierta para maquina 2"
        assert all(m.Observacion == "Abierta para maquina 2" for m in _guardados(repo, MovimientoSubBobina))


class TestIniciar:
    def test_sub_bobina_inexistente_revierte_y_lanza_404(self, servicio, repo):
        repo.ObtenerSubBobinaBloqueada.return_value = None

        with pytest.raises(HTTPException) as error:
            _iniciar(servicio, id_sub=77)

        assert error.value.status_code == status.HTTP_404_NOT_FOUND
        assert error.value.detail == "No existe la sub-bobina con id 77"
        repo.Revertir.assert_called_once()

    @pytest.mark.parametrize("estado", [ESTADO_MATERIA_PRIMA_EN_PRODUCCION, ESTADO_MATERIA_PRIMA_AGOTADO])
    def test_sub_bobina_que_no_esta_en_almacen_lanza_409(self, servicio, repo, estado):
        repo.ObtenerSubBobinaBloqueada.return_value = crear_sub_bobina(id_estado=estado)

        with pytest.raises(HTTPException) as error:
            _iniciar(servicio)

        assert error.value.status_code == status.HTTP_409_CONFLICT
        repo.Guardar.assert_not_called()

    def test_sin_turnos_lanza_409_y_no_mueve_la_sub_bobina(self, servicio, repo):
        sub = crear_sub_bobina()
        repo.ObtenerSubBobinaBloqueada.return_value = sub
        repo.TurnoActual.return_value = None

        with pytest.raises(HTTPException) as error:
            _iniciar(servicio)

        assert error.value.detail == "No hay turnos configurados"
        assert sub.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_EN_ALMACEN

    @time_machine.travel(FECHA_BASE, tick=False)
    def test_iniciar_pasa_la_sub_bobina_a_produccion(self, servicio, repo):
        sub = crear_sub_bobina()
        repo.ObtenerSubBobinaBloqueada.return_value = sub

        respuesta = _iniciar(servicio)

        produccion = _guardados(repo, ProduccionServilleta)[0]
        assert produccion.IdEstadoProduccion == ESTADO_PRODUCCION_EN_PRODUCCION
        assert produccion.IdSubBobina == 30
        assert produccion.IdUsuario == 7
        assert produccion.FechaInicioProduccion == FECHA_BASE
        assert sub.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_EN_PRODUCCION
        movimiento = _guardados(repo, MovimientoSubBobina)[0]
        assert movimiento.IdTipoMovimiento == MOVIMIENTO_MATERIA_PRIMA_TRASLADO
        assert respuesta.IdProduccionServilleta == produccion.IdProduccionServilleta
        assert respuesta.NombreTurno == "Mañana"
