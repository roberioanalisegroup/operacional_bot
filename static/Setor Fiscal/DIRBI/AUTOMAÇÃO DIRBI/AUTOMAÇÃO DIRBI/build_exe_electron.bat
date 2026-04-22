@echo off
echo ========================================
echo Gerador de Executavel - Electron
echo Automação SPED Contribuições
echo ========================================
echo.

REM Verifica se Node.js está instalado
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Node.js nao encontrado!
    echo.
    echo Por favor, instale o Node.js de: https://nodejs.org/
    echo Ou use a versao HTML diretamente no navegador.
    echo.
    pause
    exit /b 1
)

echo [1/4] Verificando Node.js...
node --version
echo.

echo [2/4] Instalando dependencias do Electron...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Falha ao instalar dependencias
    pause
    exit /b 1
)

echo.
echo [3/4] Construindo executavel...
call npm run build-win
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: Falha ao construir executavel
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCESSO!
echo ========================================
echo.
echo Executavel criado em: dist\
echo.
echo Voce encontrara dois arquivos:
echo - Automação SPED Setup X.X.X.exe (instalador)
echo - Automação SPED X.X.X.exe (portable - nao precisa instalar)
echo.
echo O arquivo PORTABLE pode ser copiado e executado
echo em qualquer computador Windows sem instalacao!
echo.
pause

