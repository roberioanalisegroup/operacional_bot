@echo off
setlocal
set CSC_IDENTITY_AUTO_DISCOVERY=false
cd /d "%~dp0"
if exist "temp_build\node-v20.11.0-win-x64\npm.cmd" (
    call "temp_build\node-v20.11.0-win-x64\npm.cmd" run build-win
) else (
    echo Node.js nao encontrado. Execute GerarEXE.ps1 primeiro.
    pause
)
endlocal

