import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import QrScanner from "qr-scanner";
import { BottomBarRoutes } from "@/constants/BottomBarOptions";
import { PREFIJO_POR_ROL } from "@/constants/Roles";

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
  const [error, setError] = useState("");
  const videoRef = useRef(null);

  useEffect(() => {
    setRutaActual(normalizar(window.location.pathname));
  }, []);

  useEffect(() => {
    if (!escaneando) return;

    const video = videoRef.current;
    if (!video) return;

    const scanner = new QrScanner(
      video,
      (resultado) => {
        const valor = resultado && resultado.data ? resultado.data : resultado;
        scanner.stop();
        setEscaneando(false);
        redirigir(valor);
      },
      {
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
        maxScansPerSecond: 5,
      }
    );

    scanner.start().catch(() => {
      setError("No se pudo acceder a la cámara del dispositivo.");
    });

    return () => {
      scanner.stop();
      scanner.destroy();
    };
  }, [escaneando]);

  const redirigir = (valor) => {
    if (!valor) return;

    if (valor.startsWith("/")) {
      window.location.href = valor;
      return;
    }

    try {
      const url = new URL(valor);
      if (url.origin === window.location.origin) {
        window.location.href = url.pathname + url.search;
        return;
      }
      setError("El código escaneado no pertenece al sistema.");
    } catch (e) {
      window.location.href = "/scan/" + valor;
    }
  };

  const abrirCamara = () => {
    setError("");
    setEscaneando(true);
  };

  const cerrarCamara = () => {
    setEscaneando(false);
  };

  const claseBarra =
    "rounded-t-3xl border-t border-c2/60 bg-white/95 shadow-[0_-6px_24px_-12px_rgba(28,150,197,0.45)] backdrop-blur";

  const claseBoton =
    "absolute -top-6 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border-4 border-white bg-linear-to-br from-c4 to-c3 text-white shadow-lg shadow-c3/40 transition-transform duration-200 active:scale-95";

  if (!rutaBase) {
    console.error("BottomBar: idRol no válido ->", idRol);
    return null;
  }

  const rutas = new BottomBarRoutes(rutaBase, subRuta);
  const opciones = rutas.opciones;

  const mitad = Math.ceil(opciones.length / 2);
  const izquierda = opciones.slice(0, mitad);
  const derecha = opciones.slice(mitad);

  return (
    <>
      <div className="h-20" />

      <nav className="fixed inset-x-0 bottom-0 z-40">
        <div className="relative mx-auto max-w-2xl">
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
            onClick={abrirCamara}
            aria-label="Escanear código QR"
            className={claseBoton}
          >
            <Camera className="h-7 w-7" strokeWidth={2} />
          </button>
        </div>
      </nav>

      {escaneando ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="flex items-center justify-between px-4 py-4">
            <span className="font-sans text-sm font-semibold text-white">
              Escanear código QR
            </span>
            <button
              type="button"
              onClick={cerrarCamara}
              aria-label="Cerrar cámara"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline
              muted
            />
          </div>

          <div className="px-6 py-6 text-center">
            {error ? (
              <p className="font-sans text-sm font-medium text-serv1">{error}</p>
            ) : (
              <p className="font-sans text-sm text-white/70">
                Apunta la cámara al código QR del material
              </p>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}