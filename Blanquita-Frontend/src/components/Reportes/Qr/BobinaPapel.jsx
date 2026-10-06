import { PaginaReporte } from "@/components/Reportes/PaginaReporte";
import { TarjetaQr } from "./TarjetaQr";

export default function QrBobinaPapel({ usuario }) {
  return (
    <PaginaReporte usuario={usuario} titulo="Códigos QR" subtitulo="Bobina Papel">
      <p className="mb-5 text-sm text-slate-500">
        Imprime cada cartel y colócalo en su área de la planta. Al escanearlo desde la
        aplicación se abre esa vista directamente.
      </p>

      <div className="flex flex-wrap gap-5">
        <TarjetaQr
          titulo="Inventario"
          descripcion="Abre el inventario de bobinas de papel"
          ruta="bobina-papel/inventario"
        />
      </div>
    </PaginaReporte>
  );
}
