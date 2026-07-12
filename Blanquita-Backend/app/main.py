from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.Routes.UsuarioRouter import UsuarioRouter
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
    
app.include_router(UsuarioRouter)