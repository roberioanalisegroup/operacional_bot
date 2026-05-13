@echo off
echo Gerando executavel automaticamente...
echo.

REM Cria pasta temporária
set TEMP_DIR=%CD%\temp_build
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
mkdir "%TEMP_DIR%" 2>nul

REM Verifica se Node.js esta instalado
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Node.js encontrado. Usando versao instalada...
    set USE_NODE=1
    goto :build
)

echo Baixando Node.js portable (nao sera instalado)...
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-win-x64.zip' -OutFile '%TEMP_DIR%\node.zip'}" 2>nul

if not exist "%TEMP_DIR%\node.zip" (
    echo ERRO: Nao foi possivel baixar Node.js.
    echo Use a versao HTML (AutomacaoSPED.html) que funciona sem precisar de .exe
    pause
    exit /b 1
)

echo Extraindo Node.js...
powershell -Command "Expand-Archive -Path '%TEMP_DIR%\node.zip' -DestinationPath '%TEMP_DIR%' -Force" 2>nul

set NODE_PATH=%TEMP_DIR%\node-v20.11.0-win-x64
set PATH=%NODE_PATH%;%NODE_PATH%\node_modules\.bin;%PATH%

:build
echo Instalando dependencias...
if defined USE_NODE (
    call npm install electron electron-builder --save-dev --silent 2>nul
) else (
    "%NODE_PATH%\npm.cmd" install electron electron-builder --save-dev --silent 2>nul
)

echo Gerando executavel...
if defined USE_NODE (
    call npm run build-win 2>nul
) else (
    "%NODE_PATH%\npm.cmd" run build-win 2>nul
)

echo Limpando arquivos temporarios...
if exist "%TEMP_DIR%" (
    timeout /t 1 >nul
    rmdir /s /q "%TEMP_DIR%" 2>nul
)

if exist "dist\*.exe" (
    echo.
    echo SUCESSO! Executavel criado em: dist\
    dir /b dist\*.exe
) else (
    echo.
    echo AVISO: Executavel nao foi gerado.
    echo Use a versao HTML (AutomacaoSPED.html) que funciona perfeitamente.
)

pause

