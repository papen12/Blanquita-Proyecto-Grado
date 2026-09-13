import { Icon, ArrowRight } from "lucide-react";
import { RutasReportes } from "@/constants/NavBarRoutes";
import { PREFIJO_POR_ROL } from "@/constants/Values";

function IconoRuta({ item, size = 20, className }) {
  if (item.esIconoLab) {
    return <Icon iconNode={item.icono} size={size} className={className} />;
  }
  const Comp = item.icono;
  return <Comp size={size} className={className} />;
}

function TileReporte({ seccion, sub, href }) {
  return (
    <a
      href={href}
      className="group flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-c4/10">
        <IconoRuta item={sub} size={20} className="text-c3" />
      </div>

      <div className="min-w-0">
        <div className="text-[15px] font-extrabold leading-tight text-slate-900 break-words">
          {sub.titulo}
        </div>
        <p className="mt-1 text-[13px] leading-snug text-slate-500">
          {seccion.titulo}
        </p>
      </div>

      <div className="mt-auto flex items-center gap-1 text-xs font-bold text-c3">
        Ver reporte
        <ArrowRight
          size={14}
          strokeWidth={2.75}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </a>
  );
}

export default function InicioReportes({ usuario }) {
  const prefijo = PREFIJO_POR_ROL[usuario?.IdRol] ?? "encargado";
  const secciones = RutasReportes.filter((item) => item.subrutas);

  return (
    <div className="contenido-con-sidebar mt-20 flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 md:mt-0">
      <header className="bg-gradient-to-r from-c3 to-c4 px-5 py-5 text-white sm:px-7">
        <div className="mx-auto w-full max-w-5xl">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
            Reportes
          </div>
          <div className="mt-0.5 text-xl font-extrabold">
            ¿Qué reporte necesitas?
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-6 sm:px-6">
        {secciones.map((seccion) => (
          <section key={seccion.ruta} className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <IconoRuta item={seccion} size={18} className="text-c3" />
              <span className="text-base font-extrabold text-slate-900">
                {seccion.titulo}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {seccion.subrutas.map((sub) => (
                <TileReporte
                  key={sub.ruta}
                  seccion={seccion}
                  sub={sub}
                  href={`/${prefijo}/reportes/${seccion.ruta}/${sub.ruta}`}
                />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
