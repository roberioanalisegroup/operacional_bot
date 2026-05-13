# Como Gerar o Executável .exe

## 📦 Opção 1: Usando Electron (Recomendado)

### Pré-requisitos
- Node.js instalado (https://nodejs.org/)
- Apenas para GERAR o executável (o .exe final não precisa de nada)

### Passos

1. **Instale o Node.js** (se ainda não tiver)
   - Baixe de: https://nodejs.org/
   - Instale normalmente

2. **Execute o script de build**
   ```bash
   build_exe_electron.bat
   ```

3. **Aguarde a compilação**
   - O script instalará as dependências automaticamente
   - Gerará o executável em `dist/`

4. **Encontre o executável**
   - **Portable**: `dist/Automação SPED X.X.X.exe` (não precisa instalar)
   - **Instalador**: `dist/Automação SPED Setup X.X.X.exe` (instala no sistema)

### Resultado

O executável gerado:
- ✅ Contém tudo (Chromium + sua aplicação)
- ✅ Não precisa de Python
- ✅ Não precisa de Node.js
- ✅ Não precisa de nada instalado
- ✅ Funciona offline
- ✅ Pode ser copiado para qualquer Windows

## 📋 Opção 2: Usando Ferramentas Online

Se você não quiser instalar Node.js, pode usar ferramentas online que convertem HTML para .exe:

1. **HTML Executable** (http://www.html-executable.com/)
2. **HTML Compiler** (https://www.htmlcompiler.com/)
3. **WinHTMLCompiler** (https://www.winhtmlcompiler.com/)

Basta fazer upload do arquivo `AutomacaoSPED.html` e baixar o .exe gerado.

## 🚀 Opção 3: Usar a Versão HTML Diretamente

A versão HTML (`AutomacaoSPED.html`) funciona perfeitamente sem precisar de .exe:
- Abra no navegador
- Funciona offline (após carregar SheetJS)
- Não precisa instalar nada

## 📊 Comparação

| Característica | HTML | .exe Electron |
|---------------|------|---------------|
| Tamanho | ~50 KB | ~100-150 MB |
| Instalação | Não precisa | Não precisa |
| Python | Não precisa | Não precisa |
| Node.js | Não precisa | Só para gerar |
| Offline | Sim | Sim |
| Distribuição | 1 arquivo | 1 arquivo |

## 💡 Recomendação

- **Para uso pessoal**: Use o HTML diretamente
- **Para distribuir**: Gere o .exe usando Electron
- **Para máxima compatibilidade**: Use o .exe portable

## 🔧 Estrutura do Projeto Electron

```
.
├── AutomacaoSPED.html    # Aplicação HTML
├── main.js               # Código Electron (janela)
├── preload.js            # Script de preload
├── package.json          # Configuração do projeto
└── build_exe_electron.bat # Script para gerar .exe
```

## ⚠️ Nota Importante

O executável gerado será grande (~100-150 MB) porque inclui:
- Chromium completo (navegador)
- Node.js runtime
- Sua aplicação HTML

Isso é normal e esperado para um executável standalone!

