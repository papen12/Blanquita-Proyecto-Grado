from datetime import timedelta

from sqlalchemy import func

ZONA_HORARIA = "America/La_Paz"


def nombre_operador(usuario):
    return usuario.PrimerNombre + " " + usuario.ApellidoPaterno


def filtro_rango(columna, fecha_inicio, fecha_fin):
    
    columna = func.timezone(ZONA_HORARIA, columna)
    condiciones = []
    if fecha_inicio is not None:
        condiciones.append(columna >= fecha_inicio)
    if fecha_fin is not None:
        condiciones.append(columna < fecha_fin + timedelta(days=1))
    return condiciones
