import { RutasNavBar, PREFIJO_POR_ROL } from "@/constants/NavBarRoutes";
import { Icon } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

function IconoItem({ item }) {
  if (item.esIconoLab) {
    return <Icon iconNode={item.icono} size={18} />;
  }
  const IconoComp = item.icono;
  return <IconoComp size={18} />;
}

function ItemNav({ item, basePath }) {
  const rutaCompleta = `${basePath}/${item.ruta}`;

  if (item.subrutas) {
    return (
      <NavigationMenuItem>
        <NavigationMenuTrigger className="bg-transparent text-white hover:!bg-[#20A7DB] focus:!bg-[#20A7DB] data-[state=open]:!bg-[#20A7DB]">
          <span className="flex items-center gap-2">
            <IconoItem item={item} />
            {item.titulo}
          </span>
        </NavigationMenuTrigger>
        <NavigationMenuContent>
          <ul className="grid gap-1 p-2 min-w-[180px]">
            {item.subrutas.map((sub) => (
              <li key={sub.ruta}>
                <NavigationMenuLink
                  href={`/${rutaCompleta}/${sub.ruta}`}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:!bg-[#20A7DB] hover:!text-white"
                >
                  <IconoItem item={sub} />
                  {sub.titulo}
                </NavigationMenuLink>
              </li>
            ))}
          </ul>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem>
      <NavigationMenuLink
        href={`/${rutaCompleta}`}
        className="flex items-center gap-2 px-3 py-2 text-lg text-white hover:!bg-[#20A7DB] focus:!bg-[#20A7DB]"
      >
        <IconoItem item={item} />
        {item.titulo}
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
}

export default function NavBar({ idRol  }) {
  const prefijo = PREFIJO_POR_ROL[idRol];

  return (
    <nav
      className="fixed top-0 left-0 z-30 flex flex-row items-center justify-center w-full px-4 h-30 text-white transition-all duration-300 ease-in-out"
      style={{
        backgroundColor: "#62C1E5",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        boxShadow: "0 4px 20px #1c96c533",
        borderBottom: "2px solid #A0D9EF",
      }}
    >
      <img
        src="/LogoBlanquita.webp"
        alt="Papel Blanquita"
        className="h-25 w-auto transition-[filter] duration-300 ease-in-out"
        style={{ filter: "drop-shadow(0 4px 12px rgba(255,255,255,.3))" }}
      />

      <NavigationMenu>
        <NavigationMenuList>
          {RutasNavBar.map((item) => (
            <ItemNav key={item.ruta} item={item} basePath={prefijo} />
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
}