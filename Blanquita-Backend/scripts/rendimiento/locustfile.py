import random
from datetime import date, timedelta
from itertools import count

from locust import HttpUser, between, task

from comun import emitir_token, leer_usuarios

ROL_OPERADOR, ROL_LIDER, ROL_GERENTE = 1, 2, 3
PRESENTACIONES_JABA = [1, 2, 3, 4, 5, 6, 7, 8, 9, 12]
PRESENTACIONES_PLANCHA = [10, 11]

USUARIOS = leer_usuarios()
TOKENS = {u["IdUsuario"]: emitir_token(u) for u in USUARIOS}
_turno = count()


def periodo(dias: int) -> dict:
    hoy = date.today()
    return {"FechaInicio": (hoy - timedelta(days=dias)).isoformat(), "FechaFin": hoy.isoformat()}


class UsuarioBlanquita(HttpUser):
    abstract = True
    host = "http://127.0.0.1:8000"
    wait_time = between(2, 6)
    id_rol = None

    def on_start(self):
        candidatos = [u for u in USUARIOS if u["IdRol"] == self.id_rol]
        usuario = candidatos[next(_turno) % len(candidatos)]
        self.client.headers["Authorization"] = f"Bearer {TOKENS[usuario['IdUsuario']]}"
        self.producciones = []

    def ver_producciones_activas(self):
        respuesta = self.client.get("/papelbobina/produccion/activas", name="GET producciones activas")
        if respuesta.ok:
            self.producciones = [p["IdProduccionBobinaTubo"] for p in respuesta.json()]

    def ver_notificaciones(self):
        self.client.get("/notificaciones/resumen", name="GET notificaciones")


class OperadorUsuario(UsuarioBlanquita):
    weight = 7
    id_rol = ROL_OPERADOR

    @task(4)
    def producciones(self):
        self.ver_producciones_activas()

    @task(5)
    def registrar_logs(self):
        if not self.producciones:
            self.ver_producciones_activas()
        if self.producciones:
            self.client.post(
                "/papelbobina/produccion/insertarlog",
                json={
                    "IdProduccionBobinaTubo": random.choice(self.producciones),
                    "IdTipoMovimientoOperadorLogs": 1,
                    "CantidadLogs": random.randint(5, 40),
                },
                name="POST registrar logs",
            )

    @task(3)
    def ingresar_producto_terminado(self):
        self.client.post(
            "/productofinal/insertar",
            json={"Presentaciones": [{"IdPresentacion": random.choice(PRESENTACIONES_JABA), "Cantidad": random.randint(1, 20)}]},
            name="POST ingreso producto terminado",
        )

    @task(2)
    def inventario_bobinas(self):
        self.client.get("/papelbobina/inventario/resumen", name="GET inventario bobina papel")

    @task(2)
    def inventario_producto(self):
        self.client.get("/productofinal/inventario/ver", name="GET inventario producto terminado")

    @task(1)
    def bloqueo(self):
        self.client.get("/productofinal/bloqueo", name="GET bloqueo producto terminado")

    @task(3)
    def notificaciones(self):
        self.ver_notificaciones()


class LiderUsuario(UsuarioBlanquita):
    weight = 2
    id_rol = ROL_LIDER

    @task(4)
    def notificaciones(self):
        self.ver_notificaciones()

    @task(2)
    def inicio_bobina_papel(self):
        self.client.get("/papelbobina/inicio/resumen", name="GET inicio bobina papel")

    @task(2)
    def inicio_producto(self):
        self.client.get("/productofinal/inicio/inventario/resumen", name="GET inicio producto terminado")

    @task(2)
    def producciones(self):
        self.ver_producciones_activas()

    @task(1)
    def pausadas(self):
        self.client.get("/papelbobina/produccion/pausadas", name="GET producciones pausadas")

    @task(2)
    def despachar(self):
        self.client.post(
            "/productofinal/salida",
            json={
                "Observacion": "Despacho de prueba de rendimiento",
                "Presentaciones": [
                    {"IdPresentacion": id_presentacion, "Cantidad": random.randint(1, 5)}
                    for id_presentacion in random.sample(PRESENTACIONES_JABA + PRESENTACIONES_PLANCHA, 2)
                ],
            },
            name="POST salida producto terminado",
        )

    @task(1)
    def reporte_inventario(self):
        self.client.get("/productofinal/reportes/inventario", name="GET PDF inventario producto terminado")

    @task(1)
    def reporte_salidas(self):
        self.client.get("/productofinal/reportes/salidas", params=periodo(30), name="GET PDF salidas del mes")


class GerenteUsuario(UsuarioBlanquita):
    weight = 1
    id_rol = ROL_GERENTE

    @task(3)
    def inicio_semana(self):
        self.client.get("/gerente/inicio/semana/resumen", name="GET inicio gerente semana")

    @task(1)
    def inicio_mes(self):
        self.client.get("/gerente/inicio/mes/resumen", name="GET inicio gerente mes")

    @task(2)
    def notificaciones(self):
        self.ver_notificaciones()

    @task(2)
    def producciones(self):
        self.ver_producciones_activas()

    @task(1)
    def reporte_inventario(self):
        self.client.get("/productofinal/reportes/inventario", name="GET PDF inventario producto terminado")

    @task(1)
    def reporte_produccion(self):
        self.client.get("/productofinal/reportes/produccion/diaria", params=periodo(7), name="GET PDF producción semanal")
