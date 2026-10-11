import { useEffect, useState } from "react";
import { Check, Eye, EyeOff, Loader2, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import InputForModal from "@/components/layout/InputForModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CLAVE_MIN,
  CLAVE_MAX,
  MOTIVO_CANCELACION_MIN as MOTIVO_MIN,
  MOTIVO_CANCELACION_MAX as MOTIVO_MAX,
} from "@/constants/Values";
import {
  EstadosUsuario,
  TransicionesEstadoUsuario,
  ID_ESTADO_USUARIO_SUSPENDIDO,
} from "@/constants/Estados";
import { limpiarObservacion } from "@/utils/validators";
import {
  cambiarEstadoUsuario,
  editarUsuario,
  restablecerClave,
} from "@/services/Usuario/Admin";
import { PILDORA_FILTRO } from "@/constants/Acentos";

export const ETIQUETA = "text-xs font-bold uppercase tracking-wide text-slate-600";
const SIMBOLOS = "!@#$%^&*()-_=+[]{}|;:',.<>?/`~\"\\";

export const PATRON_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2,15}$/;
export const PATRON_CELULAR = /^[67]\d{7}$/;

export const soloLetras = (texto) => texto.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "").slice(0, 15);
export const soloDigitos = (texto, max) => texto.replace(/\D/g, "").slice(0, max);

export const CAMPOS_NOMBRE = [
  { campo: "PrimerNombre", etiqueta: "Primer nombre" },
  { campo: "SegundoNombre", etiqueta: "Segundo nombre", opcional: true },
  { campo: "ApellidoPaterno", etiqueta: "Apellido paterno" },
  { campo: "ApellidoMaterno", etiqueta: "Apellido materno", opcional: true },
];


export const reglasClave = (clave) => [
  {
    texto: `Entre ${CLAVE_MIN} y ${CLAVE_MAX} caracteres`,
    ok: clave.length >= CLAVE_MIN && clave.length <= CLAVE_MAX,
  },
  { texto: "Una letra mayúscula", ok: /[A-ZÁÉÍÓÚÜÑ]/.test(clave) },
  { texto: "Un número", ok: /\d/.test(clave) },
  { texto: "Un símbolo", ok: [...clave].some((ch) => SIMBOLOS.includes(ch)) },
];

export const claveValida = (clave) => reglasClave(clave).every((regla) => regla.ok);

export function ErrorDialogo({ mensaje }) {
  return (
    <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600">
      {mensaje}
    </div>
  );
}

export function BotonEnviar({ enviando, deshabilitado, onClick, className, children }) {
  return (
    <Button
      onClick={onClick}
      disabled={enviando || deshabilitado}
      className={cn("h-11 w-full gap-2 font-extrabold text-white sm:w-auto", className)}
    >
      {enviando ? <Loader2 size={16} className="animate-spin" /> : children}
    </Button>
  );
}

function ResumenUsuario({ usuario }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-[15px] font-extrabold text-slate-900">{usuario.NombreCompleto}</div>
      <div className="text-[12.5px] text-slate-500">
        CI <span className="font-mono font-bold text-slate-700">{usuario.Ci}</span> ·{" "}
        {usuario.NombreRol} · {usuario.NombreEstadoUsuario}
      </div>
    </div>
  );
}

export function CamposClave({ clave, setClave, confirmacion, setConfirmacion, prefijoId }) {
  const [visible, setVisible] = useState(false);
  const reglas = reglasClave(clave);
  const noCoincide = confirmacion !== "" && confirmacion !== clave;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${prefijoId}-clave`} className={ETIQUETA}>
          Clave
        </Label>
        <div className="relative">
          <Input
            id={`${prefijoId}-clave`}
            type={visible ? "text" : "password"}
            value={clave}
            onChange={(e) => setClave(e.target.value.replace(/\s/g, ""))}
            maxLength={CLAVE_MAX}
            autoComplete="new-password"
            className="h-11 pr-11 font-mono"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Ocultar clave" : "Mostrar clave"}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-700"
          >
            {visible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-[12px] font-semibold">
          {reglas.map((regla) => (
            <li
              key={regla.texto}
              className={cn(
                "flex items-center gap-1.5",
                regla.ok ? "text-emerald-600" : "text-slate-400",
              )}
            >
              {regla.ok ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}
              {regla.texto}
            </li>
          ))}
        </ul>
      </div>

      <InputForModal
        id={`${prefijoId}-confirmacion`}
        etiqueta="Confirmar clave"
        type={visible ? "text" : "password"}
        valor={confirmacion}
        onCambio={(v) => setConfirmacion(v.replace(/\s/g, ""))}
        maxLength={CLAVE_MAX}
        autoComplete="new-password"
        classNameInput="font-mono"
        error={noCoincide ? "Las claves no coinciden" : ""}
      />
    </div>
  );
}

export function DialogoCambiarEstado({ usuario, onCerrar, onCambiado }) {
  const [idEstado, setIdEstado] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [confirmarSuspension, setConfirmarSuspension] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!usuario) return;
    setIdEstado(null);
    setMotivo("");
    setConfirmarSuspension(false);
    setError("");
  }, [usuario]);

  const destinos = usuario
    ? EstadosUsuario.filter((e) =>
        (TransicionesEstadoUsuario[usuario.IdEstadoUsuario] ?? []).includes(e.IdEstadoUsuario),
      )
    : [];
  const suspender = idEstado === ID_ESTADO_USUARIO_SUSPENDIDO;
  const largo = motivo.trim().length;
  const valido =
    idEstado !== null &&
    largo >= MOTIVO_MIN &&
    largo <= MOTIVO_MAX &&
    (!suspender || confirmarSuspension);

  const confirmar = async () => {
    setEnviando(true);
    setError("");
    try {
      const resultado = await cambiarEstadoUsuario(usuario.IdUsuario, idEstado, motivo);
      onCambiado(resultado);
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={Boolean(usuario)} onOpenChange={(open) => !open && !enviando && onCerrar()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar estado</DialogTitle>
        </DialogHeader>

        {usuario && (
          <div className="flex flex-col gap-4">
            <ResumenUsuario usuario={usuario} />

            <div className="flex flex-col gap-1.5">
              <Label className={ETIQUETA}>Nuevo estado</Label>
              <div className="flex flex-wrap gap-2">
                {destinos.map((estado) => (
                  <button
                    key={estado.IdEstadoUsuario}
                    type="button"
                    aria-pressed={idEstado === estado.IdEstadoUsuario}
                    onClick={() => {
                      setIdEstado(estado.IdEstadoUsuario);
                      setConfirmarSuspension(false);
                    }}
                    className={PILDORA_FILTRO}
                  >
                    {estado.NombreEstadoUsuario}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="motivo-estado" className={ETIQUETA}>
                Motivo
              </Label>
              <Textarea
                id="motivo-estado"
                value={motivo}
                onChange={(e) => setMotivo(limpiarObservacion(e.target.value))}
                placeholder="Ej. Licencia, fin de contrato..."
                className="min-h-20"
                maxLength={MOTIVO_MAX}
              />
              <span className="text-xs text-slate-500">
                {largo}/{MOTIVO_MAX} · mínimo {MOTIVO_MIN} caracteres
              </span>
            </div>

            {suspender && (
              <div className="flex flex-col gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <div className="flex items-start gap-2 text-sm font-semibold text-red-700">
                  <TriangleAlert size={18} className="mt-0.5 shrink-0" />
                  La suspensión es definitiva: el usuario no podrá volver a ingresar y su estado
                  ya no podrá cambiarse.
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-[13px] font-bold text-red-700">
                  <input
                    type="checkbox"
                    checked={confirmarSuspension}
                    onChange={(e) => setConfirmarSuspension(e.target.checked)}
                    className="h-4 w-4 accent-red-600"
                  />
                  Entiendo que no se puede deshacer
                </label>
              </div>
            )}

            {error && <ErrorDialogo mensaje={error} />}
          </div>
        )}

        <DialogFooter>
          <BotonEnviar
            onClick={confirmar}
            enviando={enviando}
            deshabilitado={!valido}
            className={
              suspender ? "bg-red-600 hover:bg-red-700" : "bg-slate-900 hover:bg-slate-800"
            }
          >
            {suspender ? "Suspender usuario" : "Cambiar estado"}
          </BotonEnviar>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const formularioEdicion = (usuario) => ({
  PrimerNombre: usuario?.PrimerNombre ?? "",
  SegundoNombre: usuario?.SegundoNombre ?? "",
  ApellidoPaterno: usuario?.ApellidoPaterno ?? "",
  ApellidoMaterno: usuario?.ApellidoMaterno ?? "",
  Celular: usuario?.Celular ?? "",
});

function erroresEdicion(datos) {
  const errores = {};
  for (const { campo, opcional } of CAMPOS_NOMBRE) {
    if (!datos[campo]) {
      if (!opcional) errores[campo] = "Requerido";
    } else if (!PATRON_NOMBRE.test(datos[campo])) {
      errores[campo] = "Entre 2 y 15 letras";
    }
  }
  if (datos.Celular && !PATRON_CELULAR.test(datos.Celular))
    errores.Celular = "8 dígitos, empieza con 6 o 7";
  return errores;
}

export function DialogoEditarUsuario({ usuario, onCerrar, onEditado }) {
  const [datos, setDatos] = useState(() => formularioEdicion(usuario));
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!usuario) return;
    setDatos(formularioEdicion(usuario));
    setError("");
  }, [usuario]);

  const cambiar = (campo) => (valor) => setDatos((previos) => ({ ...previos, [campo]: valor }));

  const original = formularioEdicion(usuario);
  const hayCambios = Object.keys(original).some((campo) => datos[campo] !== original[campo]);
  const errores = erroresEdicion(datos);
  const valido = hayCambios && Object.keys(errores).length === 0;

  const confirmar = async () => {
    setEnviando(true);
    setError("");
    try {
      const resultado = await editarUsuario(usuario.IdUsuario, datos);
      onEditado(resultado);
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={Boolean(usuario)} onOpenChange={(open) => !open && !enviando && onCerrar()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
        </DialogHeader>

        {usuario && (
          <div className="flex flex-col gap-4">
            <ResumenUsuario usuario={usuario} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {CAMPOS_NOMBRE.map(({ campo, etiqueta, opcional }) => (
                <InputForModal
                  key={campo}
                  id={`editar-${campo}`}
                  etiqueta={etiqueta}
                  opcional={opcional}
                  valor={datos[campo]}
                  onCambio={(v) => cambiar(campo)(soloLetras(v))}
                  error={errores[campo]}
                />
              ))}
              <InputForModal
                id="editar-Celular"
                etiqueta="Celular"
                opcional
                valor={datos.Celular}
                onCambio={(v) => cambiar("Celular")(soloDigitos(v, 8))}
                inputMode="numeric"
                classNameInput="font-mono"
                error={errores.Celular}
              />
            </div>

            {error && <ErrorDialogo mensaje={error} />}
          </div>
        )}

        <DialogFooter>
          <BotonEnviar
            onClick={confirmar}
            enviando={enviando}
            deshabilitado={!valido}
            className="bg-slate-900 hover:bg-slate-800"
          >
            Guardar cambios
          </BotonEnviar>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DialogoRestablecerClave({ usuario, onCerrar, onRestablecida }) {
  const [clave, setClave] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!usuario) return;
    setClave("");
    setConfirmacion("");
    setError("");
  }, [usuario]);

  const valido = claveValida(clave) && clave === confirmacion;

  const confirmar = async () => {
    setEnviando(true);
    setError("");
    try {
      const resultado = await restablecerClave(usuario.IdUsuario, clave);
      onRestablecida(resultado);
    } catch (e) {
      setError(e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={Boolean(usuario)} onOpenChange={(open) => !open && !enviando && onCerrar()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Restablecer clave</DialogTitle>
          <DialogDescription>
            Comunica la nueva clave al usuario de forma personal.
          </DialogDescription>
        </DialogHeader>

        {usuario && (
          <div className="flex flex-col gap-4">
            <ResumenUsuario usuario={usuario} />
            <CamposClave
              prefijoId="restablecer"
              clave={clave}
              setClave={setClave}
              confirmacion={confirmacion}
              setConfirmacion={setConfirmacion}
            />
            {error && <ErrorDialogo mensaje={error} />}
          </div>
        )}

        <DialogFooter>
          <BotonEnviar
            onClick={confirmar}
            enviando={enviando}
            deshabilitado={!valido}
            className="bg-slate-900 hover:bg-slate-800"
          >
            Restablecer clave
          </BotonEnviar>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
