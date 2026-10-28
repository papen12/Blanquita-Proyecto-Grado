import os
import random
import sys
import uuid
from collections import defaultdict
from datetime import date, datetime, time, timedelta
from decimal import Decimal
from pathlib import Path
from zoneinfo import ZoneInfo

from dotenv import dotenv_values

RAIZ = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(RAIZ))
sys.path.insert(0, str(Path(__file__).resolve().parent))

from sqlalchemy import func, insert, select, text, update

from app.Config.supabase import SessionLocal
from app.Schemas.BobinaPapel import BobinaPapel, LoteBobina, MovimientoBobina
from app.Schemas.Produccion import (
    CancelacionProduccionBobinaTubo,
    MovimientoOperadorLogs,
    PausaProduccionBobinaTubo,
    ProduccionBobinaTubo,
)
from app.Schemas.Producto import InventarioProductoTerminado, MovimientoProductoTerminado, PresentacionProducto
from app.Schemas.Proveedor import Proveedor
from app.Schemas.Usuario import Rol, Usuario
from comun import guardar_usuarios, llave_privada, publicar_jwks

ZONA = ZoneInfo("America/La_Paz")
DIAS_HISTORIA = 180
TARA_KG = Decimal("38")

EN_ALMACEN, EN_PRODUCCION, AGOTADO, FUERA_INVENTARIO = 1, 2, 3, 5
INGRESO, TRASLADO, RETIRO_FALLA, PRODUCCION_TERMINADA = 1, 2, 5, 7
EN_PRODUCCION_ESTADO, FINALIZADO, CANCELADA = 1, 3, 4
PT_ENTRADA, PT_SALIDA, PT_DESCUENTO, PT_AJUSTE_POSITIVO, PT_AJUSTE_NEGATIVO = 1, 2, 3, 5, 6

PESO_TIPO = {1: 0.6, 2: 0.25, 3: 0.15}
PRODUCTOS_POR_TIPO = {1: [1, 2, 4], 2: [7], 3: [5]}
ACTIVAS_POR_TIPO = {1: 5, 2: 3, 3: 2}
PROPORCION_EN_ALMACEN = 0.2
PROPORCION_CANCELADAS = 0.03

MOTIVOS_PAUSA = [
    "Empalme de bobina",
    "Falta de pegamento",
    "Falta de personal",
    "Falla en la maquina rebobinadora",
    "Cambio de cuchilla",
    "Limpieza de rodillos",
]

OPERADORES = [
    ("9000001", "Juan", "Mamani"),
    ("9000002", "Rosa", "Quispe"),
    ("9000003", "Pedro", "Flores"),
    ("9000004", "Maria", "Choque"),
    ("9000005", "Luis", "Condori"),
    ("9000006", "Elena", "Vargas"),
    ("9000007", "Mario", "Torrez"),
    ("9000008", "Carla", "Huanca"),
]
LIDER = ("9000101", "Carlos", "Perez")
GERENTE = ("9000201", "Osvaldo", "Rojas")

PROVEEDORES = [
    ("Papelera Andina S.A.", "71234567", "ventas@papeleraandina.com"),
    ("Celulosa del Pacifico", "72345678", "pedidos@celulosapacifico.com"),
    ("Kraft Bolivia S.R.L.", "73456789", "comercial@kraftbolivia.com"),
    ("Tissue Import Ltda.", "74567890", "contacto@tissueimport.com"),
]


def momento(dia: date, hora: int, minuto: int = 0) -> datetime:
    return datetime.combine(dia, time(hora, minuto), tzinfo=ZONA)


def turno_de(instante: datetime) -> int:
    hora = instante.astimezone(ZONA).hour
    if 6 <= hora < 12:
        return 1
    if 12 <= hora < 15:
        return 2
    return 3


def verificar_destino() -> None:
    real = dotenv_values(RAIZ / "app" / ".env").get("DATABASE_URL")
    if real and real == os.environ.get("DATABASE_URL"):
        raise SystemExit("DATABASE_URL apunta a la base de datos real. Use --env-file scripts/rendimiento/.env.rendimiento")


def insertar(sesion, modelo, filas: list[dict], clave=None) -> list[int]:
    if not filas:
        return []
    if clave is None:
        sesion.execute(insert(modelo), filas)
        return []
    resultado = sesion.execute(insert(modelo).returning(clave, sort_by_parameter_order=True), filas)
    return [fila[0] for fila in resultado]


def sembrar_usuarios(sesion) -> list[dict]:
    if sesion.get(Rol, 3) is None:
        sesion.add(Rol(IdRol=3, NombreRol="Gerente General", Descripcion="Consulta de inventario, producción y reportes"))
        sesion.flush()

    especificaciones = (
        [(ci, nombre, apellido, 1, False) for ci, nombre, apellido in OPERADORES]
        + [(*LIDER, 2, True), (*GERENTE, 3, True)]
    )
    usuarios = []
    for ci, nombre, apellido, id_rol, es_admin in especificaciones:
        auth_id = str(uuid.uuid4())
        sesion.execute(
            text(
                "insert into auth.users (id, aud, role, email, created_at, updated_at) "
                "values (:id, 'authenticated', 'authenticated', :correo, now(), now())"
            ),
            {"id": auth_id, "correo": f"{ci}@papelblanquita.invalid"},
        )
        id_usuario = sesion.execute(
            insert(Usuario)
            .values(
                AuthUserId=uuid.UUID(auth_id),
                IdRol=id_rol,
                IdEstadoUsuario=1,
                Ci=ci,
                PrimerNombre=nombre,
                ApellidoPaterno=apellido,
                Celular=f"7{ci[-7:]}",
                IsAdmin=es_admin,
            )
            .returning(Usuario.IdUsuario)
        ).scalar_one()
        usuarios.append(
            {"IdUsuario": id_usuario, "IdRol": id_rol, "IsAdmin": es_admin, "AuthUserId": auth_id, "Ci": ci, "Nombre": f"{nombre} {apellido}"}
        )
    return usuarios


def sembrar_bobinas(sesion, hoy: date, id_lider: int) -> dict[int, list[dict]]:
    proveedores = insertar(
        sesion,
        Proveedor,
        [{"NombreProveedor": n, "CelularProveedor": c, "CorreoProveedor": m} for n, c, m in PROVEEDORES],
        Proveedor.IdProveedor,
    )
    proveedores += [p for (p,) in sesion.execute(select(Proveedor.IdProveedor).where(Proveedor.IdProveedor.notin_(proveedores)))]

    inicio = hoy - timedelta(days=DIAS_HISTORIA)
    por_tipo: dict[int, list[dict]] = defaultdict(list)
    secuencia = 0
    for semana in range(DIAS_HISTORIA // 7):
        for desfase in (0, 3):
            recepcion = inicio + timedelta(days=semana * 7 + desfase)
            id_tipo = random.choices(list(PESO_TIPO), weights=list(PESO_TIPO.values()))[0]
            id_lote = insertar(
                sesion,
                LoteBobina,
                [{"IdProveedor": random.choice(proveedores), "IdUsuario": id_lider, "FechaRecepcion": recepcion}],
                LoteBobina.IdLoteBobina,
            )[0]
            filas = []
            for _ in range(random.randint(25, 35)):
                secuencia += 1
                bruto = Decimal(str(round(random.uniform(700, 780), 2)))
                filas.append(
                    {
                        "CodigoBobina": f"BP-{recepcion:%y}-{secuencia:05d}",
                        "IdTipoBobina": id_tipo,
                        "IdLoteBobina": id_lote,
                        "IdEstadoMateriaPrima": EN_ALMACEN,
                        "PesoBrutoKg": bruto,
                        "PesoNetoKg": bruto - TARA_KG,
                        "Gramaje": Decimal("13.9"),
                    }
                )
            ids = insertar(sesion, BobinaPapel, filas, BobinaPapel.IdBobinaPapel)
            llegada = momento(recepcion, random.randint(7, 10), random.randint(0, 59))
            insertar(
                sesion,
                MovimientoBobina,
                [
                    {
                        "IdBobinaPapel": id_bobina,
                        "IdTipoMovimiento": INGRESO,
                        "IdUsuario": id_lider,
                        "FechaMovimiento": llegada,
                        "Observacion": "Ingreso automático al almacén por registro de bobina",
                    }
                    for id_bobina in ids
                ],
            )
            por_tipo[id_tipo] += [{"Id": i, "Recepcion": recepcion} for i in ids]
    return por_tipo


def sembrar_producciones(sesion, hoy: date, por_tipo: dict[int, list[dict]], ids_operadores: list[int], id_lider: int) -> dict:
    ahora = datetime.now(ZONA)
    resumen = defaultdict(int)
    producciones, logs, pausas, cancelaciones, movimientos, estados = [], [], [], [], [], {}

    for id_tipo, bobinas in por_tipo.items():
        pares = [bobinas[i : i + 2] for i in range(0, len(bobinas) - 1, 2)]
        en_almacen = round(len(pares) * PROPORCION_EN_ALMACEN)
        activas = ACTIVAS_POR_TIPO[id_tipo]
        historicas = pares[: max(len(pares) - en_almacen - activas, 0)]
        en_curso = pares[len(historicas) : len(historicas) + activas]

        for par in historicas:
            dia = min(par[1]["Recepcion"] + timedelta(days=random.randint(1, 10)), hoy - timedelta(days=1))
            inicio = momento(dia, random.randint(6, 18), random.randint(0, 59))
            fin = inicio + timedelta(minutes=random.randint(120, 360))
            cancelada = random.random() < PROPORCION_CANCELADAS
            operador = random.choice(ids_operadores)
            total = random.randint(0, 30) if cancelada else random.randint(60, 320)
            producciones.append(
                {
                    "par": par,
                    "fila": {
                        "IdEstadoProduccion": CANCELADA if cancelada else FINALIZADO,
                        "IdUsuario": operador,
                        "IdBobina_1": par[0]["Id"],
                        "IdBobina_2": par[1]["Id"],
                        "IdTurno": turno_de(inicio),
                        "IdProducto": random.choice(PRODUCTOS_POR_TIPO[id_tipo]),
                        "FechaInicioProduccion": inicio,
                        "FechaFinProduccion": fin,
                        "CantidadLogsActual": total,
                    },
                    "inicio": inicio,
                    "fin": fin,
                    "cancelada": cancelada,
                    "operador": operador,
                    "total": total,
                }
            )
            resumen["canceladas" if cancelada else "finalizadas"] += 1

        for par in en_curso:
            inicio = min(ahora - timedelta(minutes=random.randint(30, 180)), ahora)
            operador = random.choice(ids_operadores)
            total = random.randint(0, 40)
            producciones.append(
                {
                    "par": par,
                    "fila": {
                        "IdEstadoProduccion": EN_PRODUCCION_ESTADO,
                        "IdUsuario": operador,
                        "IdBobina_1": par[0]["Id"],
                        "IdBobina_2": par[1]["Id"],
                        "IdTurno": turno_de(inicio),
                        "IdProducto": random.choice(PRODUCTOS_POR_TIPO[id_tipo]),
                        "FechaInicioProduccion": inicio,
                        "FechaFinProduccion": None,
                        "CantidadLogsActual": total,
                    },
                    "inicio": inicio,
                    "fin": ahora,
                    "cancelada": False,
                    "operador": operador,
                    "total": total,
                    "activa": True,
                }
            )
            resumen["activas"] += 1

    ids = insertar(sesion, ProduccionBobinaTubo, [p["fila"] for p in producciones], ProduccionBobinaTubo.IdProduccionBobinaTubo)

    for id_produccion, p in zip(ids, producciones):
        duracion = (p["fin"] - p["inicio"]).total_seconds()
        restante = p["total"]
        tramos = random.randint(3, 8) if restante else 0
        for n in range(tramos):
            cantidad = restante if n == tramos - 1 else min(restante, random.randint(1, 100))
            if cantidad <= 0:
                break
            restante -= cantidad
            logs.append(
                {
                    "IdProduccionBobinaTubo": id_produccion,
                    "IdTipoMovimientoOperadorLogs": 1,
                    "IdUsuario": p["operador"],
                    "CantidadLogs": cantidad,
                    "FechaMovimiento": p["inicio"] + timedelta(seconds=duracion * (n + 1) / (tramos + 1)),
                }
            )

        cantidad_pausas = 1 if p["cancelada"] else random.choice([0, 0, 1, 1, 2])
        for _ in range(cantidad_pausas):
            pausa = p["inicio"] + timedelta(seconds=random.uniform(0.2, 0.8) * duracion)
            reanudada = None if p["cancelada"] else pausa + timedelta(minutes=random.randint(5, 90))
            pausas.append(
                {
                    "IdProduccionBobinaTubo": id_produccion,
                    "IdUsuario": p["operador"],
                    "FechaHoraPausa": pausa,
                    "MotivoPausaProduccion": random.choice(MOTIVOS_PAUSA),
                    "FechaHoraReanudacion": reanudada,
                    "MotivoReanudacion": None if reanudada is None else "Se reanuda la producción",
                }
            )
            resumen["pausas"] += 1

        if p["cancelada"]:
            cancelaciones.append(
                {
                    "IdProduccionBobinaTubo": id_produccion,
                    "IdUsuario": id_lider,
                    "MotivoCancelacion": "Bobina con falla de fábrica",
                    "FechaHoraCancelacion": p["fin"],
                }
            )

        for bobina in p["par"]:
            movimientos.append(
                {
                    "IdBobinaPapel": bobina["Id"],
                    "IdTipoMovimiento": TRASLADO,
                    "IdUsuario": p["operador"],
                    "FechaMovimiento": p["inicio"],
                    "Observacion": f"Traslado a producción - Producción Bobina Tubo #{id_produccion}",
                }
            )
            if p.get("activa"):
                estados[bobina["Id"]] = EN_PRODUCCION
                continue
            movimientos.append(
                {
                    "IdBobinaPapel": bobina["Id"],
                    "IdTipoMovimiento": RETIRO_FALLA if p["cancelada"] else PRODUCCION_TERMINADA,
                    "IdUsuario": id_lider if p["cancelada"] else p["operador"],
                    "FechaMovimiento": p["fin"],
                    "Observacion": f"Producción Bobina Tubo #{id_produccion}",
                }
            )
            estados[bobina["Id"]] = FUERA_INVENTARIO if p["cancelada"] else AGOTADO

    insertar(sesion, MovimientoOperadorLogs, logs)
    insertar(sesion, PausaProduccionBobinaTubo, pausas)
    insertar(sesion, CancelacionProduccionBobinaTubo, cancelaciones)
    insertar(sesion, MovimientoBobina, movimientos)
    for estado in (EN_PRODUCCION, AGOTADO, FUERA_INVENTARIO):
        ids_estado = [i for i, e in estados.items() if e == estado]
        if ids_estado:
            sesion.execute(
                update(BobinaPapel).where(BobinaPapel.IdBobinaPapel.in_(ids_estado)).values(IdEstadoMateriaPrima=estado)
            )
    resumen["logs"] = len(logs)
    resumen["movimientos_bobina"] = len(movimientos)
    return resumen


def sembrar_producto_terminado(sesion, hoy: date, ids_operadores: list[int], id_lider: int) -> dict:
    presentaciones = [
        p for (p,) in sesion.execute(
            select(PresentacionProducto.IdPresentacion).where(PresentacionProducto.Activo).order_by(PresentacionProducto.IdPresentacion)
        )
    ]
    stock = defaultdict(int)
    movimientos = []
    resumen = defaultdict(int)

    def agregar(tipo, id_presentacion, cantidad, instante, usuario, observacion):
        movimientos.append(
            {
                "IdTipoMovimientoInventario": tipo,
                "IdPresentacion": id_presentacion,
                "IdUsuario": usuario,
                "IdTurno": turno_de(instante),
                "CantidadIngresoInventario": cantidad,
                "FechaMovimiento": instante,
                "Observacion": observacion,
            }
        )
        resumen[tipo] += 1

    for desfase in range(DIAS_HISTORIA, 0, -1):
        dia = hoy - timedelta(days=desfase)
        if dia.weekday() == 6:
            continue
        for id_presentacion in presentaciones:
            for _ in range(random.randint(1, 3)):
                cantidad = random.randint(5, 60)
                instante = momento(dia, random.randint(6, 20), random.randint(0, 59))
                agregar(PT_ENTRADA, id_presentacion, cantidad, instante, random.choice(ids_operadores), "Ingreso al inventario de producto terminado")
                stock[id_presentacion] += cantidad

        for _ in range(random.randint(1, 3)):
            instante = momento(dia, random.randint(14, 21), random.randint(0, 59))
            for id_presentacion in random.sample(presentaciones, random.randint(2, 5)):
                cantidad = min(random.randint(20, 200), int(stock[id_presentacion] * 0.6))
                if cantidad > 0:
                    agregar(PT_SALIDA, id_presentacion, cantidad, instante, id_lider, "Despacho a distribuidor")
                    stock[id_presentacion] -= cantidad

        if random.random() < 0.3:
            id_presentacion = random.choice(presentaciones)
            if stock[id_presentacion] > 5:
                instante = momento(dia, random.randint(8, 18))
                agregar(PT_DESCUENTO, id_presentacion, random.randint(1, 5), instante, random.choice(ids_operadores), "Jabas registradas de mas")
                stock[id_presentacion] -= movimientos[-1]["CantidadIngresoInventario"]

        if random.random() < 0.05:
            id_presentacion = random.choice(presentaciones)
            tipo = random.choice([PT_AJUSTE_POSITIVO, PT_AJUSTE_NEGATIVO])
            cantidad = random.randint(1, 20)
            if tipo == PT_AJUSTE_POSITIVO or stock[id_presentacion] > cantidad:
                agregar(tipo, id_presentacion, cantidad, momento(dia, 17), id_lider, "Ajuste tras revision del almacen")
                stock[id_presentacion] += cantidad if tipo == PT_AJUSTE_POSITIVO else -cantidad

    ayer = hoy - timedelta(days=1)
    for id_presentacion in presentaciones:
        agregar(PT_ENTRADA, id_presentacion, 3000, momento(ayer, 20), random.choice(ids_operadores), "Ingreso al inventario de producto terminado")
        stock[id_presentacion] += 3000

    for inicio in range(0, len(movimientos), 2000):
        insertar(sesion, MovimientoProductoTerminado, movimientos[inicio : inicio + 2000])
    for id_presentacion, cantidad in stock.items():
        sesion.execute(
            update(InventarioProductoTerminado)
            .where(InventarioProductoTerminado.IdPresentacion == id_presentacion)
            .values(CantidadActual=cantidad)
        )
    return {
        "entradas": resumen[PT_ENTRADA],
        "salidas": resumen[PT_SALIDA],
        "correcciones": resumen[PT_DESCUENTO],
        "ajustes": resumen[PT_AJUSTE_POSITIVO] + resumen[PT_AJUSTE_NEGATIVO],
    }


def main() -> None:
    verificar_destino()
    random.seed(2026)
    llave = llave_privada()
    publicar_jwks(llave)
    hoy = datetime.now(ZONA).date()

    with SessionLocal() as sesion:
        if sesion.scalar(select(func.count()).select_from(Usuario)):
            raise SystemExit("La base de datos ya tiene usuarios; la siembra es solo para una base de datos vacía")

        usuarios = sembrar_usuarios(sesion)
        ids_operadores = [u["IdUsuario"] for u in usuarios if u["IdRol"] == 1]
        id_lider = next(u["IdUsuario"] for u in usuarios if u["IdRol"] == 2)
        sesion.commit()
        print(f"Usuarios: {len(usuarios)}")

        por_tipo = sembrar_bobinas(sesion, hoy, id_lider)
        sesion.commit()
        print(f"Bobinas: {sum(len(b) for b in por_tipo.values())}")

        print(f"Producciones: {dict(sembrar_producciones(sesion, hoy, por_tipo, ids_operadores, id_lider))}")
        sesion.commit()

        print(f"Producto terminado: {sembrar_producto_terminado(sesion, hoy, ids_operadores, id_lider)}")
        sesion.commit()

    guardar_usuarios(usuarios)
    print("Listo. Usuarios y llave en scripts/rendimiento/salida/")


if __name__ == "__main__":
    main()
