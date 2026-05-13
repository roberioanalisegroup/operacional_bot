"""
Script para verificar se todas as dependências necessárias estão instaladas
antes de gerar o executável
"""

import sys

def verificar_dependencias():
    """Verifica se todas as dependências estão instaladas"""
    dependencias = {
        'openpyxl': 'openpyxl',
        'tkinter': 'tkinter',
        'pyinstaller': 'PyInstaller'
    }
    
    faltando = []
    
    for nome, modulo in dependencias.items():
        try:
            if nome == 'pyinstaller':
                import PyInstaller
            else:
                __import__(modulo)
            print(f"✓ {nome} - OK")
        except ImportError:
            print(f"✗ {nome} - FALTANDO")
            faltando.append(nome)
    
    if faltando:
        print(f"\nERRO: As seguintes dependências estão faltando: {', '.join(faltando)}")
        print("Execute: pip install -r requirements.txt")
        return False
    else:
        print("\n✓ Todas as dependências estão instaladas!")
        return True

if __name__ == "__main__":
    print("Verificando dependências...\n")
    if verificar_dependencias():
        sys.exit(0)
    else:
        sys.exit(1)

