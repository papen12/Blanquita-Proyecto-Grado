import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Header from "@/components/layout/Header";
import InputForModal from "@/components/layout/InputForModal";
import SelectForModal from "@/components/layout/SelectForModal";
import {
  TablaFilas,
  TarjetaFila,
  TarjetaSeccion,
  EsqueletoCarga,
  ErrorCarga,
} from "@/components/Reportes/Producto/comunes";
import { DERECHA, columnaCodigo } from "@/components/Reportes/comunes";
import { listarLineas, crearLinea, listarProductos, crearProducto } from "@/services/Catalogo/Catalogo";
import { cn } from "@/lib/utils";

const NOMBRE_MIN = 3;
const NOMBRE_MAX = 30;
const PATRON_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 -]+$/;
const PATRON_ENTERO = /^\d{0,4}$/;
const PATRON_SIGLAS = /^[A-Z]{3}$/;

const LIMITES_CANTIDAD = {
  Rollos: { minimo: 2, maximo: 100 },
  Unidades: { minimo: 20, maximo: 1000 },
};
const MAXIMO_POR_UNIDAD_TERMINADA = 50;

const VALORES_POR_DEFECTO = {
  IdProducto: "",
  TipoCantidad: "Rollos",
  TipoContenedor: "Jaba",
  CantidadRollosUnidades: "",
  CantidadPorUnidadTerminada: "",
};

const limpiarNombre = (nombre) => nombre.trim().replace(/\s+/g, " ");

const soloLetras = (texto) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

// Siglas sugeridas: las 3 primeras letras del nombre (Toalla Pro → TOA).
const siglasSugeridas = (nombre) => soloLetras(nombre).slice(0, 3);

const nombrePresentacion = (p) => `${p.NombreProducto} ${p.CantidadRollosUnidades}`;

// El backend arma el mismo código; aquí solo se muestra como vista previa.
const armarCodigo = (sigla, contenedor, cantidad) =>
  sigla && cantidad ? `${sigla}-${contenedor[0]}${String(Number(cantidad)).padStart(2, "0")}` : "";

const COLUMNAS = [
  columnaCodigo("CodigoPresentacion"),
  { titulo: "Producto", clase: "font-semibold text-slate-900", valor: nombrePresentacion },
  { titulo: "Empaque", valor: (p) => p.TipoContenedor },
  { titulo: "Contenido", ...DERECHA, valor: (p) => p.CantidadRollosUnidades },
  { titulo: "Por unidad terminada", ...DERECHA, valor: (p) => p.CantidadPorUnidadTerminada },
];

const tarjetaPresentacion = (p) => (
  <TarjetaFila nombre={nombrePresentacion(p)} detalle={`${p.CodigoPresentacion} · ${p.TipoContenedor}`}>
    <strong className="text-slate-900">{p.CantidadPorUnidadTerminada}</strong>{" "}
    <span className="text-slate-500">por unidad</span>
  </TarjetaFila>
);

function Segmentado({ etiqueta, opciones, valor, onCambio }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs font-bold uppercase tracking-wide text-slate-600">{etiqueta}</Label>
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
        {opciones.map(({ valor: v, texto, deshabilitado }) => (
          <button
            key={v}
            type="button"
            disabled={deshabilitado}
            onClick={() => onCambio(v)}
            className={cn(
              "h-9 rounded-md text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
              valor === v ? "bg-white text-c3 shadow-sm" : "text-slate-500 enabled:hover:text-slate-700",
            )}
          >
            {texto}
          </button>
        ))}
      </div>
    </div>
  );
}

function DialogoLinea({ abierto, lineas, onCerrar, onGuardado }) {
  const [datos, setDatos] = useState({ NombreProducto: "", SiglasProducto: "" });
  const [siglasEditadas, setSiglasEditadas] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!abierto) return;
    setDatos({ NombreProducto: "", SiglasProducto: "" });
    setSiglasEditadas(false);
    setError("");
  }, [abierto]);

  // Las siglas se llenan solas con el nombre hasta que el usuario las cambia a mano.
  const cambiarNombre = (valor) => {
    const nombre = valor.slice(0, NOMBRE_MAX);
    setDatos((previos) => ({
      NombreProducto: nombre,
      SiglasProducto: siglasEditadas ? previos.SiglasProducto : siglasSugeridas(nombre),
    }));
  };

  const cambiarSiglas = (valor) => {
    setSiglasEditadas(true);
    setDatos((previos) => ({ ...previos, SiglasProducto: soloLetras(valor).slice(0, 3) }));
  };

  const limpio = limpiarNombre(datos.NombreProducto);
  const lineaMismoNombre = lineas.find((l) => l.NombreProducto.toLowerCase() === limpio.toLowerCase());
  const lineaMismasSiglas = lineas.find((l) => l.SiglasProducto === datos.SiglasProducto);

  let errorNombre = "";
  if (limpio && (limpio.length < NOMBRE_MIN || !PATRON_NOMBRE.test(limpio)))
    errorNombre = `Entre ${NOMBRE_MIN} y ${NOMBRE_MAX} caracteres: letras, números, espacios y guiones`;
  else if (lineaMismoNombre) errorNombre = "Ya existe una línea con este nombre";

  let errorSiglas = "";
  if (datos.SiglasProducto && !PATRON_SIGLAS.test(datos.SiglasProducto)) errorSiglas = "Exactamente 3 letras";
  else if (lineaMismasSiglas) errorSiglas = `Ya las usa la línea ${lineaMismasSiglas.NombreProducto}`;

  const valido = limpio && datos.SiglasProducto && !errorNombre && !errorSiglas;

  const confirmar = async () => {
    setEnviando(true);
    setError("");
    try {
      onGuardado(await crearLinea(datos));
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && !enviando && onCerrar()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nueva línea de producción</DialogTitle>
          <DialogDescription>
            Las siglas encabezan el código de todos los productos de la línea y no se pueden cambiar después.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <InputForModal
            id="linea-nombre"
            etiqueta="Nombre de la línea"
            valor={datos.NombreProducto}
            onCambio={cambiarNombre}
            placeholder="Ej. Toalla Pro"
            error={errorNombre}
          />
          <InputForModal
            id="linea-siglas"
            etiqueta="Siglas"
            valor={datos.SiglasProducto}
            onCambio={cambiarSiglas}
            placeholder="Ej. TOA"
            classNameInput="font-mono uppercase"
            error={errorSiglas}
          />
          {datos.SiglasProducto && !errorSiglas && (
            <p className="-mt-2 text-xs text-slate-500">
              Los códigos quedarán como{" "}
              <span className="font-mono font-bold text-slate-700">{datos.SiglasProducto}-J06</span> o{" "}
              <span className="font-mono font-bold text-slate-700">{datos.SiglasProducto}-P12</span>.
            </p>
          )}
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600">{error}</div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={confirmar}
            disabled={enviando || !valido}
            className="h-11 w-full gap-2 bg-slate-900 font-extrabold text-white hover:bg-slate-800 sm:w-auto"
          >
            {enviando ? <Loader2 size={16} className="animate-spin" /> : "Crear línea"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DialogoProducto({ abierto, idLineaInicial, lineas, presentaciones, onCerrar, onGuardado }) {
  const [datos, setDatos] = useState(VALORES_POR_DEFECTO);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!abierto) return;
    setDatos({ ...VALORES_POR_DEFECTO, IdProducto: idLineaInicial ? String(idLineaInicial) : "" });
    setError("");
  }, [abierto, idLineaInicial]);

  const cambiar = (campo) => (valor) => setDatos((previos) => ({ ...previos, [campo]: valor }));

  // La plancha es solo para productos por rollos.
  const cambiarTipoCantidad = (tipo) =>
    setDatos((previos) => ({
      ...previos,
      TipoCantidad: tipo,
      TipoContenedor: tipo === "Unidades" ? "Jaba" : previos.TipoContenedor,
    }));

  const opcionesLinea = useMemo(
    () => lineas.map((l) => ({ ...l, Etiqueta: `${l.NombreProducto} (${l.SiglasProducto})` })),
    [lineas],
  );
  const linea = lineas.find((l) => String(l.IdProducto) === datos.IdProducto);
  const limites = LIMITES_CANTIDAD[datos.TipoCantidad];
  const codigo = armarCodigo(linea?.SiglasProducto, datos.TipoContenedor, datos.CantidadRollosUnidades);
  const codigoRepetido = Boolean(codigo) && presentaciones.some((p) => p.CodigoPresentacion === codigo);

  const errores = {};
  const cantidad = Number(datos.CantidadRollosUnidades);
  if (datos.CantidadRollosUnidades !== "" && (cantidad < limites.minimo || cantidad > limites.maximo))
    errores.CantidadRollosUnidades = `Entre ${limites.minimo} y ${limites.maximo} ${datos.TipoCantidad.toLowerCase()}`;
  const porUnidad = Number(datos.CantidadPorUnidadTerminada);
  if (datos.CantidadPorUnidadTerminada !== "" && (porUnidad < 1 || porUnidad > MAXIMO_POR_UNIDAD_TERMINADA))
    errores.CantidadPorUnidadTerminada = `Entre 1 y ${MAXIMO_POR_UNIDAD_TERMINADA}`;

  const completo = linea && datos.CantidadRollosUnidades !== "" && datos.CantidadPorUnidadTerminada !== "";
  const valido = completo && Object.keys(errores).length === 0 && !codigoRepetido;

  const confirmar = async () => {
    setEnviando(true);
    setError("");
    try {
      onGuardado(await crearProducto(datos));
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={(open) => !open && !enviando && onCerrar()}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo producto</DialogTitle>
          <DialogDescription>El código se arma con la sigla de la línea, el empaque y la cantidad.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <SelectForModal
            id="producto-linea"
            etiqueta="Línea de producción"
            opciones={opcionesLinea}
            campoValor="IdProducto"
            campoEtiqueta="Etiqueta"
            valor={datos.IdProducto}
            onCambio={cambiar("IdProducto")}
            placeholder="Selecciona una línea"
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Segmentado
              etiqueta="Contenido"
              opciones={Object.keys(LIMITES_CANTIDAD).map((t) => ({ valor: t, texto: t }))}
              valor={datos.TipoCantidad}
              onCambio={cambiarTipoCantidad}
            />
            <Segmentado
              etiqueta="Empaque"
              opciones={[
                { valor: "Jaba", texto: "Jaba" },
                { valor: "Plancha", texto: "Plancha", deshabilitado: datos.TipoCantidad === "Unidades" },
              ]}
              valor={datos.TipoContenedor}
              onCambio={cambiar("TipoContenedor")}
            />
          </div>
          {datos.TipoCantidad === "Unidades" && (
            <p className="-mt-2 text-xs text-slate-500">Los productos por unidades solo se empacan en jaba.</p>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InputForModal
              id="producto-cantidad"
              etiqueta={`${datos.TipoCantidad} por ${datos.TipoContenedor.toLowerCase()}`}
              valor={datos.CantidadRollosUnidades}
              onCambio={(v) => PATRON_ENTERO.test(v) && cambiar("CantidadRollosUnidades")(v)}
              inputMode="numeric"
              placeholder={`${limites.minimo} – ${limites.maximo}`}
              classNameInput="tabular-nums"
              error={errores.CantidadRollosUnidades}
            />
            <InputForModal
              id="producto-por-unidad"
              etiqueta="Por unidad terminada"
              valor={datos.CantidadPorUnidadTerminada}
              onCambio={(v) => PATRON_ENTERO.test(v) && cambiar("CantidadPorUnidadTerminada")(v)}
              inputMode="numeric"
              placeholder={`1 – ${MAXIMO_POR_UNIDAD_TERMINADA}`}
              classNameInput="tabular-nums"
              error={errores.CantidadPorUnidadTerminada}
            />
          </div>

          <div className="flex flex-col gap-1 rounded-lg bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Código</span>
              <span
                className={cn(
                  "font-mono text-base font-extrabold",
                  codigoRepetido ? "text-red-600" : codigo ? "text-slate-900" : "text-slate-300",
                )}
              >
                {codigo || `${linea?.SiglasProducto ?? "SIG"}-${datos.TipoContenedor[0]}00`}
              </span>
            </div>
            {linea && datos.CantidadRollosUnidades && (
              <div className="text-right text-[12.5px] font-semibold text-slate-500">
                {linea.NombreProducto} {Number(datos.CantidadRollosUnidades)}
              </div>
            )}
          </div>
          {codigoRepetido && (
            <p className="-mt-3 text-xs font-semibold text-red-600">Ya existe un producto con este código.</p>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600">{error}</div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={confirmar}
            disabled={enviando || !valido}
            className="h-11 w-full gap-2 bg-slate-900 font-extrabold text-white hover:bg-slate-800 sm:w-auto"
          >
            {enviando ? <Loader2 size={16} className="animate-spin" /> : "Crear producto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SeccionLinea({ linea, productos, onAgregar }) {
  return (
    <TarjetaSeccion
      titulo={linea.NombreProducto}
      extra={
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[13px] font-bold text-slate-600">
            {linea.SiglasProducto}
          </span>
          <Button
            variant="ghost"
            onClick={() => onAgregar(linea.IdProducto)}
            className="h-9 gap-1.5 font-bold text-c3 hover:bg-c4/10 hover:text-c3"
          >
            <Plus size={15} strokeWidth={2.5} />
            Agregar
          </Button>
        </div>
      }
    >
      {productos.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-400">Esta línea todavía no tiene productos.</div>
      ) : (
        <TablaFilas
          columnas={COLUMNAS}
          filas={productos}
          clave={(p) => p.IdPresentacion}
          tarjeta={tarjetaPresentacion}
        />
      )}
    </TarjetaSeccion>
  );
}

export default function Catalogo() {
  const [lineas, setLineas] = useState(null);
  const [presentaciones, setPresentaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [dialogoLinea, setDialogoLinea] = useState(false);
  const [dialogoProducto, setDialogoProducto] = useState({ abierto: false, idLinea: null });

  const cargar = async () => {
    setCargando(true);
    setError("");
    try {
      const [lineasCargadas, presentacionesCargadas] = await Promise.all([listarLineas(), listarProductos()]);
      setLineas(lineasCargadas);
      setPresentaciones(presentacionesCargadas);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const productosPorLinea = useMemo(() => {
    const grupos = new Map();
    for (const p of presentaciones) {
      if (!grupos.has(p.IdProducto)) grupos.set(p.IdProducto, []);
      grupos.get(p.IdProducto).push(p);
    }
    return grupos;
  }, [presentaciones]);

  const alGuardarLinea = (linea) => {
    setDialogoLinea(false);
    toast.success(`Línea ${linea.NombreProducto} creada con las siglas ${linea.SiglasProducto}`);
    cargar();
  };

  const alGuardarProducto = (producto) => {
    setDialogoProducto({ abierto: false, idLinea: null });
    toast.success(`Producto ${producto.CodigoPresentacion} creado`);
    cargar();
  };

  return (
    <div className="contenido-con-sidebar flex min-h-screen flex-col bg-slate-50 pt-20 font-sans text-slate-900 md:pt-0">
      <Toaster richColors position="top-center" />
      <Header
        volver="/admin/inicio"
        titulo="Administración"
        subtitulo="Líneas y productos"
        contador={presentaciones.length ? { valor: presentaciones.length, singular: "producto", plural: "productos" } : null}
        accion={{
          texto: "Nuevo producto",
          icono: Plus,
          onClick: () => setDialogoProducto({ abierto: true, idLinea: null }),
        }}
      >
        <Button
          onClick={() => setDialogoLinea(true)}
          variant="ghost"
          className="h-11 gap-2 font-bold text-white ring-1 ring-white/40 hover:bg-white/15 hover:text-white"
        >
          <Plus size={16} strokeWidth={2.75} />
          Nueva línea
        </Button>
      </Header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-6 sm:px-6">
        {(cargando || error) && (
          <TarjetaSeccion titulo="Líneas de producción">
            {cargando ? <EsqueletoCarga /> : <ErrorCarga error={error} recargar={cargar} />}
          </TarjetaSeccion>
        )}

        {!cargando && !error && lineas?.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-400 shadow-sm ring-1 ring-slate-200">
            Todavía no hay líneas de producción.
          </div>
        )}

        {!cargando && !error && lineas?.length > 0 && (
          <div className="flex flex-col gap-4">
            {lineas.map((linea) => (
              <SeccionLinea
                key={linea.IdProducto}
                linea={linea}
                productos={productosPorLinea.get(linea.IdProducto) ?? []}
                onAgregar={(idLinea) => setDialogoProducto({ abierto: true, idLinea })}
              />
            ))}
          </div>
        )}
      </main>

      <DialogoLinea
        abierto={dialogoLinea}
        lineas={lineas ?? []}
        onCerrar={() => setDialogoLinea(false)} onGuardado={alGuardarLinea} />
      <DialogoProducto
        abierto={dialogoProducto.abierto}
        idLineaInicial={dialogoProducto.idLinea}
        lineas={lineas ?? []}
        presentaciones={presentaciones}
        onCerrar={() => setDialogoProducto({ abierto: false, idLinea: null })}
        onGuardado={alGuardarProducto}
      />
    </div>
  );
}
