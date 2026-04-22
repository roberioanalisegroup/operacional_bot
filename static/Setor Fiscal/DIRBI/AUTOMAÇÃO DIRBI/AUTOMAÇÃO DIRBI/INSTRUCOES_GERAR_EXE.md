# 📦 Como Gerar o Executável .exe

## ✅ Método Recomendado: Electron

### Passo 1: Instalar Node.js (Apenas para GERAR o .exe)

1. Baixe o Node.js de: https://nodejs.org/
2. Instale normalmente (marque a opção "Add to PATH")
3. Reinicie o terminal/PowerShell

### Passo 2: Gerar o Executável

Execute o arquivo:
```
build_exe_electron.bat
```

O script irá:
1. ✅ Verificar se Node.js está instalado
2. ✅ Instalar dependências automaticamente
3. ✅ Gerar o executável em `dist/`

### Passo 3: Encontrar o Executável

Após a compilação, você encontrará em `dist/`:

- **`Automação SPED X.X.X.exe`** (PORTABLE - Recomendado)
  - Não precisa instalar
  - Pode ser copiado para qualquer Windows
  - Execute diretamente

- **`Automação SPED Setup X.X.X.exe`** (Instalador)
  - Instala no sistema
  - Cria atalhos
  - Opcional

## 🎯 Características do Executável

O .exe gerado:
- ✅ **Não precisa de Python**
- ✅ **Não precisa de Node.js**
- ✅ **Não precisa de nada instalado**
- ✅ **Funciona offline completamente**
- ✅ **Contém tudo embutido** (Chromium + aplicação)
- ✅ **Pode ser copiado para qualquer Windows**

## 📊 Tamanho do Executável

O executável terá aproximadamente **100-150 MB** porque inclui:
- Chromium completo (navegador)
- Node.js runtime
- Sua aplicação HTML

**Isso é normal!** É o preço de ter um executável completamente independente.

## 🔄 Alternativa: Usar HTML Diretamente

Se você não quiser gerar o .exe, pode usar o arquivo HTML diretamente:

1. Abra `AutomacaoSPED.html` no navegador
2. Funciona perfeitamente
3. Não precisa instalar nada

## ⚠️ Solução de Problemas

### Erro: "Node.js não encontrado"
- Instale o Node.js de https://nodejs.org/
- Reinicie o terminal
- Execute novamente o script

### Erro: "npm não encontrado"
- O npm vem com o Node.js
- Reinstale o Node.js marcando "Add to PATH"

### Executável muito grande
- Isso é normal (100-150 MB)
- O executável contém tudo que precisa

### Executável não abre
- Verifique se é Windows 64-bit
- Execute como administrador
- Verifique antivírus

## 📝 Notas Importantes

1. **Node.js é necessário APENAS para GERAR o .exe**
   - O .exe final NÃO precisa de Node.js
   - O .exe final NÃO precisa de nada

2. **O executável é standalone**
   - Pode ser copiado para qualquer computador
   - Não precisa instalar dependências
   - Funciona offline

3. **Tamanho grande é normal**
   - Contém navegador completo
   - É o preço da independência

## 🚀 Distribuição

Depois de gerar o .exe:
1. Copie o arquivo `Automação SPED X.X.X.exe` (portable)
2. Envie por email, pendrive, etc.
3. A pessoa só precisa executar - sem instalar nada!

