from datetime import timedelta

from sqlalchemy import func

ZONA_HORARIA = "America/La_Paz"


def nombre_operador(usuario):
    return usuario.PrimerNombre + " " + usuario.ApellidoPaterno


def filtro_rango(columna, fecha_inicio, fecha_fin):
    # Compara contra la hora local de Bolivia, no la de la conexión, para que
    # "un día" vaya de 00:00 a 23:59 en planta.
    columna = func.timezone(ZONA_HORARIA, columna)
    condiciones = []
    if fecha_inicio is not None:
        condiciones.append(columna >= fecha_inicio)
    if fecha_fin is not None:
        condiciones.append(columna < fecha_fin + timedelta(days=1))
    return condiciones
