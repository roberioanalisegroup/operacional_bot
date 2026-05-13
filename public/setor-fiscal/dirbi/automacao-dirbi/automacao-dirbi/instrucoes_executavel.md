# Instruções para Gerar Executável Independente

## Objetivo

Gerar um arquivo `.exe` que seja **completamente independente**, ou seja, que funcione em qualquer computador Windows **sem necessidade de instalar Python ou qualquer outra dependência**.

## Passo a Passo

### 1. Verificar Dependências

Execute o script de verificação:

```bash
python verificar_dependencias.py
```

Ou manualmente:

```bash
pip install -r requirements.txt
pip install pyinstaller
```

### 2. Gerar o Executável

**Opção A - Script Automatizado (Recomendado):**

```bash
build_exe.bat
```

**Opção B - Script Alternativo (Usando .spec):**

```bash
build_exe_alternativo.bat
```

**Opção C - Manual:**

```bash
pyinstaller --onefile --windowed --name "AutomacaoSPED" --clean --noconfirm --hidden-import=openpyxl --hidden-import=openpyxl.cell --hidden-import=openpyxl.workbook --hidden-import=openpyxl.worksheet --hidden-import=openpyxl.styles --hidden-import=tkinter --hidden-import=tkinter.ttk automacao_sped.py
```

### 3. Localizar o Executável

O arquivo será criado em:

```
dist\AutomacaoSPED.exe
```

### 4. Testar o Executável

1. Copie o arquivo `AutomacaoSPED.exe` para uma pasta temporária
2. Execute o arquivo
3. Verifique se a interface abre corretamente
4. Teste todas as funcionalidades

### 5. Distribuir

O arquivo `AutomacaoSPED.exe` pode ser:
- Copiado para qualquer computador Windows
- Enviado por email
- Colocado em um pendrive
- Compartilhado em rede

**Não é necessário:**
- ❌ Instalar Python
- ❌ Instalar bibliotecas
- ❌ Configurar ambiente
- ❌ Ter conexão com internet

## Solução de Problemas

### Erro: "Falha ao encontrar módulo"

Se o executável apresentar erro de módulo não encontrado:

1. Adicione o módulo faltante ao arquivo `AutomacaoSPED.spec` na seção `hiddenimports`
2. Regenere o executável

### Executável muito grande

O executável terá entre 15-30 MB. Isso é normal porque inclui:
- Python completo
- Todas as bibliotecas (openpyxl, tkinter, etc.)
- Todas as dependências

### Executável não abre

1. Verifique se está em um computador Windows
2. Verifique se o antivírus não está bloqueando
3. Tente executar como administrador
4. Verifique os logs de erro (se houver)

## Comandos Úteis

### Limpar arquivos temporários do PyInstaller

```bash
rmdir /s /q build
rmdir /s /q dist
del AutomacaoSPED.spec
```

### Regenerar do zero

```bash
# Limpar
rmdir /s /q build dist
del AutomacaoSPED.spec

# Regenerar
build_exe.bat
```

## Estrutura do Executável

O executável gerado contém:

```
AutomacaoSPED.exe
├── Python Runtime (embutido)
├── openpyxl (biblioteca Excel)
├── tkinter (interface gráfica)
├── Todas as dependências
└── Seu código Python
```

Tudo isso em um único arquivo!

