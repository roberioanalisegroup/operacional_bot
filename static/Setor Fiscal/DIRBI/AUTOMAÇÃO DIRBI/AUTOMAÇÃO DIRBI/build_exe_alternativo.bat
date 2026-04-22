@echo off
REM Script alternativo usando o arquivo .spec para maior controle
echo ========================================
echo Gerador de Executavel - Automacao SPED
echo (Usando arquivo .spec)
echo ========================================
echo.

REM Detecta qual comando Python usar
set PYTHON_CMD=
set PIP_CMD=

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

python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set PYTHON_CMD=python
    set PIP_CMD=python -m pip
    goto :found_python
)

py --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set PYTHON_CMD=py
    set PIP_CMD=py -m pip
    goto :found_python
)

echo ERRO: Python nao encontrado!
pause
exit /b 1

:found_python
echo Python encontrado: %PYTHON_CMD%
echo.

echo [1/2] Instalando dependencias...
%PIP_CMD% install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    pip install -r requirements.txt
)
%PIP_CMD% install pyinstaller
if %ERRORLEVEL% NEQ 0 (
    pip install pyinstaller
)

echo.
echo [2/2] Criando executavel usando AutomacaoSPED.spec...
%PYTHON_CMD% -m PyInstaller --clean --noconfirm AutomacaoSPED.spec
if %ERRORLEVEL% NEQ 0 (
    pyinstaller --clean --noconfirm AutomacaoSPED.spec
    if %ERRORLEVEL% NEQ 0 (
        echo.
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
echo Este executavel e completamente independente!
echo.
pause

