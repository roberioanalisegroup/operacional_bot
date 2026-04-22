# Automação SPED Contribuições

Automação para importar arquivos SPED Contribuições, analisar registros M410 e preencher planilha Excel com cálculos automáticos de PIS e COFINS.

## Funcionalidades

- **Interface Gráfica Completa**: Painel visual com todas as informações
- **Importa arquivo SPED Contribuições** (.txt)
- **Analisa registros M410** automaticamente
- **Extrai código da receita e valores totais**
- **Visualização em tempo real**: Veja os dados processados antes de exportar
- **Exportação sob demanda**: Botão para exportar planilha quando desejar
- **Criação de planilha modelo**: Botão para gerar a planilha base
- **Preenche planilha Excel** automaticamente
- **Calcula automaticamente PIS (1,65%) e COFINS (7,6%)**
- **Executável único**: Um único arquivo .exe que funciona em qualquer Windows

## Instalação

1. Instale o Python 3.8 ou superior
2. Instale as dependências:
```bash
pip install -r requirements.txt
```

## Como gerar o executável (.exe)

### Método 1: Script Automatizado (Recomendado)

Execute o arquivo `build_exe.bat`:

```bash
build_exe.bat
```

Este script irá:
1. Instalar todas as dependências necessárias
2. Instalar o PyInstaller
3. Gerar o executável com todas as dependências incluídas

### Método 2: Usando arquivo .spec (Mais controle)

Execute o arquivo `build_exe_alternativo.bat`:

```bash
build_exe_alternativo.bat
```

### Método 3: Manual

```bash
# 1. Instalar dependências
pip install -r requirements.txt
pip install pyinstaller

# 2. Gerar executável
pyinstaller --onefile --windowed --name "AutomacaoSPED" --clean --noconfirm --hidden-import=openpyxl --hidden-import=openpyxl.cell --hidden-import=openpyxl.workbook --hidden-import=openpyxl.worksheet --hidden-import=openpyxl.styles --hidden-import=tkinter --hidden-import=tkinter.ttk automacao_sped.py
```

O executável será criado na pasta `dist\AutomacaoSPED.exe`

### Verificação de Dependências

Antes de gerar o executável, você pode verificar se todas as dependências estão instaladas:

```bash
python verificar_dependencias.py
```

### ⚠️ IMPORTANTE - Executável Independente

O executável gerado é um **arquivo único e completamente independente** que:

- ✅ Contém **TODAS** as dependências necessárias (Python, openpyxl, tkinter, etc.)
- ✅ **NÃO** requer Python instalado no computador de destino
- ✅ **NÃO** requer nenhuma biblioteca adicional
- ✅ Pode ser copiado e executado em **qualquer computador Windows**
- ✅ Funciona mesmo sem conexão com internet
- ✅ Não precisa de instalação - apenas execute o .exe

**Tamanho**: O executável terá aproximadamente 15-30 MB (dependendo das dependências incluídas). Isso é normal, pois contém todo o Python e as bibliotecas necessárias.

## Como criar a planilha modelo

Você pode criar a planilha modelo de duas formas:

1. **Pela interface gráfica**: Clique no botão "Criar Planilha Modelo" no aplicativo
2. **Pelo script Python** (se estiver desenvolvendo):
   ```bash
   python criar_planilha_modelo.py
   ```

Isso criará o arquivo `Planilha_Modelo_Receitas.xlsx` com todos os códigos e naturezas de receita.

## Como usar

1. Execute o `AutomacaoSPED.exe`
2. **Selecionar SPED**: Clique em "Selecionar SPED" e escolha o arquivo SPED Contribuições (.txt)
3. **Processar**: Clique em "Processar" para analisar o arquivo
4. **Visualizar Dados**: Os dados extraídos aparecerão no painel com:
   - Total de registros encontrados
   - Valor total das receitas
   - Lista detalhada com código, valor da receita, COFINS e PIS calculados
5. **Criar Planilha Modelo** (se necessário): Clique em "Criar Planilha Modelo" para gerar a planilha base com todos os códigos
6. **Exportar Planilha**: Clique em "Exportar Planilha Preenchida" para:
   - Selecionar a planilha modelo (.xlsx)
   - Escolher onde salvar a planilha preenchida
   - A planilha será preenchida automaticamente com:
     - **Coluna C**: Valor da Receita (extraído do M410)
     - **Coluna D**: Valor da COFINS (calculado: Valor Receita × 7,6%)
     - **Coluna E**: Valor do PIS (calculado: Valor Receita × 1,65%)

## Formato do registro M410

O script processa linhas no formato:
```
|M410|código_receita|valor|código||
```

Exemplo:
```
|M410|123|4833,34|1236||
|M410|121|1080,00|1236||
```

Onde:
- `código_receita`: Código identificador da receita (ex: 123, 121, 124)
- `valor`: Valor numérico (aceita vírgula como separador decimal)
- `código`: Código adicional (opcional, geralmente 1236)

## Estrutura da Planilha

A planilha modelo possui 5 colunas:

| Coluna | Cabeçalho | Descrição |
|--------|-----------|-----------|
| A | CÓDIGO DA RECEITA | Código numérico da receita |
| B | NATUREZA DA RECEITA | Descrição da natureza da receita |
| C | VALOR DA RECEITA | Valor extraído do M410 (preenchido automaticamente) |
| D | VALOR DA COFINS | Calculado automaticamente (Valor Receita × 7,6%) |
| E | VALOR DO PIS | Calculado automaticamente (Valor Receita × 1,65%) |

## Códigos de Receita Suportados

A planilha modelo inclui os seguintes códigos:
- 101: ADUBOS E FERTILIZANTES
- 102: OUTROS PRODUTOS
- 103: OUTRAS RECEITAS
- 104: CORRETIVO DE SOLO
- 105: DEFENSIVOS AGRICOLAS
- 106: FARINHA DE TRIGO
- 107: FARINHAS A BASE DE MILHO
- 108: FEIJOES
- 109: ARROZ
- 110: FARINHAS E SEMOLAS
- 111: INOCULANTES AGRICOLAS
- 112: ITE FLUIDO OU PASTEURIZADO
- 113: LEITE EM F
- 114: MANTEIGA
- 115: MARGARINA
- 116: MASSAS ALIMENTICIAS
- 117: OLEOS VEGETAIS
- 118: PAPEL HIGIENICO
- 119: PEIXES
- 120: PRE MISTURA PARA PÃO
- 121: CARNES
- 122: PRODUTOS DE HIGIENE BUCAL
- 123: CAFÉ
- 124: AÇUCAR
- 125: PRODUTOS QUIMICOS
- 126: QUEIJOS
- 127: SABAO DE TOUCADOR
- 128: SEMENTES E MUDAS
- 129: SORO DE LEITE
- 130: TRIGO
- 131: VACINAS VETERINARIAS

## Observações

- O script soma todos os valores encontrados para o mesmo código de receita
- Se um código do SPED não existir na planilha, será exibido um aviso
- Os valores são formatados com 2 casas decimais
- A planilha original não é modificada, uma cópia é criada com sufixo `_preenchida`

