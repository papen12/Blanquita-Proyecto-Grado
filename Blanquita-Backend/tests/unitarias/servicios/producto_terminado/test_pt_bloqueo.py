import pytest
from fastapi import HTTPException, status

from app.Models.InventarioFinal.ProductoFinal import BloqueoProductoTerminadoRequest
from app.Services.InventarioFinal.ProductoFinal import estado_bloqueo
from tests.dobles.producto_terminado import FECHA_CONTEO, ID_LIDER, fila_bloqueo, fila_conteo

pytestmark = [pytest.mark.servicio, pytest.mark.producto_terminado]

MOTIVO = "Inventario de fin de mes"


def _bloqueo(motivo=MOTIVO, ingreso=True, correccion=False, salida=False):
    return BloqueoProductoTerminadoRequest(
        Motivo=motivo, BloqueaIngreso=ingreso, BloqueaCorreccion=correccion, BloqueaSalida=salida
    )


def test_estado_bloqueo_sin_fila_no_esta_bloqueado():
    estado = estado_bloqueo(None)

    assert estado.Bloqueado is False
    assert estado.MotivoBloqueo is None
    assert not (estado.BloqueaIngreso or estado.BloqueaCorreccion or estado.BloqueaSalida)


def test_estado_bloqueo_con_fila_copia_sus_datos():
    estado = estado_bloqueo(fila_bloqueo(ingreso=True, correccion=False, salida=True))

    assert estado.Bloqueado is True
    assert estado.UsuarioBloqueo == "Carlos Pérez"
    assert (estado.BloqueaIngreso, estado.BloqueaCorreccion, estado.BloqueaSalida) == (True, False, True)


def test_ver_bloqueo_sin_bloqueo_ni_conteo(servicio_pt):
    assert servicio_pt.VerBloqueo().Bloqueado is False


def test_ver_bloqueo_con_bloqueo_manual(servicio_pt, repo_pt):
    repo_pt.ObtenerBloqueoActivo.return_value = fila_bloqueo(salida=False)

    estado = servicio_pt.VerBloqueo()

    assert estado.Bloqueado is True
    assert estado.IdConteoProductoTerminado is None
    assert estado.BloqueaSalida is False


def test_ver_bloqueo_con_conteo_abierto_bloquea_todo_y_tiene_prioridad(servicio_pt, repo_pt, repo_conteo):
    repo_conteo.ObtenerConteoAbierto.return_value = fila_conteo(id_conteo=3)

    estado = servicio_pt.VerBloqueo()

    assert estado.Bloqueado is True
    assert estado.IdConteoProductoTerminado == 3
    assert estado.MotivoBloqueo == "Conteo físico N° 3: Conteo semanal"
    assert estado.FechaHoraBloqueo == FECHA_CONTEO
    assert (estado.BloqueaIngreso, estado.BloqueaCorreccion, estado.BloqueaSalida) == (True, True, True)
    repo_pt.ObtenerBloqueoActivo.assert_not_called()


@pytest.mark.parametrize("motivo", ["", "   ", "abcd", "motivo con % raro", "x" * 151])
def test_bloquear_con_motivo_invalido_lanza_422(servicio_pt, repo_pt, repo_conteo, motivo):
    with pytest.raises(HTTPException) as error:
        servicio_pt.BloquearMovimientos(_bloqueo(motivo), id_usuario=ID_LIDER)

    assert error.value.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert error.value.detail.startswith("El motivo es obligatorio")
    repo_conteo.ObtenerConteoAbierto.assert_not_called()
    repo_pt.RegistrarBloqueo.assert_not_called()


def test_bloquear_durante_un_conteo_lanza_409(servicio_pt, repo_pt, repo_conteo):
    repo_conteo.ObtenerConteoAbierto.return_value = fila_conteo()

    with pytest.raises(HTTPException) as error:
        servicio_pt.BloquearMovimientos(_bloqueo(), id_usuario=ID_LIDER)

    assert error.value.status_code == status.HTTP_409_CONFLICT
    assert error.value.detail.startswith("No se puede bloquear los movimientos de producto terminado: hay un conteo")
    repo_pt.RegistrarBloqueo.assert_not_called()


def test_bloquear_sin_elegir_movimientos_lanza_422(servicio_pt, repo_pt):
    with pytest.raises(HTTPException) as error:
        servicio_pt.BloquearMovimientos(_bloqueo(ingreso=False), id_usuario=ID_LIDER)

    assert error.value.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert error.value.detail == "Debe seleccionar al menos un movimiento para bloquear"
    repo_pt.RegistrarBloqueo.assert_not_called()


def test_bloquear_registra_el_motivo_limpio_y_devuelve_el_estado(servicio_pt, repo_pt):
    repo_pt.ObtenerBloqueoActivo.return_value = fila_bloqueo(ingreso=False, correccion=True, salida=True)

    estado = servicio_pt.BloquearMovimientos(
        _bloqueo(f"  {MOTIVO}  ", ingreso=False, correccion=True, salida=True), id_usuario=ID_LIDER
    )

    repo_pt.RegistrarBloqueo.assert_called_once_with(ID_LIDER, MOTIVO, False, True, True)
    assert estado.Bloqueado is True


def test_desbloquear_sin_bloqueo_activo_lanza_409(servicio_pt, repo_pt):
    repo_pt.CerrarBloqueoActivo.return_value = False

    with pytest.raises(HTTPException) as error:
        servicio_pt.DesbloquearMovimientos(id_usuario=ID_LIDER)

    assert error.value.status_code == status.HTTP_409_CONFLICT
    assert error.value.detail == "No hay un bloqueo activo de movimientos de producto terminado"


def test_desbloquear_cierra_el_bloqueo_con_el_usuario(servicio_pt, repo_pt):
    repo_pt.CerrarBloqueoActivo.return_value = True

    estado = servicio_pt.DesbloquearMovimientos(id_usuario=ID_LIDER)

    repo_pt.CerrarBloqueoActivo.assert_called_once_with(ID_LIDER)
    assert estado.Bloqueado is False
