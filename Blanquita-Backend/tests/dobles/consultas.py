from datetime import time


class CallerStub:
    def __init__(self, filas: list[dict]):
        self.filas = filas
        self.consultas = []

    def Consultar(self, consulta) -> list[dict]:
        self.consultas.append(consulta)
        return self.filas


TURNO_MANANA_BD = {"IdTurno": 1, "NombreTurno": "Mañana", "HoraInicio": time(6, 0, 0), "HoraFin": time(11, 59, 59)}
TURNO_TARDE_BD = {"IdTurno": 2, "NombreTurno": "Tarde", "HoraInicio": time(12, 0, 0), "HoraFin": time(15, 0, 0)}
TURNO_HORAS_EXTRA_BD = {"IdTurno": 3, "NombreTurno": "Horas Extra", "HoraInicio": time(15, 1, 0), "HoraFin": time(23, 59, 59)}
TURNO_HORAS_EXTRA_SEMILLA = {**TURNO_HORAS_EXTRA_BD, "HoraFin": time(5, 59, 59)}

TURNOS_BD = [TURNO_MANANA_BD, TURNO_TARDE_BD, TURNO_HORAS_EXTRA_BD]
TURNOS_SEMILLA = [TURNO_MANANA_BD, TURNO_TARDE_BD, TURNO_HORAS_EXTRA_SEMILLA]
