# Pruebas de rendimiento del backend

Se ejecutan contra una base de datos de Supabase **separada de la real**, creada con `bd.sql` y `data.sql`.
Los tokens se firman con una llave propia y un servidor local publica la llave pública en el puerto 8099,
por eso no se usa Supabase Auth.

Todos los comandos se ejecutan desde `Blanquita-Backend`, de día (de 00:00 a 05:59 el modo consulta responde 423 a las escrituras).

## Archivos

| Archivo | Para qué |
|---|---|
| `.env.rendimiento` | Conexión a la BD de prueba y `SUPABASE_URL` local (no se sube a git) |
| `comun.py` | Llave de prueba, `jwks.json` y emisión de tokens |
| `sembrar.py` | Rol Gerente General, 10 usuarios y seis meses de datos (solo sobre una BD sin usuarios) |
| `locustfile.py` | Usuarios simulados: Operador (70 %), Líder (20 %) y Gerente (10 %) |
| `escenarios.py` | Forma de la carga según la variable `ESCENARIO` |
| `salida/` | Llave, usuarios y reportes generados (no se sube a git) |

## 1. Sembrar la BD de prueba (una sola vez)

```bash
uv run --env-file scripts/rendimiento/.env.rendimiento python scripts/rendimiento/sembrar.py
```

## 2. Levantar el servidor de llaves y el backend (dos terminales)

```bash
uv run python -m http.server 8099 --bind 127.0.0.1 --directory scripts/rendimiento/salida
```

```bash
uv run --env-file scripts/rendimiento/.env.rendimiento uvicorn app.main:app --host 127.0.0.1 --port 8000 --log-level warning
```

## 3. Ejecutar un escenario

| `ESCENARIO` | Usuarios | Duración | Qué mide |
|---|---|---|---|
| `humo` | 3 | 1 min | Que todo responda antes de una prueba larga |
| `carga` | 15 | 11 min | Uso diario normal de la planta |
| `estres` | 10 → 100, +10 cada 2 min | 20 min | Límite del sistema |
| `pico` | 5 → 40 → 5 | 4 min | Cambio de turno de las 06:00 |
| `resistencia` | 15 | 31 min | Degradación con el tiempo |

Con interfaz web y gráficas en vivo (http://localhost:8089):

```bash
ESCENARIO=carga uv run locust -f scripts/rendimiento/escenarios.py
```

Sin interfaz, con reporte HTML y CSV:

```bash
ESCENARIO=carga uv run locust -f scripts/rendimiento/escenarios.py --headless --only-summary --html scripts/rendimiento/salida/carga.html --csv scripts/rendimiento/salida/carga
```

En PowerShell la variable se define antes: `$env:ESCENARIO="carga"`.

## 4. Pool de conexiones (antes / después)

`app/Config/supabase.py` usa `NullPool` salvo que se defina `DB_POOL=cola`. `.env.rendimiento` ya lo activa
(`DB_POOL_SIZE`, `DB_MAX_OVERFLOW`, `DB_POOL_TIMEOUT`, `DB_POOL_RECYCLE`; `DB_POOL_PRE_PING=0` desactiva la verificación).
Para medir el "antes", comente `DB_POOL` en `.env.rendimiento` y guarde los reportes sin prefijo; para el "después",
actívelo y use el prefijo `despues_` en `--html` y `--csv`.

La tabla comparativa por operación y el historial del estrés se generan con:

```bash
uv run python scripts/rendimiento/comparar.py > scripts/rendimiento/salida/comparacion.md
```
