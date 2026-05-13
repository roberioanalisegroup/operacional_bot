const form = document.querySelector("#simulador-form");

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const anexoIConfig = [
  {
    faixa: "1",
    min: 0,
    max: 180000,
    aliquotaNominal: 4,
    parcelaDeduzir: 0,
    reparticao: { irpj: 5.5, csll: 3.5, cpp: 41.5 },
  },
  {
    faixa: "2",
    min: 180000.01,
    max: 360000,
    aliquotaNominal: 7.3,
    parcelaDeduzir: 5940,
    reparticao: { irpj: 5.5, csll: 3.5, cpp: 41.5 },
  },
  {
    faixa: "3",
    min: 360000.01,
    max: 720000,
    aliquotaNominal: 9.5,
    parcelaDeduzir: 13860,
    reparticao: { irpj: 5.5, csll: 3.5, cpp: 42.0 },
  },
  {
    faixa: "4",
    min: 720000.01,
    max: 1800000,
    aliquotaNominal: 10.7,
    parcelaDeduzir: 22500,
    reparticao: { irpj: 5.5, csll: 3.5, cpp: 42.0 },
  },
  {
    faixa: "5",
    min: 1800000.01,
    max: 3600000,
    aliquotaNominal: 14.3,
    parcelaDeduzir: 87300,
    reparticao: { irpj: 5.5, csll: 3.5, cpp: 42.0 },
  },
  {
    faixa: "6",
    min: 3600000.01,
    max: 4800000,
    aliquotaNominal: 19,
    parcelaDeduzir: 378000,
    reparticao: { irpj: 13.5, csll: 10.0, cpp: 42.1 },
  },
];

const anexoIIConfig = [
  {
    faixa: "1",
    min: 0,
    max: 180000,
    aliquotaNominal: 4.5,
    parcelaDeduzir: 0,
    reparticao: { irpj: 5.5, csll: 3.5, cpp: 37.5 },
  },
  {
    faixa: "2",
    min: 180000.01,
    max: 360000,
    aliquotaNominal: 7.8,
    parcelaDeduzir: 5940,
    reparticao: { irpj: 5.5, csll: 3.5, cpp: 37.5 },
  },
  {
    faixa: "3",
    min: 360000.01,
    max: 720000,
    aliquotaNominal: 10,
    parcelaDeduzir: 13860,
    reparticao: { irpj: 5.5, csll: 3.5, cpp: 37.5 },
  },
  {
    faixa: "4",
    min: 720000.01,
    max: 1800000,
    aliquotaNominal: 11.2,
    parcelaDeduzir: 22500,
    reparticao: { irpj: 5.5, csll: 3.5, cpp: 37.5 },
  },
  {
    faixa: "5",
    min: 1800000.01,
    max: 3600000,
    aliquotaNominal: 14.7,
    parcelaDeduzir: 85500,
    reparticao: { irpj: 5.5, csll: 3.5, cpp: 37.5 },
  },
  {
    faixa: "6",
    min: 3600000.01,
    max: 4800000,
    aliquotaNominal: 30,
    parcelaDeduzir: 720000,
    reparticao: { irpj: 8.5, csll: 7.5, cpp: 23.5 },
  },
];

const anexoIIIConfig = [
  {
    faixa: "1",
    min: 0,
    max: 180000,
    aliquotaNominal: 6,
    parcelaDeduzir: 0,
    reparticao: { irpj: 4.0, csll: 3.5, cpp: 43.4 },
  },
  {
    faixa: "2",
    min: 180000.01,
    max: 360000,
    aliquotaNominal: 11.2,
    parcelaDeduzir: 9360,
    reparticao: { irpj: 4.0, csll: 3.5, cpp: 43.4 },
  },
  {
    faixa: "3",
    min: 360000.01,
    max: 720000,
    aliquotaNominal: 13.5,
    parcelaDeduzir: 17640,
    reparticao: { irpj: 4.0, csll: 3.5, cpp: 43.4 },
  },
  {
    faixa: "4",
    min: 720000.01,
    max: 1800000,
    aliquotaNominal: 16,
    parcelaDeduzir: 35640,
    reparticao: { irpj: 4.0, csll: 3.5, cpp: 43.4 },
  },
  {
    faixa: "5",
    min: 1800000.01,
    max: 3600000,
    aliquotaNominal: 21,
    parcelaDeduzir: 125640,
    reparticao: { irpj: 4.0, csll: 3.5, cpp: 43.4 },
    reparticaoEspecial: {
      aliquotaEfetivaMinima: 14.92537,
      irpj: 6.02,
      csll: 5.26,
      cpp: 65.26,
    },
  },
  {
    faixa: "6",
    min: 3600000.01,
    max: 4800000,
    aliquotaNominal: 33,
    parcelaDeduzir: 648000,
    reparticao: { irpj: 35.0, csll: 15.0, cpp: 30.5 },
  },
];

const anexoIVConfig = [
  {
    faixa: "1",
    min: 0,
    max: 180000,
    aliquotaNominal: 4.5,
    parcelaDeduzir: 0,
    reparticao: { irpj: 18.8, csll: 15.2, cpp: 0 },
  },
  {
    faixa: "2",
    min: 180000.01,
    max: 360000,
    aliquotaNominal: 9,
    parcelaDeduzir: 8100,
    reparticao: { irpj: 19.8, csll: 15.2, cpp: 0 },
  },
  {
    faixa: "3",
    min: 360000.01,
    max: 720000,
    aliquotaNominal: 10.2,
    parcelaDeduzir: 12420,
    reparticao: { irpj: 20.8, csll: 15.2, cpp: 0 },
  },
  {
    faixa: "4",
    min: 720000.01,
    max: 1800000,
    aliquotaNominal: 14,
    parcelaDeduzir: 39780,
    reparticao: { irpj: 17.8, csll: 19.2, cpp: 0 },
  },
  {
    faixa: "5",
    min: 1800000.01,
    max: 3600000,
    aliquotaNominal: 22,
    parcelaDeduzir: 183780,
    reparticao: { irpj: 18.8, csll: 19.2, cpp: 0 },
  },
  {
    faixa: "6",
    min: 3600000.01,
    max: 4800000,
    aliquotaNominal: 33,
    parcelaDeduzir: 828000,
    reparticao: { irpj: 53.5, csll: 21.5, cpp: 0 },
  },
];

const anexoVConfig = [
  {
    faixa: "1",
    min: 0,
    max: 180000,
    aliquotaNominal: 15.5,
    parcelaDeduzir: 0,
    reparticao: { irpj: 25.0, csll: 15.0, cpp: 28.85 },
  },
  {
    faixa: "2",
    min: 180000.01,
    max: 360000,
    aliquotaNominal: 18,
    parcelaDeduzir: 4500,
    reparticao: { irpj: 23.0, csll: 15.0, cpp: 27.85 },
  },
  {
    faixa: "3",
    min: 360000.01,
    max: 720000,
    aliquotaNominal: 19.5,
    parcelaDeduzir: 9900,
    reparticao: { irpj: 24.0, csll: 15.0, cpp: 23.85 },
  },
  {
    faixa: "4",
    min: 720000.01,
    max: 1800000,
    aliquotaNominal: 20.5,
    parcelaDeduzir: 17100,
    reparticao: { irpj: 21.0, csll: 15.0, cpp: 23.85 },
  },
  {
    faixa: "5",
    min: 1800000.01,
    max: 3600000,
    aliquotaNominal: 23,
    parcelaDeduzir: 62100,
    reparticao: { irpj: 23.0, csll: 12.5, cpp: 23.85 },
  },
  {
    faixa: "6",
    min: 3600000.01,
    max: 4800000,
    aliquotaNominal: 30.5,
    parcelaDeduzir: 540000,
    reparticao: { irpj: 35.0, csll: 15.5, cpp: 29.5 },
  },
];

const simplesAutoConfig = {
  I: anexoIConfig,
  II: anexoIIConfig,
  III: anexoIIIConfig,
  IV: anexoIVConfig,
  V: anexoVConfig,
};

function valueOf(id) {
  const element = document.getElementById(id);
  return Number(element?.value || 0);
}

function textOf(id) {
  const element = document.getElementById(id);
  return (element?.value || "").trim();
}

function toDecimal(value) {
  return value / 100;
}

function clampPositive(value) {
  return value < 0 ? 0 : value;
}

function formatCurrency(value) {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

function formatPercent(value) {
  return `${percentFormatter.format((Number.isFinite(value) ? value : 0) * 100)}%`;
}

function byId(id) {
  return document.getElementById(id);
}

function calculateFatorRPercent() {
  return valueOf("fatorR");
}

function resolveAutomaticSimplesContext() {
  const anexoSelecionado = textOf("anexoSimples");
  const rbt12 = valueOf("rbt12");
  const fatorR = calculateFatorRPercent();

  let anexoAplicado = anexoSelecionado;
  let observacao = "";

  if (anexoSelecionado === "V" && fatorR >= 28) {
    anexoAplicado = "III";
    observacao = `Fator R informado de ${percentFormatter.format(fatorR)}% enquadrou automaticamente o cálculo no Anexo III.`;
  } else if (anexoSelecionado === "V") {
    observacao = `Fator R informado de ${percentFormatter.format(fatorR)}% manteve o cálculo no Anexo V.`;
  }

  return {
    anexoSelecionado,
    anexoAplicado,
    fatorR,
    config: getAutoConfigByAnexoAndRBT12(anexoAplicado, rbt12),
    observacao,
  };
}

function calculateCurrentAliquotaEfetivaPercent() {
  const rbt12 = valueOf("rbt12");
  const aliquotaNominal = valueOf("aliquotaNominal");
  const parcelaDeduzir = valueOf("parcelaDeduzir");

  if (rbt12 <= 0) {
    return 0;
  }

  return (((rbt12 * (aliquotaNominal / 100)) - parcelaDeduzir) / rbt12) * 100;
}

function getAutomaticReparticao() {
  const contexto = resolveAutomaticSimplesContext();

  if (!contexto.config) {
    return null;
  }

  const aliquotaEfetiva = calculateCurrentAliquotaEfetivaPercent();
  const especialFaixaCinco = contexto.anexoAplicado === "III"
    && contexto.config.faixa === "5"
    && contexto.config.reparticaoEspecial
    && aliquotaEfetiva > contexto.config.reparticaoEspecial.aliquotaEfetivaMinima;

  const reparticao = especialFaixaCinco
    ? contexto.config.reparticaoEspecial
    : contexto.config.reparticao;

  return {
    ...contexto,
    reparticao,
    aliquotaEfetiva,
    especialFaixaCinco,
  };
}

function syncSplitPercentFields() {
  const irpjInput = byId("percentualIRPJ");
  const csllInput = byId("percentualCSLL");
  const cppInput = byId("percentualCPP");
  const automatico = isAutomaticSimpleEnabled();
  const autoReparticao = automatico ? getAutomaticReparticao() : null;

  irpjInput.readOnly = automatico;
  csllInput.readOnly = automatico;
  cppInput.readOnly = automatico;

  if (!automatico || !autoReparticao) {
    return;
  }

  irpjInput.value = autoReparticao.reparticao.irpj.toFixed(2);
  csllInput.value = autoReparticao.reparticao.csll.toFixed(2);
  cppInput.value = autoReparticao.reparticao.cpp.toFixed(2);
}

function getSplitMode() {
  const mode = textOf("modoReparticao");
  return mode === "automatico" ? "automatico" : "manual";
}

function updateSplitModeStatus() {
  const selectedMode = textOf("modoReparticao");
  const status = byId("statusReparticao");
  const faixaStatus = byId("statusFaixaAutomatica");
  const autoReparticao = getAutomaticReparticao();

  if (selectedMode === "automatico" && autoReparticao) {
    const detalheCPP = autoReparticao.anexoAplicado === "IV"
      ? " No Anexo IV, a CPP fica em 0% na repartição porque o INSS patronal é recolhido fora do DAS."
      : "";

    status.textContent = `Modo automático ativo: a repartição será carregada pela tabela do Anexo ${autoReparticao.anexoAplicado} na Faixa ${autoReparticao.config.faixa}.`;
    faixaStatus.textContent = `Faixa ${autoReparticao.config.faixa} selecionada automaticamente pelo RBT12, com alíquota nominal de ${percentFormatter.format(autoReparticao.config.aliquotaNominal)}% e parcela a deduzir de ${formatCurrency(autoReparticao.config.parcelaDeduzir)}. ${autoReparticao.observacao}${detalheCPP}`.trim();
    return;
  }

  if (selectedMode === "automatico" && !autoReparticao) {
    status.textContent = "O modo automático desta versão está disponível para os Anexos I, II, III, IV e V. O cálculo seguirá com os percentuais manuais apenas se você optar por esse modo.";
    faixaStatus.textContent = "Como o anexo selecionado não possui tabela parametrizada nesta versão, faixa, alíquota e parcela continuam editáveis.";
    return;
  }

  status.textContent = "Os percentuais abaixo serão usados manualmente no cálculo do cenário híbrido.";
  faixaStatus.textContent = "Em modo manual, você pode informar faixa, alíquota e parcela a deduzir livremente.";
}

function getConfigByRBT12(configList, rbt12) {
  if (!configList?.length) {
    return null;
  }

  if (rbt12 <= 0) {
    return configList[0];
  }

  return configList.find((item) => rbt12 >= item.min && rbt12 <= item.max) || configList[configList.length - 1];
}

function getAutoConfigByAnexoAndRBT12(anexo, rbt12) {
  return getConfigByRBT12(simplesAutoConfig[anexo], rbt12);
}

function isAutomaticSimpleEnabled() {
  if (getSplitMode() !== "automatico") {
    return false;
  }

  const contexto = resolveAutomaticSimplesContext();
  return Boolean(contexto.config);
}

function syncAutoSimplesFields() {
  const faixa = byId("faixaSimples");
  const aliquota = byId("aliquotaNominal");
  const deduzir = byId("parcelaDeduzir");
  const fatorR = byId("fatorR");
  const automatico = isAutomaticSimpleEnabled();
  const contexto = resolveAutomaticSimplesContext();
  const config = contexto.config;

  faixa.disabled = automatico;
  aliquota.readOnly = automatico;
  deduzir.readOnly = automatico;
  fatorR.readOnly = false;
  syncSplitPercentFields();

  if (!automatico || !config) {
    return;
  }

  faixa.value = config.faixa;
  aliquota.value = String(config.aliquotaNominal);
  deduzir.value = String(config.parcelaDeduzir);
  syncSplitPercentFields();
}

function updatePresumedRatesBySegment() {
  const segmento = textOf("segmento");
  const irpj = byId("percentualPresuncaoIRPJ");
  const csll = byId("percentualPresuncaoCSLL");

  if (segmento === "comercio" || segmento === "industria") {
    irpj.value = "8";
    csll.value = "12";
    return;
  }

  irpj.value = "32";
  csll.value = "32";
}

function calculateSimples() {
  const rbt12 = valueOf("rbt12");
  const faturamentoMensal = valueOf("faturamentoMensal");
  const aliquotaNominal = toDecimal(valueOf("aliquotaNominal"));
  const parcelaDeduzir = valueOf("parcelaDeduzir");
  const fatorR = calculateFatorRPercent();

  const aliquotaEfetiva = rbt12 > 0
    ? clampPositive(((rbt12 * aliquotaNominal) - parcelaDeduzir) / rbt12)
    : 0;

  const valorDas = faturamentoMensal * aliquotaEfetiva;

  return {
    rbt12,
    faturamentoMensal,
    fatorR,
    aliquotaEfetiva,
    valorDas,
  };
}

function calculateSplit(valorDas) {
  const requestedMode = getSplitMode();
  const autoReparticao = getAutomaticReparticao();
  const contexto = resolveAutomaticSimplesContext();
  const anexo = contexto.anexoAplicado;
  const automatico = isAutomaticSimpleEnabled();
  const config = automatico ? contexto.config : null;

  let percentualIRPJ = toDecimal(valueOf("percentualIRPJ"));
  let percentualCSLL = toDecimal(valueOf("percentualCSLL"));
  let percentualCPP = toDecimal(valueOf("percentualCPP"));
  let mode = "manual";

  if (requestedMode === "automatico" && automatico && config && autoReparticao) {
    percentualIRPJ = toDecimal(autoReparticao.reparticao.irpj);
    percentualCSLL = toDecimal(autoReparticao.reparticao.csll);
    percentualCPP = toDecimal(autoReparticao.reparticao.cpp);
    mode = "automatico";
  }

  const valorIRPJ = valorDas * percentualIRPJ;
  const valorCSLL = valorDas * percentualCSLL;
  const valorCPP = valorDas * percentualCPP;

  return {
    mode,
    anexoAplicado: anexo,
    fatorR: contexto.fatorR,
    percentualIRPJ,
    percentualCSLL,
    percentualCPP,
    valorIRPJ,
    valorCSLL,
    valorCPP,
    subtotal: valorIRPJ + valorCSLL + valorCPP,
  };
}

function calculateIBSCBS() {
  const aliquotaIBS = toDecimal(valueOf("aliquotaIBS"));
  const aliquotaCBS = toDecimal(valueOf("aliquotaCBS"));
  const baseDebitoIBS = valueOf("baseDebitoIBS");
  const baseDebitoCBS = valueOf("baseDebitoCBS");
  const baseCreditoIBS = valueOf("baseCreditoIBS");
  const baseCreditoCBS = valueOf("baseCreditoCBS");
  const reducaoBaseIBS = toDecimal(valueOf("reducaoBaseIBS"));
  const reducaoBaseCBS = toDecimal(valueOf("reducaoBaseCBS"));

  const baseDebitoIBSReduzida = baseDebitoIBS * (1 - reducaoBaseIBS);
  const baseDebitoCBSReduzida = baseDebitoCBS * (1 - reducaoBaseCBS);
  const creditoIBS = baseCreditoIBS * aliquotaIBS;
  const creditoCBS = baseCreditoCBS * aliquotaCBS;

  const debitoIBS = baseDebitoIBSReduzida * aliquotaIBS;
  const debitoCBS = baseDebitoCBSReduzida * aliquotaCBS;
  const saldoIBS = clampPositive(debitoIBS - creditoIBS);
  const saldoCBS = clampPositive(debitoCBS - creditoCBS);

  return {
    aliquotaIBS,
    aliquotaCBS,
    baseDebitoIBS,
    baseDebitoCBS,
    baseCreditoIBS,
    baseCreditoCBS,
    reducaoBaseIBS,
    reducaoBaseCBS,
    baseDebitoIBSReduzida,
    baseDebitoCBSReduzida,
    creditoIBS,
    creditoCBS,
    debitoIBS,
    debitoCBS,
    saldoIBS,
    saldoCBS,
    subtotal: saldoIBS + saldoCBS,
  };
}

function calculatePresumido(ibscbs) {
  const faturamentoMensal = valueOf("faturamentoMensal");
  const folhaMensal = valueOf("folhaMensal");
  const percentualPresuncaoIRPJ = toDecimal(valueOf("percentualPresuncaoIRPJ"));
  const percentualPresuncaoCSLL = toDecimal(valueOf("percentualPresuncaoCSLL"));
  const aliquotaCPPPresumido = toDecimal(valueOf("aliquotaCPPPresumido"));
  const adicionalIRPJ = valueOf("adicionalIRPJ");
  const outrasIncidencias = valueOf("outrasIncidencias");

  const baseIRPJ = faturamentoMensal * percentualPresuncaoIRPJ;
  const baseCSLL = faturamentoMensal * percentualPresuncaoCSLL;
  const valorIRPJ = baseIRPJ * 0.15 + adicionalIRPJ;
  const valorCSLL = baseCSLL * 0.09;
  const valorCPP = folhaMensal * aliquotaCPPPresumido;

  const total = valorIRPJ + valorCSLL + valorCPP + ibscbs.subtotal + outrasIncidencias;

  return {
    percentualPresuncaoIRPJ,
    percentualPresuncaoCSLL,
    baseIRPJ,
    baseCSLL,
    valorIRPJ,
    valorCSLL,
    valorCPP,
    outrasIncidencias,
    total,
  };
}

function bestFinancial(simples, hibrido, presumido) {
  const cenarios = [
    { nome: "Simples puro", valor: simples },
    { nome: "Simples híbrido", valor: hibrido },
    { nome: "Lucro Presumido", valor: presumido },
  ];

  return cenarios.sort((a, b) => a.valor - b.valor)[0];
}

function bestOperational() {
  const clienteCredito = textOf("clienteCredito");
  const perfilCliente = textOf("perfilCliente");
  const complexidade = textOf("complexidade");

  if (clienteCredito === "sim" && (perfilCliente === "b2b" || perfilCliente === "misto")) {
    return "Simples híbrido";
  }

  if (complexidade === "alta") {
    return "Simples puro";
  }

  return "Simples puro";
}

function buildOpinion(financeiro, totals) {
  const clienteCredito = textOf("clienteCredito");
  const custoContabil = valueOf("custoContabil");
  const beneficioComercial = valueOf("beneficioComercial");

  const partes = [];
  partes.push(`${financeiro.nome} apresenta a menor carga estimada no mês analisado.`);

  if (clienteCredito === "sim") {
    partes.push("Como seus clientes aproveitam crédito, os cenários com IBS/CBS no regime regular podem melhorar a competitividade comercial.");
  }

  if (custoContabil > 0) {
    partes.push(`Considere também o custo adicional de conformidade de ${formatCurrency(custoContabil)} por mês na decisão operacional.`);
  }

  if (beneficioComercial > 0 && totals.hibrido <= totals.simples + beneficioComercial) {
    partes.push("Mesmo quando não é o menor custo puro, o cenário híbrido pode se sustentar por gerar crédito e benefício comercial na negociação.");
  }

  partes.push("Use as premissas abaixo para revisar percentuais, créditos e bases antes de validar a recomendação final.");
  return partes.join(" ");
}

function renderMemory(simples, split, ibscbs, presumido) {
  const rows = [
    ["Fator R", `${percentFormatter.format(simples.fatorR)}%`],
    ["Alíquota efetiva do Simples", formatPercent(simples.aliquotaEfetiva)],
    ["DAS estimado", formatCurrency(simples.valorDas)],
    ["IRPJ mantido no Simples", formatCurrency(split.valorIRPJ)],
    ["CSLL mantida no Simples", formatCurrency(split.valorCSLL)],
    ["CPP mantida no Simples", formatCurrency(split.valorCPP)],
    ["Base IBS após redução", formatCurrency(ibscbs.baseDebitoIBSReduzida)],
    ["Base CBS após redução", formatCurrency(ibscbs.baseDebitoCBSReduzida)],
    ["Débito IBS", formatCurrency(ibscbs.debitoIBS)],
    ["Débito CBS", formatCurrency(ibscbs.debitoCBS)],
    ["Crédito IBS calculado", formatCurrency(ibscbs.creditoIBS)],
    ["Crédito CBS calculado", formatCurrency(ibscbs.creditoCBS)],
    ["Saldo IBS", formatCurrency(ibscbs.saldoIBS)],
    ["Saldo CBS", formatCurrency(ibscbs.saldoCBS)],
    ["IRPJ no Lucro Presumido", formatCurrency(presumido.valorIRPJ)],
    ["CSLL no Lucro Presumido", formatCurrency(presumido.valorCSLL)],
    ["CPP no Lucro Presumido", formatCurrency(presumido.valorCPP)],
  ];

  byId("memoriaCalculo").innerHTML = rows
    .map(([label, value]) => `<tr><td>${label}</td><td>${value}</td></tr>`)
    .join("");
}

function renderPremises(simples, split, ibscbs, presumido, totals) {
  const empresa = textOf("empresa") || "Empresa não informada";
  const atividade = textOf("atividade") || "Atividade não informada";
  const observacao = textOf("observacao");
  const premissas = [
    `Empresa analisada: ${empresa}.`,
    `Atividade principal: ${atividade}.`,
    `Anexo selecionado ${textOf("anexoSimples")} e faixa ${textOf("faixaSimples")} para o Simples Nacional.`,
    `RBT12 considerado: ${formatCurrency(simples.rbt12)} e faturamento mensal de ${formatCurrency(simples.faturamentoMensal)}.`,
    `Fator R informado manualmente: ${percentFormatter.format(split.fatorR)}%.`,
    `Repartição do DAS usada no cálculo: ${split.mode === "automatico" ? `automática pelo Anexo ${split.anexoAplicado}` : "manual"} com IRPJ ${percentFormatter.format(split.percentualIRPJ * 100)}%, CSLL ${percentFormatter.format(split.percentualCSLL * 100)}% e CPP ${percentFormatter.format(split.percentualCPP * 100)}%.`,
    `Alíquotas adotadas para IBS/CBS: ${percentFormatter.format(ibscbs.aliquotaIBS * 100)}% e ${percentFormatter.format(ibscbs.aliquotaCBS * 100)}%.`,
    `Redução de base aplicada: IBS ${percentFormatter.format(ibscbs.reducaoBaseIBS * 100)}% e CBS ${percentFormatter.format(ibscbs.reducaoBaseCBS * 100)}%.`,
    `Bases de crédito informadas: IBS ${formatCurrency(ibscbs.baseCreditoIBS)} e CBS ${formatCurrency(ibscbs.baseCreditoCBS)}.`,
    `Créditos calculados automaticamente: IBS ${formatCurrency(ibscbs.creditoIBS)} e CBS ${formatCurrency(ibscbs.creditoCBS)}.`,
    `Lucro Presumido estimado com presunção de IRPJ em ${percentFormatter.format(presumido.percentualPresuncaoIRPJ * 100)}% e CSLL em ${percentFormatter.format(presumido.percentualPresuncaoCSLL * 100)}%.`,
    `Resultado financeiro mensal: Simples ${formatCurrency(totals.simples)}, híbrido ${formatCurrency(totals.hibrido)} e Lucro Presumido ${formatCurrency(totals.presumido)}.`,
  ];

  if (observacao) {
    premissas.push(`Observação registrada: ${observacao}.`);
  }

  byId("listaPremissas").innerHTML = premissas
    .map((item) => `<li>${item}</li>`)
    .join("");
}

function renderComparisonTable(totals) {
  const rows = [
    ["Simples puro", totals.simples, totals.simples * 12],
    ["Simples híbrido", totals.hibrido, totals.hibrido * 12],
    ["Lucro Presumido", totals.presumido, totals.presumido * 12],
  ];

  byId("comparativoCenarios").innerHTML = rows
    .map(([scenario, monthly, annual]) => `
      <tr>
        <td>${scenario}</td>
        <td>${formatCurrency(monthly)}</td>
        <td>${formatCurrency(annual)}</td>
      </tr>
    `)
    .join("");
}

function calculateAndRender() {
  syncAutoSimplesFields();
  const simples = calculateSimples();
  const split = calculateSplit(simples.valorDas);
  const ibscbs = calculateIBSCBS();
  const totalHibrido = split.subtotal + ibscbs.subtotal;
  const presumido = calculatePresumido(ibscbs);

  const totals = {
    simples: simples.valorDas,
    hibrido: totalHibrido,
    presumido: presumido.total,
  };

  const financeiro = bestFinancial(totals.simples, totals.hibrido, totals.presumido);
  const operacional = bestOperational();
  const parecer = buildOpinion(financeiro, totals);

  byId("resultadoSimples").textContent = formatCurrency(totals.simples);
  byId("resultadoHibrido").textContent = formatCurrency(totals.hibrido);
  byId("resultadoPresumido").textContent = formatCurrency(totals.presumido);
  byId("melhorFinanceiro").textContent = financeiro.nome;
  byId("melhorOperacional").textContent = operacional;
  byId("diferencaHibrido").textContent = formatCurrency(totals.hibrido - totals.simples);
  byId("diferencaPresumido").textContent = formatCurrency(totals.presumido - totals.simples);
  byId("melhorAnual").textContent = formatCurrency(financeiro.valor * 12);
  byId("metodoReparticaoResultado").textContent = split.mode === "automatico"
    ? `Automático pelo Anexo ${split.anexoAplicado}`
    : "Manual";
  byId("parecerFinal").textContent = parecer;
  byId("creditoIBS").value = ibscbs.creditoIBS.toFixed(2);
  byId("creditoCBS").value = ibscbs.creditoCBS.toFixed(2);

  renderMemory(simples, split, ibscbs, presumido);
  renderComparisonTable(totals);
  renderPremises(simples, split, ibscbs, presumido, totals);
}

document.getElementById("segmento").addEventListener("change", updatePresumedRatesBySegment);
document.getElementById("modoReparticao").addEventListener("change", () => {
  syncAutoSimplesFields();
  syncSplitPercentFields();
  updateSplitModeStatus();
  calculateAndRender();
});
document.getElementById("imprimirRelatorio").addEventListener("click", () => window.print());
document.getElementById("anexoSimples").addEventListener("change", () => {
  syncAutoSimplesFields();
  syncSplitPercentFields();
  updateSplitModeStatus();
  calculateAndRender();
});
document.getElementById("rbt12").addEventListener("input", () => {
  syncAutoSimplesFields();
  syncSplitPercentFields();
  updateSplitModeStatus();
  calculateAndRender();
});
document.getElementById("fatorR").addEventListener("input", () => {
  syncAutoSimplesFields();
  syncSplitPercentFields();
  updateSplitModeStatus();
  calculateAndRender();
});

document.getElementById("limparFormulario").addEventListener("click", () => {
  window.setTimeout(() => {
    updatePresumedRatesBySegment();
    syncAutoSimplesFields();
    syncSplitPercentFields();
    updateSplitModeStatus();
    calculateAndRender();
  }, 0);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  calculateAndRender();
});

updatePresumedRatesBySegment();
syncAutoSimplesFields();
syncSplitPercentFields();
updateSplitModeStatus();
calculateAndRender();
