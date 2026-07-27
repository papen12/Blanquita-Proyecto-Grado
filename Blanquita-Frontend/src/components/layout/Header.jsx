export default function Header({titulo,subtitulo}){
    return(
        <header className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-c3 to-c4 px-5 py-4 text-white sm:px-7">
        <div className="flex flex-col gap-0.5">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
            {titulo}
          </div>
          <div className="text-xl font-extrabold">
            {subtitulo}
          </div>
        </div>
      </header>
    )
}