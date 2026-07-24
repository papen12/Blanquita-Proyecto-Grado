from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.Routes.Usuario.UsuarioRouter import UsuarioRouter


from app.Routes.BobinaPapel.BobinaPapelRouter import BobinaPapelRouter
from app.Routes.BobinaPapel.InventarioRouter import InventarioBobinaPapelRouter
from app.Routes.BobinaPapel.ProduccionRouter import ProduccionBobinaPapelRouter


from app.Routes.Pallet.PalletRouter import PalletRouter
from app.Routes.Pallet.ProducionRouter import ProduccionPalletRouter
from app.Routes.Pallet.InventarioRouter import InventarioPalletRouter


from app.Routes.Empaque.EmpaqueBobinaRouter import EmpaqueBobinaRouter
from app.Routes.Empaque.EmpaqueBolsaRouter import EmpaqueBolsaRouter


from app.Routes.BobinaServilleta.BobinaServilletaRouter import BobinaServilletaRouter
from app.Routes.BobinaServilleta.ProduccionRouter import ProduccionBobinaServilletaRouter
from app.Routes.BobinaServilleta.InventarioRouter import InventarioBobinaServilletaRouter

from app.Routes.InventarioFinal.ProductoFinal import ProductoFinalRouter


app=FastAPI(debug=True
            ,title="Backend Blanquita"
            ,version="1.0.0"
            ,redirect_slashes=True
            ,docs_url="/documentacion")
origins=[
    "*"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def Servidor():
    return{
        "Servidor":"El servidor dice hola",
        "Documentación en:":" http://127.0.0.1:8000/documentacion"
    }


#ROUTERS USUARIO
app.include_router(UsuarioRouter)




#ROUTERS BOBINA PAPEL
app.include_router(BobinaPapelRouter)
app.include_router(InventarioBobinaPapelRouter)
app.include_router(ProduccionBobinaPapelRouter)



#ROUTERS PALLET
app.include_router(PalletRouter)
app.include_router(ProduccionPalletRouter)
app.include_router(InventarioPalletRouter)




#ROUTERS BOBINA SERVILLETA
app.include_router(BobinaServilletaRouter)
app.include_router(ProduccionBobinaServilletaRouter)
app.include_router(InventarioBobinaServilletaRouter)


#ROUTERS EMPAQUE BOBINA / BOLSA
app.include_router(EmpaqueBobinaRouter)
app.include_router(EmpaqueBolsaRouter)

#ROUTERS INVENTARIO PRODUCTO FINAL
app.include_router(ProductoFinalRouter)
