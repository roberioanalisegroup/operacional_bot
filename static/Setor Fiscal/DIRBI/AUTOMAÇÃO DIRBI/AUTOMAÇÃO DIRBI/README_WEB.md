# Automação SPED Contribuições - Versão Web

Aplicação web para importar arquivos SPED Contribuições, analisar registros M410 e gerar planilhas Excel com cálculos automáticos de PIS e COFINS.

## 🌟 Vantagens da Versão Web

- ✅ **Não precisa instalar nada** - Funciona direto no navegador
- ✅ **Funciona em qualquer sistema** - Windows, Mac, Linux
- ✅ **Não precisa de Python** - Tudo roda no navegador
- ✅ **Fácil de distribuir** - Basta compartilhar os arquivos
- ✅ **Interface moderna** - Design responsivo e intuitivo
- ✅ **Processamento rápido** - Tudo acontece localmente no navegador

## 📁 Estrutura de Arquivos

```
.
├── index.html          # Página principal
├── styles.css          # Estilos da aplicação
├── app.js              # Lógica JavaScript
└── README_WEB.md       # Este arquivo
```

## 🚀 Como Usar

### Opção 1: Abrir Localmente

1. Baixe todos os arquivos (index.html, styles.css, app.js)
2. Abra o arquivo `index.html` no seu navegador
3. Pronto! A aplicação está funcionando

### Opção 2: Servidor Local (Recomendado)

Para evitar problemas de CORS, use um servidor local:

**Com Python:**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Com Node.js:**
```bash
npx http-server
```

**Com PHP:**
```bash
php -S localhost:8000
```

Depois acesse: `http://localhost:8000`

### Opção 3: Hospedar Online

Você pode hospedar em qualquer serviço de hospedagem estática:
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting
- Qualquer servidor web

## 📖 Funcionalidades

### 1. Selecionar Arquivo SPED
- Clique na área de upload ou arraste o arquivo
- Aceita apenas arquivos .txt
- Validação automática do formato

### 2. Processar Arquivo
- Analisa automaticamente registros M410
- Extrai código da receita e valores
- Soma valores por código

### 3. Visualizar Dados
- Estatísticas em tempo real
- Tabela completa com todos os dados
- Cálculos automáticos de PIS e COFINS

### 4. Criar Planilha Modelo
- Gera planilha Excel com todos os códigos
- Pronta para ser preenchida manualmente
- Formatação profissional

### 5. Exportar Planilha Preenchida
- Exporta dados processados para Excel
- Inclui cálculos de PIS e COFINS
- Formatação automática

## 🔧 Tecnologias Utilizadas

- **HTML5** - Estrutura da página
- **CSS3** - Estilização moderna e responsiva
- **JavaScript (ES6+)** - Lógica da aplicação
- **SheetJS (xlsx.js)** - Geração de arquivos Excel
- **FileReader API** - Leitura de arquivos locais

## 📊 Formato do Registro M410

A aplicação processa linhas no formato:
```
|M410|código_receita|valor|código||
```

Exemplo:
```
|M410|123|4833,34|1236||
|M410|121|1080,00|1236||
```

## 💰 Cálculos Automáticos

- **PIS**: Valor da Receita × 1,65%
- **COFINS**: Valor da Receita × 7,6%

## 🎨 Interface

A interface possui:
- Design moderno e responsivo
- Drag and drop para upload
- Feedback visual em tempo real
- Alertas informativos
- Tabela interativa
- Estatísticas destacadas

## 🌐 Compatibilidade

### Navegadores Suportados:
- ✅ Chrome/Edge (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

### Requisitos:
- Navegador moderno (últimas 2 versões)
- JavaScript habilitado
- Suporte a FileReader API

## 📝 Notas Importantes

1. **Processamento Local**: Todo o processamento acontece no navegador. Nenhum dado é enviado para servidores externos.

2. **Privacidade**: Seus arquivos SPED nunca saem do seu computador.

3. **Sem Internet**: Após carregar a página, funciona completamente offline.

4. **Tamanho do Arquivo**: Não há limite prático, mas arquivos muito grandes (>100MB) podem demorar mais para processar.

## 🐛 Solução de Problemas

### Arquivo não carrega
- Verifique se o arquivo é .txt
- Tente usar um servidor local (veja Opção 2)

### Exportação não funciona
- Verifique se o navegador permite downloads
- Tente em outro navegador

### Dados não aparecem
- Verifique se o arquivo SPED contém registros M410
- Verifique o formato do arquivo

## 📦 Distribuição

Para distribuir a aplicação:

1. Copie os 3 arquivos (index.html, styles.css, app.js)
2. Coloque em uma pasta
3. Compartilhe a pasta ou hospede online

**Não precisa instalar nada!** Basta abrir o index.html no navegador.

## 🔄 Comparação: Web vs Executável

| Característica | Versão Web | Versão .exe |
|---------------|-----------|-------------|
| Instalação | Não precisa | Não precisa |
| Python | Não precisa | Precisa (apenas para gerar) |
| Sistema Operacional | Qualquer | Windows |
| Distribuição | Arquivos HTML/JS | Arquivo .exe |
| Atualização | Fácil (substituir arquivos) | Regenerar .exe |
| Tamanho | ~50 KB | ~20-30 MB |

## 📄 Licença

Este projeto é de uso livre para fins comerciais e pessoais.

