import { useEffect, useState } from "react";
import { Cylinder, Loader2, Pencil, Plus, RefreshCcw } from "lucide-react";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  listarTiposBobinaPapel,
  crearTipoBobinaPapel,
  editarTipoBobinaPapel,
} from "@/services/BobinaPapel/BobinaPapel";
import { formatearNumero } from "@/utils/numeros";
import { TipoBobinaPapelDatos } from "@/models/BobinaPapel/TipoBobina";

const NOMBRE_MIN = 3;
const NOMBRE_MAX = 30;
const PATRON_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 -]+$/;
const PATRON_DECIMAL = /^\d{0,4}(\.\d{0,2})?$/;

const CAMPOS_MEDIDA = [
  { campo: "DiametroMm", etiqueta: "Diámetro (mm)", maximo: 5000 },
  { campo: "Formato", etiqueta: "Formato (mm)", maximo: 5000 },
  { campo: "TaraKg", etiqueta: "Tara (kg)", maximo: 500 },
];

const VALORES_POR_DEFECTO = {
  NombreTipoBobina: "",
  DiametroMm: "1210",
  Formato: "2760",
  TaraKg: "38",
};

const aFormulario = (tipo) => ({
  NombreTipoBobina: tipo.NombreTipoBobina,
  DiametroMm: String(tipo.DiametroMm),
  Formato: String(tipo.Formato),
  TaraKg: String(tipo.TaraKg),
});

function erroresTipo(datos) {
  const errores = {};
  const nombre = datos.NombreTipoBobina.trim().replace(/\s+/g, " ");
  if (nombre && (nombre.length < NOMBRE_MIN || !PATRON_NOMBRE.test(nombre)))
    errores.NombreTipoBobina = `Entre ${NOMBRE_MIN} y ${NOMBRE_MAX} caracteres: letras, números, espacios y guiones`;
  for (const { campo, maximo } of CAMPOS_MEDIDA) {
    const valor = Number(datos[campo]);
    if (datos[campo] !== "" && (!(valor > 0) || valor > maximo))
      errores[campo] = `Mayor a 0 y hasta ${formatearNumero(maximo, { decimales: 0 })}`;
  }
  return errores;
}

function DialogoTipo({ abierto, tipo, onCerrar, onGuardado }) {
  const [datos, setDatos] = useState(VALORES_POR_DEFECTO);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const editando = Boolean(tipo);

  useEffect(() => {
    if (!abierto) return;
    setDatos(tipo ? aFormulario(tipo) : VALORES_POR_DEFECTO);
    setError("");
  }, [abierto, tipo]);

  const cambiar = (campo) => (valor) => setDatos((previos) => ({ ...previos, [campo]: valor }));

  const errores = erroresTipo(datos);
  const completo = datos.NombreTipoBobina.trim() && CAMPOS_MEDIDA.every(({ campo }) => datos[campo] !== "");
  const sinCambios =
    editando && JSON.stringify(TipoBobinaPapelDatos(tipo)) === JSON.stringify(TipoBobinaPapelDatos(datos));
  const valido = completo && Object.keys(errores).length === 0 && !sinCambios;

  const confirmar = async () => {
    setEnviando(true);
    setError("");
    try {
      const guardado = editando
        ? await editarTipoBobinaPapel(tipo.IdTipoBobina, datos)
        : await crearTipoBobinaPapel(datos);
      onGuardado(guardado, editando);
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
          <DialogTitle>{editando ? "Editar tipo de bobina" : "Nuevo tipo de bobina"}</DialogTitle>
          <DialogDescription>
            {editando
              ? "Los cambios no modifican las bobinas ya registradas."
              : "Las medidas y la tara son valores de referencia del tipo."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <InputForModal
            id="tipo-nombre"
            etiqueta="Nombre"
            valor={datos.NombreTipoBobina}
            onCambio={(v) => cambiar("NombreTipoBobina")(v.slice(0, NOMBRE_MAX))}
            placeholder="Ej. Mezcla no celulosa"
            error={errores.NombreTipoBobina}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {CAMPOS_MEDIDA.map(({ campo, etiqueta }) => (
              <InputForModal
                key={campo}
                id={`tipo-${campo}`}
                etiqueta={etiqueta}
                valor={datos[campo]}
                onCambio={(v) => PATRON_DECIMAL.test(v) && cambiar(campo)(v)}
                inputMode="decimal"
                classNameInput="tabular-nums"
                error={errores[campo]}
              />
            ))}
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={confirmar}
            disabled={enviando || !valido}
            className="h-11 w-full gap-2 bg-slate-900 font-extrabold text-white hover:bg-slate-800 sm:w-auto"
          >
            {enviando ? (
              <Loader2 size={16} className="animate-spin" />
            ) : editando ? (
              "Guardar cambios"
            ) : (
              "Crear tipo"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Medida({ etiqueta, valor, unidad }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg bg-slate-50 px-3 py-2">
      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{etiqueta}</span>
      <span className="text-[15px] font-extrabold tabular-nums text-slate-900">
        {formatearNumero(valor, { decimalesMinimos: 0 })}{" "}
        <span className="text-xs font-semibold text-slate-500">{unidad}</span>
      </span>
    </div>
  );
}

function TarjetaTipo({ tipo, onEditar }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-c4/10">
            <Cylinder size={20} className="text-c3" />
          </div>
          <div className="min-w-0">
            <div className="text-[15px] font-extrabold leading-tight break-words text-slate-900">
              {tipo.NombreTipoBobina}
            </div>
            <div className="text-[12.5px] text-slate-500">
              {tipo.CantidadEnAlmacen} en almacén · {tipo.CantidadBobinas} registradas
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEditar(tipo)}
          aria-label={`Editar ${tipo.NombreTipoBobina}`}
          className="h-9 w-9 shrink-0 text-slate-400 hover:bg-c4/10 hover:text-c3"
        >
          <Pencil size={16} strokeWidth={2.25} />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Medida etiqueta="Diámetro" valor={tipo.DiametroMm} unidad="mm" />
        <Medida etiqueta="Formato" valor={tipo.Formato} unidad="mm" />
        <Medida etiqueta="Tara" valor={tipo.TaraKg} unidad="kg" />
      </div>
    </div>
  );
}

export default function TiposBobinaPapel() {
  const [tipos, setTipos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [dialogo, setDialogo] = useState({ abierto: false, tipo: null });

  const cargar = async () => {
    setCargando(true);
    setError("");
    try {
      setTipos(await listarTiposBobinaPapel());
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const alGuardar = (guardado, editando) => {
    setDialogo({ abierto: false, tipo: null });
    toast.success(
      editando
        ? `Tipo ${guardado.NombreTipoBobina} actualizado`
        : `Tipo ${guardado.NombreTipoBobina} creado`,
    );
    cargar();
  };

  return (
    <div className="contenido-con-sidebar flex min-h-screen flex-col bg-slate-50 pt-20 font-sans text-slate-900 md:pt-0">
      <Toaster richColors position="top-center" />
      <Header
        volver="/admin/inicio"
        titulo="Administración"
        subtitulo="Tipos de bobina papel"
        contador={tipos ? { valor: tipos.length, singular: "tipo", plural: "tipos" } : null}
        accion={{
          texto: "Nuevo tipo",
          icono: Plus,
          onClick: () => setDialogo({ abierto: true, tipo: null }),
        }}
      />

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-6 sm:px-6">
        {cargando && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
        )}

        {!cargando && error && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-6 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-slate-200">
            {error}
            <Button
              variant="outline"
              onClick={cargar}
              className="h-9 gap-1.5 border-red-300 font-bold text-red-600 hover:bg-red-50"
            >
              <RefreshCcw size={14} strokeWidth={2.5} />
              Reintentar
            </Button>
          </div>
        )}

        {!cargando && !error && tipos?.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-400 shadow-sm ring-1 ring-slate-200">
            Todavía no hay tipos de bobina papel.
          </div>
        )}

        {!cargando && !error && tipos?.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tipos.map((tipo) => (
              <TarjetaTipo
                key={tipo.IdTipoBobina}
                tipo={tipo}
                onEditar={(t) => setDialogo({ abierto: true, tipo: t })}
              />
            ))}
          </div>
        )}
      </main>

      <DialogoTipo
        abierto={dialogo.abierto}
        tipo={dialogo.tipo}
        onCerrar={() => setDialogo({ abierto: false, tipo: null })}
        onGuardado={alGuardar}
      />
    </div>
  );
}
