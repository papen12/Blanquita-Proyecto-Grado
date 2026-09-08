import { useState, useEffect } from "react";
import {
  UserRound,
  IdCard,
  Phone,
  Mail,
  ShieldCheck,
  CalendarClock,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { obtenerPerfil } from "../../services/Usuario/Perfil";
import { dateFormatter } from "@/utils/dates";

const ESTADO_ESTILO = {
  1: "border-emerald-300 bg-emerald-50 text-emerald-700",
  2: "border-slate-300 bg-slate-100 text-slate-600",
  3: "border-red-300 bg-red-50 text-red-600",
};

function iniciales(primerNombre, apellidoPaterno) {
  const a = primerNombre?.trim()?.[0] ?? "";
  const b = apellidoPaterno?.trim()?.[0] ?? "";
  return (a + b).toUpperCase() || "?";
}

function formatearCelular(valor) {
  if (!valor) return "Sin registrar";
  const limpio = String(valor).replace(/\D/g, "");
  return limpio.length === 8
    ? limpio.replace(/(\d{4})(\d{4})/, "$1 $2")
    : String(valor);
}

async function copiar(texto, etiqueta) {
  if (!texto) return;
  try {
    await navigator.clipboard?.writeText(String(texto));
    toast.success(`${etiqueta} copiado`);
  } catch {
    toast.error("No se pudo copiar");
  }
}

function Campo({ icono: Icono, etiqueta, valor, copiable = false }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-c4/10 text-c3">
        <Icono size={17} strokeWidth={2.25} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
          {etiqueta}
        </div>
        <div className="flex items-center gap-2 break-words text-[15px] font-semibold text-slate-800">
          {valor}
          {copiable && valor && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copiar(valor, etiqueta)}
              className="h-6 w-6 shrink-0 text-slate-400 hover:text-c3"
            >
              <Copy size={13} strokeWidth={2.5} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function TarjetaPerfil({ titulo, children }) {
  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="border-b border-slate-100 px-5 py-3.5 text-sm font-extrabold text-slate-700">
        {titulo}
      </div>
      <div className="px-5 py-1">{children}</div>
    </section>
  );
}

function PerfilSkeleton() {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-center">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="w-full space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
      </section>

      {[0, 1].map((i) => (
        <section
          key={i}
          className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
        >
          <div className="border-b border-slate-100 px-5 py-3.5">
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="space-y-4 p-5">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </section>
      ))}
    </div>
  );
}

export default function Perfil() {
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    (async () => {
      setCargando(true);
      setError("");
      try {
        const data = await obtenerPerfil();
        if (activo) setPerfil(data);
      } catch (e) {
        if (activo) setError(e.message);
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, []);

  return (
    <div className="mt-20 md:mt-30 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-6 sm:px-6">
        {cargando && <PerfilSkeleton />}

        {!cargando && error && (
          <div className="rounded-xl bg-red-50 p-5 text-center text-sm font-semibold text-red-600">
            {error}
          </div>
        )}

        {!cargando && !error && perfil && (
          <div className="space-y-6">
            <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <div className="flex flex-col items-center gap-4 bg-gradient-to-br from-c3 to-c4 p-6 text-white sm:flex-row sm:text-left">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/15 text-2xl font-extrabold">
                  {iniciales(perfil.PrimerNombre, perfil.ApellidoPaterno)}
                </div>
                <div className="min-w-0">
                  <div className="text-xl font-extrabold leading-tight break-words">
                    {perfil.NombreCompleto}
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-2 text-sm text-white/85 sm:justify-start">
                    <IdCard size={15} strokeWidth={2.25} />
                    CI {perfil.Ci}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copiar(perfil.Ci, "CI")}
                      className="h-6 w-6 text-white/80 hover:bg-white/15 hover:text-white"
                    >
                      <Copy size={13} strokeWidth={2.5} />
                    </Button>
                  </div>
                  <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                    <Badge
                      variant="outline"
                      className="border-white/40 bg-white/10 font-bold text-white"
                    >
                      {perfil.NombreRol}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-bold",
                        ESTADO_ESTILO[perfil.IdEstadoUsuario] ??
                          "border-white/40 bg-white/10 text-white",
                      )}
                    >
                      {perfil.NombreEstadoUsuario}
                    </Badge>
                  </div>
                </div>
              </div>
            </section>

            <TarjetaPerfil titulo="Datos personales">
              <Campo
                icono={UserRound}
                etiqueta="Primer nombre"
                valor={perfil.PrimerNombre}
              />
              {perfil.SegundoNombre && (
                <>
                  <Separator />
                  <Campo
                    icono={UserRound}
                    etiqueta="Segundo nombre"
                    valor={perfil.SegundoNombre}
                  />
                </>
              )}
              <Separator />
              <Campo
                icono={UserRound}
                etiqueta="Apellido paterno"
                valor={perfil.ApellidoPaterno}
              />
              {perfil.ApellidoMaterno && (
                <>
                  <Separator />
                  <Campo
                    icono={UserRound}
                    etiqueta="Apellido materno"
                    valor={perfil.ApellidoMaterno}
                  />
                </>
              )}
            </TarjetaPerfil>

            <TarjetaPerfil titulo="Contacto">
              <Campo
                icono={Phone}
                etiqueta="Celular"
                valor={formatearCelular(perfil.Celular)}
                copiable={Boolean(perfil.Celular)}
              />
              <Separator />
              <Campo
                icono={Mail}
                etiqueta="Correo"
                valor={perfil.Correo ?? "Sin registrar"}
                copiable={Boolean(perfil.Correo)}
              />
            </TarjetaPerfil>

            <TarjetaPerfil titulo="Cuenta">
              <Campo
                icono={ShieldCheck}
                etiqueta="Rol"
                valor={perfil.NombreRol}
              />
              <Separator />
              <Campo
                icono={ShieldCheck}
                etiqueta="Estado"
                valor={perfil.NombreEstadoUsuario}
              />
              <Separator />
              <Campo
                icono={CalendarClock}
                etiqueta="Registrado el"
                valor={dateFormatter(perfil.FechaRegistro)}
              />
            </TarjetaPerfil>
          </div>
        )}
      </main>
    </div>
  );
}
