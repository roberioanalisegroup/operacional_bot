@echo off
echo Criando planilha modelo...
python criar_planilha_modelo.py
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Planilha modelo criada com sucesso!
    echo Arquivo: Planilha_Modelo_Receitas.xlsx
) else (
    echo.
    echo Erro ao criar planilha. Tentando com py...
    py criar_planilha_modelo.py
)
pause

