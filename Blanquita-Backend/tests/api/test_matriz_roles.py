import re
from datetime import datetime, timezone

import pytest
from fastapi import status

from app.Auth import Dependencies
from app.Constants.Roles import ROL_GERENTE_GENERAL as G
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION as L
from app.Constants.Roles import ROL_OPERADOR as O
from app.Models.BobinaPapel.ProduccionBobinaPapel import CambiarLineaProduccionBobinaTuboResponse
from app.Routes.BobinaPapel.ProduccionRouter import produccion_bobina_papel_service
from app.main import app
from tests.api.conftest import RUTAS

pytestmark = [pytest.mark.api, pytest.mark.usuario]

PUBLICAS = {"GET /", "POST /auth/login", "POST /auth/logout", "POST /auth/refresh"}
SOLO_AUTENTICADAS = {"GET /Usuario/ver", "POST /auth/logout-todos"}

PATRON_ADMIN = re.compile(
    r"^/("
    r"Usuario/(?!ver$)"
    r"|alertastock/umbral"
    r"|bobinapapel/tipo/"
    r"|bobinaservilleta/(formato|tipo)/"
    r"|empaque/tipo/"
    r"|historialadmin/"
    r"|insumo/(crear|detalle|editar|estado|listar)"
    r"|producto/"
    r"|proveedor/(crear|editar|estado|listar)"
    r"|registroingreso/"
    r"|rodela/tipo/"
    r")"
)

MATRIZ_DOCUMENTADA = {
    "POST /bobinapapel/cargarlote": {L},
    "PATCH /bobinapapel/editar": {L},
    "POST /papelbobina/inventario/reingresar": {L},
    "GET /papelbobina/inventario/fuera": {L, G},
    "POST /papelbobina/produccion/iniciar": {O, L},
    "POST /papelbobina/produccion/pausar": {O, L},
    "POST /papelbobina/produccion/insertarlog": {O, L},
    "POST /papelbobina/produccion/cambiarlinea": {L},
    "POST /papelbobina/produccion/finalizar": {L},
    "POST /papelbobina/produccion/cancelar": {L},
    "GET /papelbobina/produccion/activas": {O, L, G},
    "GET /papelbobina/produccion/pausadas": {O, L, G},
    "POST /bobinaservilleta/produccion/abrir": {O, L},
    "POST /bobinaservilleta/produccion/iniciar": {O, L},
    "POST /bobinaservilleta/produccion/finalizar": {L},
    "POST /bobinaservilleta/produccion/cancelar": {L},
    "POST /rodela/inventario/trasladar": {O, L},
    "POST /rodela/inventario/deshacer": {O, L},
    "POST /rodela/inventario/editar": {L},
    "POST /empaquebobina/trasladarproduccion": {O, L},
    "POST /empaquebolsa/cargarlote": {L},
    "POST /bolsajava/cargarlote": {L},
    "POST /empaquebolsa/salida": {O, L},
    "POST /bolsajava/salida": {O, L},
    "POST /insumo/salida": {O, L},
    "POST /productofinal/insertar": {O, L},
    "POST /productofinal/correccion": {O, L},
    "POST /productofinal/salida": {L},
    "POST /productofinal/ajuste/positivo": {L},
    "POST /productofinal/ajuste/negativo": {L},
    "GET /productofinal/bloqueo": {O, L, G},
    "POST /productofinal/bloqueo": {L},
    "POST /productofinal/desbloqueo": {L},
    "GET /productofinal/conteo/activo": {O, L, G},
    "POST /productofinal/conteo/iniciar": {L},
    "PUT /productofinal/conteo/{id_conteo}/cantidades": {L},
    "POST /productofinal/conteo/{id_conteo}/cerrar": {L},
    "POST /productofinal/conteo/{id_conteo}/anular": {L},
    "GET /productofinal/conteo/{id_conteo}/acta": {L, G},
    "GET /productofinal/inventario/ver": {O, L, G},
    "GET /notificaciones/resumen": {O, L, G},
    "GET /alertastock/resumen": {O, L, G},
    "GET /proveedor/formulario": {O, L, G},
    "GET /gerente/inicio/{periodo}/resumen": {G},
}

DIFERENCIAS_CON_PG10 = {
    "POST /bobinaservilleta/cargarlote": {O, L},
    "POST /rodela/cargarlote": {O, L},
    "POST /empaquebobina/cargarlote": {O, L},
    "POST /insumo/ingreso": {O, L},
    "POST /papelbobina/produccion/reanudar": {O, L},
    "POST /bobinaservilleta/produccion/reanudar": {O, L},
    "GET /bobinaservilleta/reporte/produccion/periodo": {O, L, G},
}

POR_CLAVE = {r.clave: r for r in RUTAS}
PROTEGIDAS = [r for r in RUTAS if r.clave not in PUBLICAS]
CON_ROLES = [r for r in RUTAS if r.roles]
ADMIN = [r for r in RUTAS if r.solo_admin]
NOMBRES_ROL = {O: "operador", L: "lider", G: "gerente"}

DENEGADAS = [
    pytest.param(ruta, rol, id=f"{NOMBRES_ROL[rol]}-{ruta}")
    for ruta in CON_ROLES
    for rol in (O, L, G)
    if rol not in ruta.roles
]


def test_la_api_expone_todas_las_rutas_esperadas():
    assert len(RUTAS) > 200
    assert set(MATRIZ_DOCUMENTADA) <= set(POR_CLAVE)
    assert set(DIFERENCIAS_CON_PG10) <= set(POR_CLAVE)


def test_solo_las_rutas_publicas_no_piden_token():
    sin_token = {r.clave for r in RUTAS if not r.autenticada}

    assert sin_token == PUBLICAS


def test_toda_ruta_protegida_restringe_por_rol_o_por_admin():
    sin_restriccion = {r.clave for r in PROTEGIDAS if not r.roles and not r.solo_admin}

    assert sin_restriccion == SOLO_AUTENTICADAS


def test_ninguna_ruta_combina_roles_y_admin():
    assert [r.clave for r in RUTAS if r.roles and r.solo_admin] == []


def test_las_rutas_del_panel_admin_exigen_admin_en_bd():
    por_patron = {r.clave for r in RUTAS if PATRON_ADMIN.match(r.ruta)}
    con_admin = {r.clave for r in ADMIN}

    assert por_patron == con_admin


def test_el_gerente_no_tiene_ninguna_escritura_por_rol():
    escrituras = [r.clave for r in CON_ROLES if not r.es_lectura and G in r.roles]

    assert escrituras == []


def test_carteles_qr_solo_para_lider_y_gerente():
    qr = [r for r in RUTAS if r.ruta.startswith("/qr/")]

    assert qr
    assert all(r.roles == {L, G} and r.es_lectura for r in qr)


def test_paneles_de_inicio_por_area_son_solo_del_lider():
    inicio = [r for r in RUTAS if "/inicio/" in r.ruta and not r.ruta.startswith("/gerente/")]

    assert inicio
    assert {r.clave: set(r.roles) for r in inicio} == {r.clave: {L} for r in inicio}


def test_el_operador_no_ve_reportes_salvo_los_de_servilleta():
    reportes = [r for r in RUTAS if "/reporte" in r.ruta and O in r.roles]

    assert all(r.ruta.startswith("/bobinaservilleta/reporte/") for r in reportes)


@pytest.mark.parametrize(("clave", "roles"), sorted(MATRIZ_DOCUMENTADA.items()), ids=lambda v: v if isinstance(v, str) else "")
def test_roles_documentados(clave, roles):
    assert set(POR_CLAVE[clave].roles) == roles


@pytest.mark.parametrize(("clave", "roles"), sorted(DIFERENCIAS_CON_PG10.items()), ids=lambda v: v if isinstance(v, str) else "")
def test_roles_que_difieren_de_pg10_siguen_como_estan(clave, roles):
    assert set(POR_CLAVE[clave].roles) == roles


@pytest.mark.parametrize(("ruta", "rol"), DENEGADAS)
def test_rol_no_permitido_recibe_403_en_cada_endpoint(cliente, como, ruta, rol):
    como(rol)

    respuesta = cliente.request(ruta.metodo, ruta.url(), json={})

    assert respuesta.status_code == status.HTTP_403_FORBIDDEN
    assert respuesta.json()["detail"] == "No tienes permisos para realizar esta acción"


@pytest.fixture
def sin_admin_en_bd(mocker):
    repositorio = mocker.patch.object(Dependencies, "UsuarioRepository", autospec=True)
    repositorio.return_value.VerificarAdmin.return_value = {"EsAdminOut": False, "IdEstadoUsuarioOut": 1}
    return repositorio


@pytest.mark.parametrize("ruta", ADMIN, ids=str)
@pytest.mark.parametrize("rol", [L, G], ids=["lider", "gerente"])
def test_admin_revocado_en_bd_recibe_403_aunque_el_token_diga_admin(cliente, como, sin_admin_en_bd, ruta, rol):
    como(rol, es_admin=True)

    respuesta = cliente.request(ruta.metodo, ruta.url(), json={})

    assert respuesta.status_code == status.HTTP_403_FORBIDDEN
    assert respuesta.json()["detail"] == "Requiere permisos de administrador"


@pytest.fixture
def servicio_produccion(mocker):
    servicio = mocker.Mock()
    servicio.CambiarLineaProduccion.return_value = CambiarLineaProduccionBobinaTuboResponse(
        IdProduccionAnterior=10,
        IdProduccionBobinaTubo=11,
        FechaInicioProduccion=datetime(2026, 10, 27, 14, 0, tzinfo=timezone.utc),
        IdTurno=1,
        NombreTurno="Mañana",
        IdProducto=2,
        NombreProducto="EcoPack",
    )
    app.dependency_overrides[produccion_bobina_papel_service] = lambda: servicio
    return servicio


def test_el_lider_cambia_de_linea_con_su_id_de_usuario(cliente, como, servicio_produccion):
    lider = como(L)

    respuesta = cliente.post(
        "/papelbobina/produccion/cambiarlinea", json={"IdProduccionBobinaTubo": 10, "IdProducto": 2}
    )

    assert respuesta.status_code == status.HTTP_201_CREATED
    assert respuesta.json()["IdProduccionBobinaTubo"] == 11
    datos, id_usuario = servicio_produccion.CambiarLineaProduccion.call_args.args
    assert datos.IdProducto == 2
    assert id_usuario == lider["IdUsuario"]


@pytest.mark.parametrize("rol", [O, G], ids=["operador", "gerente"])
def test_operador_y_gerente_no_llegan_al_servicio_de_cambio_de_linea(cliente, como, servicio_produccion, rol):
    como(rol)

    respuesta = cliente.post(
        "/papelbobina/produccion/cambiarlinea", json={"IdProduccionBobinaTubo": 10, "IdProducto": 2}
    )

    assert respuesta.status_code == status.HTTP_403_FORBIDDEN
    servicio_produccion.CambiarLineaProduccion.assert_not_called()


def test_cuerpo_invalido_del_lider_responde_422_sin_llamar_al_servicio(cliente, como, servicio_produccion):
    como(L)

    respuesta = cliente.post("/papelbobina/produccion/cambiarlinea", json={"IdProducto": "dos"})

    assert respuesta.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    servicio_produccion.CambiarLineaProduccion.assert_not_called()
