import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import EscanerQR from "@/components/layout/Qr/Escanerqr";
import { BottomBarRoutes } from "@/constants/BottomBarOptions";
import { PREFIJO_POR_ROL } from "@/constants/Roles";
import { resolverRutaQR } from "@/utils/QR";

function normalizar(ruta) {
  if (typeof ruta !== "string" || ruta === "") return "/";
  if (ruta === "/") return "/";
  return ruta.replace(/\/+$/, "");
}

function OpcionNav({ opcion, activa }) {
  const Icono = opcion.icono;

  const claseEnlace = activa
    ? "flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors duration-200 text-c3"
    : "flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors duration-200 text-neutral-400 hover:text-c4";

  const claseTexto = activa
    ? "font-sans text-[11px] font-semibold"
    : "font-sans text-[11px] font-medium";

  return (
    <a href={opcion.ruta} className={claseEnlace}>
      <Icono
        className="h-6 w-6"
        strokeWidth={activa ? 2.4 : 1.8}
        fill={activa ? "currentColor" : "none"}
        fillOpacity={activa ? 0.15 : 0}
      />
      <span className={claseTexto}>{opcion.titulo}</span>
    </a>
  );
}

export default function BottomBar({ idRol, subRuta }) {
  const rutaBase = PREFIJO_POR_ROL[idRol];

  const [rutaActual, setRutaActual] = useState("");
  const [escaneando, setEscaneando] = useState(false);
  const [avisoQR, setAvisoQR] = useState("");

  useEffect(() => {
    setRutaActual(normalizar(window.location.pathname));
  }, []);

  useEffect(() => {
    if (!avisoQR) return;
    const id = setTimeout(() => setAvisoQR(""), 4000);
    return () => clearTimeout(id);
  }, [avisoQR]);

  const alDetectar = (valor) => {
    const { ruta, error } = resolverRutaQR(valor, window.location.origin);

    setEscaneando(false);

    if (error) {
      setAvisoQR(error);
      return;
    }

    window.location.href = ruta;
  };

  if (!rutaBase) {
    console.error("BottomBar: idRol no válido ->", idRol);
    return null;
  }

  const rutas = new BottomBarRoutes(rutaBase, subRuta);
  const opciones = rutas.opciones;

  const mitad = Math.ceil(opciones.length / 2);
  const izquierda = opciones.slice(0, mitad);
  const derecha = opciones.slice(mitad);

  const claseBarra =
    "rounded-t-3xl border-t border-c2/60 bg-white/95 shadow-[0_-6px_24px_-12px_rgba(28,150,197,0.45)] backdrop-blur";

  const claseBoton =
    "absolute -top-6 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-linear-to-br from-c4 to-c3 text-white shadow-lg shadow-c3/40 transition-transform duration-200 active:scale-95";

  return (
    <>
      <div className="h-20" />

      <nav className="fixed inset-x-0 bottom-0 z-40">
        <div className="relative mx-auto max-w-2xl">
          {avisoQR ? (
            <div className="absolute bottom-full left-1/2 mb-3 w-[min(90vw,24rem)] -translate-x-1/2 rounded-2xl bg-neutral-900/90 px-4 py-3 text-center backdrop-blur">
              <p className="font-sans text-sm font-medium text-white">{avisoQR}</p>
            </div>
          ) : null}

          <div className={claseBarra}>
            <div className="flex items-stretch px-2 pb-[env(safe-area-inset-bottom)]">
              <div className="flex flex-1">
                {izquierda.map((opcion) => (
                  <OpcionNav
                    key={opcion.ruta}
                    opcion={opcion}
                    activa={rutaActual === normalizar(opcion.ruta)}
                  />
                ))}
              </div>

              <div className="w-20 shrink-0" />

              <div className="flex flex-1">
                {derecha.map((opcion) => (
                  <OpcionNav
                    key={opcion.ruta}
                    opcion={opcion}
                    activa={rutaActual === normalizar(opcion.ruta)}
                  />
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setEscaneando(true)}
            aria-label="Escanear código QR"
            className={claseBoton}
          >
            <Camera className="h-7 w-7" strokeWidth={2} />
          </button>
        </div>
      </nav>

      <EscanerQR
        abierto={escaneando}
        onCerrar={() => setEscaneando(false)}
        onDetectar={alDetectar}
      />
    </>
  );
}