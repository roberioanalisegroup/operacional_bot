@echo off
echo ========================================
echo Gerador de Executavel - Automacao SPED
echo ========================================
echo.

REM Detecta qual comando Python usar
set PYTHON_CMD=
set PIP_CMD=

REM Tenta diferentes formas de chamar Python/pip
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set PYTHON_CMD=python
    set PIP_CMD=python -m pip
    goto :found_python
)

where py >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set PYTHON_CMD=py
    set PIP_CMD=py -m pip
    goto :found_python
)

where python3 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set PYTHON_CMD=python3
    set PIP_CMD=python3 -m pip
    goto :found_python
)

REM Se não encontrou, tenta usar python diretamente
python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set PYTHON_CMD=python
    set PIP_CMD=python -m pip
    goto :found_python
)

REM Se ainda não encontrou, tenta py
py --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set PYTHON_CMD=py
    set PIP_CMD=py -m pip
    goto :found_python
)

echo ERRO: Python nao encontrado!
echo.
echo Por favor, instale o Python de:
echo https://www.python.org/downloads/
echo.
echo Ou adicione o Python ao PATH do sistema.
echo.
pause
exit /b 1

:found_python
echo Python encontrado: %PYTHON_CMD%
echo.

echo [1/3] Instalando dependencias...
%PIP_CMD% install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERRO: Falha ao instalar dependencias
    echo Tentando com pip diretamente...
    pip install -r requirements.txt
    if %ERRORLEVEL% NEQ 0 (
        echo ERRO: Falha ao instalar dependencias
        pause
        exit /b 1
    )
)

echo.
echo [2/3] Instalando PyInstaller...
%PIP_CMD% install pyinstaller
if %ERRORLEVEL% NEQ 0 (
    echo Tentando com pip diretamente...
    pip install pyinstaller
    if %ERRORLEVEL% NEQ 0 (
        echo ERRO: Falha ao instalar PyInstaller
        pause
        exit /b 1
    )
)

echo.
echo [3/3] Criando executavel (arquivo unico com todas as dependencias)...
echo.
echo Incluindo todas as dependencias necessarias...
echo - Python runtime
echo - openpyxl (completo)
echo - tkinter (completo)
echo - Todas as bibliotecas necessarias
echo.

%PYTHON_CMD% -m PyInstaller --onefile --windowed --name "AutomacaoSPED" --icon=NONE --clean --noconfirm --hidden-import=openpyxl --hidden-import=openpyxl.cell --hidden-import=openpyxl.workbook --hidden-import=openpyxl.worksheet --hidden-import=openpyxl.styles --hidden-import=openpyxl.xml --hidden-import=tkinter --hidden-import=tkinter.ttk --collect-all openpyxl automacao_sped.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Tentando com pyinstaller diretamente...
    pyinstaller --onefile --windowed --name "AutomacaoSPED" --icon=NONE --clean --noconfirm --hidden-import=openpyxl --hidden-import=openpyxl.cell --hidden-import=openpyxl.workbook --hidden-import=openpyxl.worksheet --hidden-import=openpyxl.styles --hidden-import=openpyxl.xml --hidden-import=tkinter --hidden-import=tkinter.ttk --collect-all openpyxl automacao_sped.py
    if %ERRORLEVEL% NEQ 0 (
        echo ERRO: Falha ao criar executavel
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo SUCESSO!
echo ========================================
echo.
echo Executavel criado em: dist\AutomacaoSPED.exe
echo.
echo IMPORTANTE:
echo - Este e um arquivo UNICO e INDEPENDENTE
echo - Contem TODAS as dependencias necessarias
echo - NAO e necessario instalar Python no computador de destino
echo - NAO e necessario instalar nenhuma biblioteca
echo - Pode ser copiado e executado em qualquer Windows
echo.
echo Tamanho aproximado: Verifique o arquivo em dist\
echo.
pause

