import { useEffect, useState } from "react";
import { toast } from "sonner";
//#region src/hooks/useOpciones.js
function useOpciones(cargar) {
	const [opciones, setOpciones] = useState([]);
	useEffect(() => {
		cargar().then(setOpciones).catch((e) => toast.error(e.message));
	}, []);
	return opciones;
}
//#endregion
export { useOpciones as t };
