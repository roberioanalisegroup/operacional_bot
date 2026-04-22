@echo off
echo ========================================
echo Gerador Automatico de Executavel
echo Automação SPED - Sem Instalação
echo ========================================
echo.
echo Este script vai:
echo 1. Baixar ferramentas necessarias (temporariamente)
echo 2. Gerar o executavel .exe
echo 3. Limpar arquivos temporarios
echo.
echo Nao sera instalado nada permanentemente!
echo.
pause

REM Cria pasta temporária
set TEMP_DIR=%CD%\temp_build
if exist "%TEMP_DIR%" rmdir /s /q "%TEMP_DIR%"
mkdir "%TEMP_DIR%"

echo.
echo [1/5] Verificando se Node.js esta instalado...
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Node.js encontrado! Usando versao instalada.
    set USE_NODE=1
    goto :build
)

echo Node.js nao encontrado.
echo.
echo [2/5] Baixando Node.js portable (nao sera instalado)...
echo Isso pode demorar alguns minutos na primeira vez...

REM Tenta baixar Node.js portable
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-win-x64.zip' -OutFile '%TEMP_DIR%\node.zip'}" 2>nul

if not exist "%TEMP_DIR%\node.zip" (
    echo.
    echo ERRO: Nao foi possivel baixar Node.js automaticamente.
    echo.
    echo Por favor, instale o Node.js manualmente de:
    echo https://nodejs.org/
    echo.
    echo Ou use a versao HTML diretamente (AutomacaoSPED.html)
    echo.
    pause
    exit /b 1
)

echo Extraindo Node.js...
powershell -Command "Expand-Archive -Path '%TEMP_DIR%\node.zip' -DestinationPath '%TEMP_DIR%' -Force" 2>nul

set NODE_PATH=%TEMP_DIR%\node-v20.11.0-win-x64
set PATH=%NODE_PATH%;%NODE_PATH%\node_modules\.bin;%PATH%

:build
echo.
echo [3/5] Instalando dependencias do Electron...
call npm install --prefix . electron electron-builder --save-dev 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Tentando com Node.js portable...
    "%NODE_PATH%\npm.cmd" install --prefix . electron electron-builder --save-dev
)

echo.
echo [4/5] Gerando executavel...
call npm run build-win 2>nul
if %ERRORLEVEL% NEQ 0 (
    "%NODE_PATH%\npm.cmd" run build-win
)

echo.
echo [5/5] Limpando arquivos temporarios...
if exist "%TEMP_DIR%" (
    timeout /t 2 >nul
    rmdir /s /q "%TEMP_DIR%" 2>nul
)

echo.
echo ========================================
if exist "dist\*.exe" (
    echo SUCESSO!
    echo ========================================
    echo.
    echo Executavel criado em: dist\
    echo.
    dir /b dist\*.exe
    echo.
    echo O arquivo PORTABLE pode ser copiado e executado
    echo em qualquer computador Windows sem instalacao!
) else (
    echo AVISO: Executavel nao foi gerado.
    echo.
    echo Possiveis causas:
    echo - Problema na conexao com internet
    echo - Antivirus bloqueou o download
    echo - Falta de permissao
    echo.
    echo Solucao: Use a versao HTML (AutomacaoSPED.html)
    echo que funciona perfeitamente sem precisar de .exe
)
echo.
pause

