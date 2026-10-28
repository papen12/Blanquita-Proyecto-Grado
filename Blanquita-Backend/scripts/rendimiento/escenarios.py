import os

from locust import LoadTestShape

from locustfile import GerenteUsuario, LiderUsuario, OperadorUsuario

ESCENARIOS = {
    "humo": [(60, 3, 3)],
    "carga": [(60, 15, 1), (660, 15, 1)],
    "estres": [(120 * paso, 10 * paso, 2) for paso in range(1, 11)],
    "pico": [(60, 5, 5), (180, 40, 40), (240, 5, 5)],
    "resistencia": [(60, 15, 1), (1860, 15, 1)],
}


class Escenario(LoadTestShape):
    etapas = ESCENARIOS[os.environ.get("ESCENARIO", "carga")]

    def tick(self):
        tiempo = self.get_run_time()
        for fin, usuarios, tasa in self.etapas:
            if tiempo < fin:
                return usuarios, tasa
        return None
