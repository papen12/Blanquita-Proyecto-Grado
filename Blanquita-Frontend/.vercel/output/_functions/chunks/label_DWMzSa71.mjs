import "react";
import { jsx } from "react/jsx-runtime";
import { cn } from "cn";
//#region src/components/ui/label.jsx
function Label({ className, ...props }) {
	return /* @__PURE__ */ jsx("label", {
		"data-slot": "label",
		className: cn("flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", className),
		...props
	});
}
//#endregion
export { Label as t };
