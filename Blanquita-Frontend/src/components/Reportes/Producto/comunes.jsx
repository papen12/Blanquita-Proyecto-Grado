import { Fragment } from "react";
import { RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatearNumero } from "@/utils/numeros";

export function CantidadUnidad({ valor, unidad }) {
  return (
    <>
      <strong className="text-slate-900">{formatearNumero(valor, { decimales: 0 })}</strong>{" "}
      <span className="text-slate-500">{unidad}</span>
    </>
  );
}

export function TarjetaFila({ nombre, detalle, children }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-[15px] font-bold text-slate-900">{nombre}</span>
        <span className="text-[12.5px] text-slate-500">{detalle}</span>
      </div>
      {children && (
        <span className="shrink-0 text-right text-[15px] tabular-nums">{children}</span>
      )}
    </div>
  );
}

export function TarjetaSeccion({ titulo, extra, className, children }) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="text-base font-extrabold text-slate-900">{titulo}</div>
        {extra && <div className="text-[15px] tabular-nums">{extra}</div>}
      </div>
      {children}
    </section>
  );
}

export function EsqueletoCarga() {
  return (
    <div className="flex flex-col gap-2 p-5">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

export function ErrorCarga({ error, recargar }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 p-6 text-sm font-semibold text-red-600">
      {error}
      <Button
        variant="outline"
        onClick={recargar}
        className="h-9 gap-1.5 border-red-300 font-bold text-red-600 hover:bg-red-50"
      >
        <RefreshCcw size={14} strokeWidth={2.5} />
        Reintentar
      </Button>
    </div>
  );
}

export function TablaFilas({ columnas, filas, clave, tarjeta }) {
  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columnas.map((columna) => (
                <TableHead key={columna.titulo} className={columna.claseTitulo}>
                  {columna.titulo}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filas.map((fila) => (
              <TableRow key={clave(fila)}>
                {columnas.map((columna) => (
                  <TableCell key={columna.titulo} className={columna.clase}>
                    {columna.valor(fila)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 p-4 md:hidden">
        {filas.map((fila) => (
          <Fragment key={clave(fila)}>{tarjeta(fila)}</Fragment>
        ))}
      </div>
    </>
  );
}

export function SeccionResumenLineas({
  reporte,
  titulo,
  columnas,
  tarjeta,
  pie,
  mensajeVacio,
}) {
  const { catalogo, cargando, error, recargar } = reporte;
  const listo = !cargando && !error;
  const lineas = catalogo?.Lineas;

  return (
    <TarjetaSeccion titulo={titulo} className="mt-6">
      {cargando && <EsqueletoCarga />}

      {!cargando && error && <ErrorCarga error={error} recargar={recargar} />}

      {listo && !lineas && (
        <div className="p-10 text-center text-sm text-slate-400">{mensajeVacio}</div>
      )}

      {listo && lineas && (
        <>
          <TablaFilas
            columnas={columnas}
            filas={lineas}
            clave={(linea) => linea.IdProducto}
            tarjeta={tarjeta}
          />

          {pie && (
            <div className="border-t border-slate-100 px-5 py-3.5 text-[12.5px] font-semibold text-slate-500">
              {pie}
            </div>
          )}
        </>
      )}
    </TarjetaSeccion>
  );
}
