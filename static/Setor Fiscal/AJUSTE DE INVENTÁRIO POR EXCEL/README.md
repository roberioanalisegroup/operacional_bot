# Ajuste de Inventário (aba H010)

Ferramenta para **ajustar automaticamente** os valores do inventário **exclusivamente** na aba `H010`, aplicando um **percentual único** e respeitando a lógica fiscal entre **quantidade, valor unitário e total**.

## Regras aplicadas (fixas)

- **Coluna J**: `QTD`
- **Coluna K**: `VL_UNIT` (única coluna ajustada pelo percentual)
- **Coluna L**: `VL_ITEM` (recalculada)
- **Coluna Q**: `VL_ITEM_IR` (igual a `VL_ITEM`)

### Lógica

1. Ajusta **somente** `VL_UNIT` (coluna K) com o percentual informado
2. Recalcula `VL_ITEM` (coluna L):
   - `VL_ITEM = QTD (J) × novo VL_UNIT (K)`
3. Recalcula `VL_ITEM_IR` (coluna Q):
   - `VL_ITEM_IR = VL_ITEM`

Se a aba `H010` **não existir**, a ferramenta **interrompe** e avisa.

## Como usar

### 1) Instalar dependências

```bash
python -m pip install -r requirements.txt
```

### 2) Executar

```bash
python ajustar_h010.py -i "SEU_ARQUIVO.xlsx" -p 10
```

Exemplos:

- Aumentar 10%:

```bash
python ajustar_h010.py -i "inventario.xlsx" -p 10
```

- Reduzir 3,5%:

```bash
python ajustar_h010.py -i "inventario.xlsx" -p -3.5
```

### Saídas geradas

- Um novo Excel com sufixo `_AJUSTADO_YYYYMMDD_HHMMSS`
- Um log em CSV (separado por `;`) com as linhas alteradas

## Observações

- A ferramenta trabalha **somente** na aba `H010` e **ignora** as demais.
- Linhas em que `J` ou `K` estejam vazios, não numéricos, ou com **fórmulas** são ignoradas (e contabilizadas no resumo).

