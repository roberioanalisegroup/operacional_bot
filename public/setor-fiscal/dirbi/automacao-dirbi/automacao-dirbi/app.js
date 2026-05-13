// Dados globais
let dadosProcessados = null;
let arquivoSelecionado = null;

// Códigos e naturezas da receita (conforme planilha oficial)
const CODIGOS_NATUREZAS = {
    "101": "ADUBOS E FERTILIZANTES",
    "102": "DEFENSIVOS AGRICOLAS",
    "103": "SEMENTES E MUDAS",
    "104": "CORRETIVO DE SOLO",
    "105": "FEIJOES, ARROZ, FARINHAS E SEMOLAS",
    "106": "INOCULANTES AGRICOLAS",
    "107": "VACINAS VETERINARIAS",
    "108": "FARINHAS A BASE DE MILHO",
    "110": "LEITE FLUIDO OU PASTEURIZADO, LEITE EM PO",
    "111": "QUEIJOS",
    "112": "SORO DE LEITE",
    "113": "FARINHA DE TRIGO",
    "114": "TRIGO",
    "115": "PRE MISTURA PARA PÃO",
    "119": "MASSAS ALIMENTICIAS",
    "121": "CARNES",
    "122": "PEIXES",
    "123": "CAFÉ",
    "124": "AÇUCAR",
    "125": "OLEOS VEGETAIS",
    "126": "MANTEIGA",
    "127": "MARGARINA",
    "128": "SABAO DE TOUCADOR",
    "129": "PRODUTOS DE HIGIENE BUCAL",
    "130": "PAPEL HIGIENICO",
    "116": "PRODUTOS HORTÍCOLAS E FRUTAS",
    "117": "OVOS",
    "118": "VENDA DE SÊMENS E EMBRIÕES",
    "301": "CADEIRAS DE RODAS E OUTROS VEÍCULOS",
    "302": "ARTIGOS E APARELHOS ORTOPÉDICOS OU PARA FRATURAS",
    "303": "ARTIGOS E APARELHOS DE PRÓTESES",
    "304": "ALMOFADAS ANTI ESCARAS",
    "306": "PRODUTOS QUIMICOS",
    "308": "PRODUTOS DESTINADOS AO USO EM HOSPITAIS, CLÍNICAS E CONSULTÓRIOS MÉDICOS E ODONTOLÓGICOS, CAMPANHAS DE SAÚDE REALIZADAS PELO PODER PÚBLICO, LABORATÓRIO DE ANATOMIA PATOLÓGICA, CITOLÓGICA OU DE ANÁLISES CLÍNICAS",
    "309": "PRODUTOS CLASSIFICADOS NOS CÓDIGOS 8443.32.22, 8469.00.39 EX 01, 8714.20.00, 9021.40.00, 9021.90.82 E 9021.90.92",
    "310": "CALCULADORAS EQUIPADAS COM SINTETIZADOR DE VOZ",
    "311": "TECLADOS COM COLMEIA",
    "312": "INDICADORES OU APONTADORES - MOUSES - COM ENTRADA PARA ACIONADOR",
    "313": "LINHAS BRAILE",
    "314": "DIGITALIZADORES DE IMAGENS - SCANNERS - EQUIPADOS COM SINTETIZADOR DE VOZ",
    "315": "DUPLICADORES BRAILE",
    "316": "ACIONADORES DE PRESSÃO",
    "317": "LUPAS ELETRÔNICAS DO TIPO UTILIZADO POR PESSOAS COM DEFICIÊNCIA VISUAL",
    "318": "IMPLANTES COCLEARES",
    "319": "PRÓTESES OCULARES",
    "320": "PROGRAMAS - SOFTWARES - DE LEITORES DE TELA QUE CONVERTEM TEXTO EM VOZ SINTETIZADA PARA AUXÍLIO DE PESSOAS COM DEFICIÊNCIA VISUAL",
    "321": "APARELHOS CONTENDO PROGRAMAS - SOFTWARES - DE LEITORES DE TELA QUE CONVERTEM TEXTO EM CARACTERES BRAILE, PARA UTILIZAÇÃO DE SURDOS-CEGOS",
    "322": "NEUROESTIMULADORES PARA TREMOR ESSENCIAL/PARKINSON",
    "903": "LIVROS",
    "914": "RECEITA DECORRENTE DA VENDA DE ÁGUAS MINERAIS NATURAIS COMERCIALIZADAS EM RECIPIENTES COM CAPACIDADE NOMINAL INFERIOR A 10 (DEZ) LITROS OU IGUAL OU SUPERIOR A 10 (DEZ) LITROS"
};

// Taxas
const TAXA_PIS = 0.0165;  // 1,65%
const TAXA_COFINS = 0.076;  // 7,6%

// Elementos DOM
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const fileName = document.getElementById('fileName');
const processBtn = document.getElementById('processBtn');
const statsSection = document.getElementById('statsSection');
const dataSection = document.getElementById('dataSection');
const actionsSection = document.getElementById('actionsSection');
const tableBody = document.getElementById('tableBody');
const tableFooter = document.getElementById('tableFooter');
const exportBtn = document.getElementById('exportBtn');
const createModelBtn = document.getElementById('createModelBtn');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

function setupEventListeners() {
    // Upload area click
    uploadArea.addEventListener('click', () => fileInput.click());
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Process button
    processBtn.addEventListener('click', processarArquivo);
    
    // Export button
    exportBtn.addEventListener('click', exportarPlanilha);
    
    // Create model button
    createModelBtn.addEventListener('click', criarPlanilhaModelo);
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        arquivoSelecionado = file;
        fileName.textContent = file.name;
        processBtn.disabled = false;
        showAlert('Arquivo selecionado: ' + file.name, 'success');
    }
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.txt')) {
        arquivoSelecionado = file;
        fileName.textContent = file.name;
        processBtn.disabled = false;
        showAlert('Arquivo selecionado: ' + file.name, 'success');
    } else {
        showAlert('Por favor, selecione um arquivo .txt', 'error');
    }
}

function parsearRegistroM400(linha) {
    linha = linha.trim();
    
    if (!linha.startsWith('|M400|')) {
        return null;
    }
    
    const campos = linha.split('|').filter(c => c);
    
    if (campos.length >= 2 && campos[0] === 'M400') {
        const codigo = campos[1].trim();
        return { tipo: 'M400', codigo };
    }
    
    return null;
}

function parsearRegistroM410(linha) {
    linha = linha.trim();
    
    if (!linha.startsWith('|M410|')) {
        return null;
    }
    
    const campos = linha.split('|').filter(c => c);
    
    if (campos.length >= 4 && campos[0] === 'M410') {
        const codigoReceita = campos[1].trim();
        const valorStr = campos[2].trim();
        
        try {
            const valor = parseFloat(valorStr.replace(',', '.'));
            return { tipo: 'M410', codigoReceita, valor };
        } catch (e) {
            return null;
        }
    }
    
    return null;
}

async function processarArquivo() {
    if (!arquivoSelecionado) {
        showAlert('Por favor, selecione um arquivo SPED primeiro', 'error');
        return;
    }
    
    processBtn.disabled = true;
    processBtn.innerHTML = '<span class="loading"></span> Processando...';
    
    try {
        const texto = await arquivoSelecionado.text();
        const linhas = texto.split('\n');
        
        const dados = {};
        let dentroDoM400_06 = false;
        let encontrouM400_06 = false;
        
        // Processa linha por linha
        for (let i = 0; i < linhas.length; i++) {
            const linha = linhas[i];
            
            // Verifica se é M400
            const m400 = parsearRegistroM400(linha);
            if (m400) {
                // Se encontrou M400|06|, ativa o processamento
                if (m400.codigo === '06') {
                    dentroDoM400_06 = true;
                    encontrouM400_06 = true;
                } else {
                    // Se encontrou outro M400, para o processamento
                    dentroDoM400_06 = false;
                }
                continue;
            }
            
            // Se está dentro do bloco M400|06|, processa M410
            if (dentroDoM400_06) {
                const m410 = parsearRegistroM410(linha);
                if (m410) {
                    const { codigoReceita, valor } = m410;
                    if (dados[codigoReceita]) {
                        dados[codigoReceita] += valor;
                    } else {
                        dados[codigoReceita] = valor;
                    }
                }
            }
        }
        
        if (!encontrouM400_06) {
            showAlert('Nenhum registro |M400|06| encontrado no arquivo', 'warning');
            processBtn.disabled = false;
            processBtn.textContent = 'Processar Arquivo';
            return;
        }
        
        dadosProcessados = dados;
        
        if (Object.keys(dados).length === 0) {
            showAlert('Nenhum registro M410 encontrado abaixo de |M400|06|', 'warning');
            processBtn.disabled = false;
            processBtn.textContent = 'Processar Arquivo';
            return;
        }
        
        atualizarInterface();
        exportBtn.disabled = false;
        showAlert(`Processado com sucesso! ${Object.keys(dados).length} código(s) encontrado(s) abaixo de |M400|06|`, 'success');
        
    } catch (error) {
        showAlert('Erro ao processar arquivo: ' + error.message, 'error');
    } finally {
        processBtn.disabled = false;
        processBtn.textContent = 'Processar Arquivo';
    }
}

function atualizarInterface() {
    if (!dadosProcessados) return;
    
    // Calcular totais
    const codigos = Object.keys(dadosProcessados);
    const totalRegistros = codigos.length;
    const valorTotal = Object.values(dadosProcessados).reduce((a, b) => a + b, 0);
    const totalCofins = valorTotal * TAXA_COFINS;
    const totalPis = valorTotal * TAXA_PIS;
    
    // Atualizar estatísticas
    document.getElementById('totalRegistros').textContent = totalRegistros;
    document.getElementById('valorTotal').textContent = formatarMoeda(valorTotal);
    document.getElementById('codigosEncontrados').textContent = totalRegistros;
    
    // Mostrar seções
    statsSection.style.display = 'block';
    dataSection.style.display = 'block';
    actionsSection.style.display = 'block';
    
    // Limpar tabela
    tableBody.innerHTML = '';
    
    // Preencher tabela
    const codigosOrdenados = codigos.sort((a, b) => parseInt(a) - parseInt(b));
    
    codigosOrdenados.forEach(codigo => {
        const valor = dadosProcessados[codigo];
        const cofins = valor * TAXA_COFINS;
        const pis = valor * TAXA_PIS;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${codigo}</td>
            <td>${formatarMoeda(valor)}</td>
            <td>${formatarMoeda(cofins)}</td>
            <td>${formatarMoeda(pis)}</td>
        `;
        tableBody.appendChild(row);
    });
    
    // Adicionar linha de total
    const footerRow = document.createElement('tr');
    footerRow.className = 'total-row';
    footerRow.innerHTML = `
        <td><strong>TOTAL</strong></td>
        <td><strong>${formatarMoeda(valorTotal)}</strong></td>
        <td><strong>${formatarMoeda(totalCofins)}</strong></td>
        <td><strong>${formatarMoeda(totalPis)}</strong></td>
    `;
    tableFooter.innerHTML = '';
    tableFooter.appendChild(footerRow);
    tableFooter.style.display = 'table-footer-group';
}

function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

function criarPlanilhaModelo() {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
        ['CÓDIGO DA RECEITA', 'NATUREZA DA RECEITA', 'VALOR DA RECEITA', 'VALOR DA COFINS', 'VALOR DO PIS']
    ]);
    
    // Estilizar cabeçalho
    const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "366092" } },
        alignment: { horizontal: "center", vertical: "center" }
    };
    
    // Adicionar dados
    const dados = [];
    Object.keys(CODIGOS_NATUREZAS).sort((a, b) => parseInt(a) - parseInt(b)).forEach(codigo => {
        dados.push([
            codigo,
            CODIGOS_NATUREZAS[codigo],
            null,  // Valor da receita
            null,  // COFINS
            null   // PIS
        ]);
    });
    
    XLSX.utils.sheet_add_aoa(ws, dados, { origin: -1 });
    
    // Ajustar larguras das colunas
    ws['!cols'] = [
        { wch: 18 },  // Código
        { wch: 35 },  // Natureza
        { wch: 18 },  // Valor Receita
        { wch: 18 },  // COFINS
        { wch: 18 }   // PIS
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Receitas');
    
    // Salvar arquivo
    XLSX.writeFile(wb, 'Planilha_Modelo_Receitas.xlsx');
    showAlert('Planilha modelo criada com sucesso!', 'success');
}

function exportarPlanilha() {
    if (!dadosProcessados) {
        showAlert('Por favor, processe um arquivo SPED primeiro', 'error');
        return;
    }
    
    // Criar workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
        ['CÓDIGO DA RECEITA', 'NATUREZA DA RECEITA', 'VALOR DA RECEITA', 'VALOR DA COFINS', 'VALOR DO PIS']
    ]);
    
    // Adicionar dados processados
    const dados = [];
    const codigosOrdenados = Object.keys(dadosProcessados).sort((a, b) => parseInt(a) - parseInt(b));
    
    codigosOrdenados.forEach(codigo => {
        const valor = dadosProcessados[codigo];
        const cofins = valor * TAXA_COFINS;
        const pis = valor * TAXA_PIS;
        const natureza = CODIGOS_NATUREZAS[codigo] || 'NÃO ENCONTRADO';
        
        dados.push([
            codigo,
            natureza,
            valor,
            cofins,
            pis
        ]);
    });
    
    // Adicionar linha de total
    const valorTotal = Object.values(dadosProcessados).reduce((a, b) => a + b, 0);
    const totalCofins = valorTotal * TAXA_COFINS;
    const totalPis = valorTotal * TAXA_PIS;
    
    dados.push([
        'TOTAL',
        '',
        valorTotal,
        totalCofins,
        totalPis
    ]);
    
    XLSX.utils.sheet_add_aoa(ws, dados, { origin: -1 });
    
    // Ajustar larguras
    ws['!cols'] = [
        { wch: 18 },
        { wch: 35 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 }
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Receitas');
    
    // Gerar nome do arquivo com data
    const data = new Date().toISOString().split('T')[0];
    const nomeArquivo = `Planilha_Preenchida_${data}.xlsx`;
    
    // Salvar
    XLSX.writeFile(wb, nomeArquivo);
    showAlert('Planilha exportada com sucesso!', 'success');
}

function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;
    
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        alert.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

