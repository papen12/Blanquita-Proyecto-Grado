import csv
import sys
from pathlib import Path

SALIDA = Path(__file__).resolve().parent / "salida"
ESCENARIOS = ["carga", "pico", "estres"]


def leer(nombre: str) -> dict[str, dict]:
    with open(SALIDA / f"{nombre}_stats.csv", encoding="cp1252") as archivo:
        return {fila["Name"]: fila for fila in csv.DictReader(archivo)}


def numero(valor) -> float:
    try:
        return float(valor)
    except (TypeError, ValueError):
        return float("nan")


def cambio(antes: float, despues: float) -> str:
    return f"{100 * (despues - antes) / antes:+.0f} %" if antes else "-"


def comparar(escenario: str) -> None:
    antes, despues = leer(escenario), leer(f"despues_{escenario}")
    print(f"\n## {escenario}\n")
    print("| Operación | Peticiones antes/después | Errores antes/después | Mediana antes → después | p95 antes → después | Cambio p95 |")
    print("|---|---|---|---|---|---|")
    for nombre in sorted(antes, key=lambda n: (n == "Aggregated", n)):
        if nombre not in despues:
            continue
        a, d = antes[nombre], despues[nombre]
        p95_a, p95_d = numero(a["95%"]), numero(d["95%"])
        print(
            f"| {'**Total**' if nombre == 'Aggregated' else nombre} "
            f"| {a['Request Count']} / {d['Request Count']} "
            f"| {a['Failure Count']} / {d['Failure Count']} "
            f"| {numero(a['Median Response Time']) / 1000:.2f} s → {numero(d['Median Response Time']) / 1000:.2f} s "
            f"| {p95_a / 1000:.2f} s → {p95_d / 1000:.2f} s "
            f"| {cambio(p95_a, p95_d)} |"
        )


def quiebre(nombre: str) -> None:
    with open(SALIDA / f"{nombre}_stats_history.csv", encoding="cp1252") as archivo:
        filas = [f for f in csv.DictReader(archivo) if f["Name"] == "Aggregated"]
    por_usuarios = {}
    for fila in filas:
        por_usuarios[int(fila["User Count"])] = fila
    print(f"\n### Historial de {nombre} cada 10 usuarios\n")
    print("| Usuarios | Pet./s | Mediana | p95 | Fallos acumulados |")
    print("|---|---|---|---|---|")
    for usuarios in range(10, 101, 10):
        fila = por_usuarios.get(usuarios)
        if fila:
            print(f"| {usuarios} | {numero(fila['Requests/s']):.1f} | {fila['50%']} ms | {fila['95%']} ms | {fila['Total Failure Count']} |")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    for escenario in sys.argv[1:] or ESCENARIOS:
        comparar(escenario)
    quiebre("estres")
    quiebre("despues_estres")
