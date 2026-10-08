import { useState } from "react";
import { toast } from "sonner";
//#region src/hooks/useDescarga.js
function useDescarga(descargar, exito) {
	const [descargando, setDescargando] = useState(false);
	const iniciar = async () => {
		setDescargando(true);
		try {
			await descargar();
			if (exito) toast.success(exito);
		} catch (e) {
			toast.error(e.message);
		} finally {
			setDescargando(false);
		}
	};
	return {
		descargando,
		iniciar
	};
}
//#endregion
export { useDescarga as t };
