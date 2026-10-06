import re

def EsCantidadValida(CantidadIngreso: int, Limite: int) -> bool:
    if CantidadIngreso > Limite: return  False
    return True


def ValidarTexto(minLengthText:int,maxLengthText:int,texto:str)->bool:
    if not isinstance(texto,str):
        return False
    else:
        l=len(texto)
        if l<minLengthText or l>maxLengthText: return False
    if not ValidarCaracteres(texto): return False

    return True

def ValidarFormularioUsuario(texto:str)->bool:
    patron=r"^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2,15}$"
    if re.fullmatch(patron,texto): return True
    return False

REGLA_CARACTERES_OBSERVACION='solo con letras, números, espacios y . , ; : ( ) " / # -'

def ValidarCaracteres(texto:str)->bool:
    patron=r'^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,;:()"/#-]+$'
    if re.fullmatch(patron,texto): return True
    return False
