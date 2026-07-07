var appState = {
  sigla: "GPIN/DCI/SEDEC",
  secretario: "DARIO JOSÉ BRAGA PAIM",
  gerente: "MARLON JOSÉ LIMA DUTRA",
  setor: "Gerência de Projetos de Incentivos",
  contador: 24,
  ano: new Date().getFullYear(),
  historico: []
};

// === API ===
var API = "/api";

async function apiGet(path) {
  var r = await fetch(API + path);
  return r.json();
}

async function apiPost(path, body) {
  var r = await fetch(API + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return r.json();
}

async function apiPut(path, body) {
  var r = await fetch(API + path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return r.json();
}

async function apiDelete(path) {
  var r = await fetch(API + path, { method: "DELETE" });
  return r.json();
}

// === Inicialização ===
async function inicializarSistema() {
  try {
    var st = await apiGet("/status");
    appState.sigla = st.sigla || appState.sigla;
    appState.secretario = st.secretario || appState.secretario;
    appState.gerente = st.gerente || appState.gerente;
    appState.setor = st.setor || appState.setor;
    appState.contador = parseInt(st.contador, 10) || 1;
    appState.ano = parseInt(st.ano, 10) || new Date().getFullYear();
  } catch (e) {
    console.warn("API indisponível, usando defaults");
  }

  try {
    var em = await apiGet("/emissions");
    appState.historico = em.data || [];
  } catch (e) {
    appState.historico = [];
  }

  carregarInterface();
  renderizarTabela();
}

function carregarInterface() {
  document.getElementById("inputNumeroSeq").value = appState.contador;
  document.getElementById("inputAno").value = appState.ano;
  document.getElementById("lblGerente").innerText = appState.gerente;
  document.getElementById("lblSecretario").innerText = appState.secretario;
  document.getElementById("paramSigla").value = appState.sigla;
  document.getElementById("paramSecretario").value = appState.secretario;
  document.getElementById("paramGerente").value = appState.gerente;
  document.getElementById("paramSetor").value = appState.setor;
  document.getElementById("paramProxNum").value = appState.contador;
  document.getElementById("paramAnoCorr").value = appState.ano;
}

async function salvarParametros() {
  var body = {
    sigla: document.getElementById("paramSigla").value,
    secretario: document.getElementById("paramSecretario").value,
    gerente: document.getElementById("paramGerente").value,
    setor: document.getElementById("paramSetor").value,
    contador: parseInt(document.getElementById("paramProxNum").value),
    ano: parseInt(document.getElementById("paramAnoCorr").value)
  };

  try {
    await apiPut("/params", body);
    appState.sigla = body.sigla;
    appState.secretario = body.secretario;
    appState.gerente = body.gerente;
    appState.setor = body.setor;
    appState.contador = body.contador;
    appState.ano = body.ano;
    carregarInterface();
    $("#modalParametros").modal("hide");
  } catch (e) {
    alert("Erro ao salvar parâmetros");
  }
}

function limparCampos() {
  document.getElementById("inputProcesso").value = "";
  document.getElementById("inputRazao").value = "";
  document.getElementById("inputCnpj").value = "";
  document.getElementById("checkFinal").checked = false;
  document.getElementById("checkIntermediario").checked = false;
  document.getElementById("checkPlacas").checked = false;
}

async function processarEmissao() {
  var razao = document.getElementById("inputRazao").value;
  if (!razao) { alert("Razão Social é obrigatória!"); return; }

  var btn = document.getElementById("btnGerar");
  var originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Gerando...';

  var dados = {
    siged: document.getElementById("inputProcesso").value,
    razao: razao.toUpperCase(),
    cnpj: document.getElementById("inputCnpj").value,
    final: document.getElementById("checkFinal").checked,
    intermed: document.getElementById("checkIntermediario").checked,
    placas: document.getElementById("checkPlacas").checked
  };

  try {
    var result = await apiPost("/emissions", dados);

    dados.numero = result.numero;
    dados.ano = result.ano;
    dados.secretarioSnapshot = appState.secretario;
    dados.gerenteSnapshot = appState.gerente;
    dados.setorSnapshot = appState.setor;
    dados.siglaSnapshot = appState.sigla;

    await executarGeracaoPDF(dados);

    appState.contador = result.numero + 1;
    document.getElementById("inputNumeroSeq").value = appState.contador;

    adicionarAoHistorico(dados);
    limparCampos();

    btn.disabled = false;
    btn.innerHTML = originalText;
  } catch (e) {
    console.error(e);
    alert("Erro ao gerar. Verifique o servidor.");
    btn.disabled = false;
    btn.innerHTML = "Tentar Novamente";
  }
}

async function executarGeracaoPDF(dados) {
  var meses = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  var hoje = new Date();
  var dataFormatada = hoje.getDate() + " de " + meses[hoje.getMonth()] + " de " + hoje.getFullYear();

  document.getElementById("outRef").innerText = dados.numero + "/" + dados.ano;
  document.getElementById("outSigla").innerText = dados.siglaSnapshot || appState.sigla;
  document.getElementById("outProcesso").innerText = dados.siged;
  document.getElementById("outData").innerText = dataFormatada;
  document.getElementById("outDestNome").innerText = dados.secretarioSnapshot || appState.secretario;
  document.getElementById("outRazao").innerText = dados.razao;
  document.getElementById("outCnpj").innerText = dados.cnpj;
  document.getElementById("outAssNome").innerText = dados.gerenteSnapshot || appState.gerente;
  document.getElementById("outAssCargo").innerText = dados.setorSnapshot || appState.setor;

  document.getElementById("boxFinal").innerText = dados.final === "x" ? "[x]" : "[ ]";
  document.getElementById("boxIntermediario").innerText = dados.intermed === "x" ? "[x]" : "[ ]";
  document.getElementById("boxPlacas").innerText = dados.placas === "x" ? "[x]" : "[ ]";

  var elemento = document.getElementById("documento-modelo");
  elemento.style.backgroundImage = "url('" + TIMBRADO_BASE64 + "')";

  var safeRazao = dados.razao.replace(/[^a-zA-Z0-9\s]/g, "").trim();
  var nomeArquivo = "CCA " + dados.numero + "_" + dados.ano + "_" + safeRazao + ".pdf";

  var opt = {
    margin: 0,
    filename: nomeArquivo,
    image: { type: "jpeg", quality: 1 },
    html2canvas: { scale: 3, scrollX: 0, scrollY: 0, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      html2pdf().set(opt).from(elemento).save().then(function () {
        setTimeout(function () {
          elemento.style.backgroundImage = "none";
        }, 100);
        resolve();
      }).catch(function (err) {
        elemento.style.backgroundImage = "none";
        reject(err);
      });
    }, 50);
  });
}

function reimprimirItem(index) {
  var item = appState.historico[index];
  executarGeracaoPDF(item).catch(function () { alert("Erro na reimpressão"); });
}

function adicionarAoHistorico(dados) {
  var hoje = new Date();
  var dia = (hoje.getDate() < 10 ? "0" : "") + hoje.getDate();
  var mes = ((hoje.getMonth() + 1) < 10 ? "0" : "") + (hoje.getMonth() + 1);
  var dataStr = dia + "/" + mes;

  var novo = {
    numero: dados.numero,
    ano: dados.ano,
    data: dataStr,
    cnpj: dados.cnpj,
    razao: dados.razao,
    final: dados.final === true ? "x" : (dados.final || ""),
    intermed: dados.intermed === true ? "x" : (dados.intermed || ""),
    placas: dados.placas === true ? "x" : (dados.placas || ""),
    siged: dados.siged,
    secretarioSnapshot: dados.secretarioSnapshot,
    gerenteSnapshot: dados.gerenteSnapshot,
    setorSnapshot: dados.setorSnapshot,
    siglaSnapshot: dados.siglaSnapshot
  };

  appState.historico.unshift(novo);
  renderizarTabela();
}

function renderizarTabela() {
  var tbody = document.getElementById("corpoTabela");
  tbody.innerHTML = "";

  var fmt = function (val) { return (val === "SIM" || val === "x") ? "x" : ""; };

  appState.historico.forEach(function (item, index) {
    var tr = document.createElement("tr");
    tr.innerHTML =
      "<td>" + item.numero + "</td>" +
      "<td>" + item.ano + "</td>" +
      "<td>" + item.data + "</td>" +
      "<td>" + item.cnpj + "</td>" +
      "<td>" + item.razao + "</td>" +
      "<td class='text-center'>" + fmt(item.final) + "</td>" +
      "<td class='text-center'>" + fmt(item.intermed) + "</td>" +
      "<td class='text-center'>" + fmt(item.placas) + "</td>" +
      "<td class='text-center'>" + (item.siged || "") + "</td>" +
      "<td class='text-center'>" +
        "<button class='btn btn-primary btn-action mr-1' onclick='reimprimirItem(" + index + ")'><i class='bi bi-printer'></i></button>" +
        "<button class='btn btn-outline-danger btn-action' onclick='removerItem(" + index + ")'><i class='bi bi-trash'></i></button>" +
      "</td>";
    tbody.appendChild(tr);
  });
}

async function removerItem(index) {
  if (!confirm("Apagar registro?")) return;
  var item = appState.historico[index];
  try {
    await apiDelete("/emissions/" + item.id);
  } catch (e) {
    // item may not have id if not yet saved
  }
  appState.historico.splice(index, 1);
  renderizarTabela();
}

function exportarExcel() {
  var csv = "\uFEFFNúmero;Ano;Data;CNPJ;Razão Social;Bem Final;Bem Intermed;Placas;SIGED\n";
  appState.historico.forEach(function (i) {
    var f = (i.final === "SIM" || i.final === "x") ? "x" : "";
    var n = (i.intermed === "SIM" || i.intermed === "x") ? "x" : "";
    var p = (i.placas === "SIM" || i.placas === "x") ? "x" : "";
    csv += i.numero + ";" + i.ano + ";" + i.data + ";" + i.cnpj + ";" + i.razao + ";" + f + ";" + n + ";" + p + ";" + (i.siged || "") + "\n";
  });

  var fileName = "Controle_CCA_" + appState.ano + ".csv";
  var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, fileName);
  } else {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
  }
}

// Bootstrap + inicialização
$(function () {
  inicializarSistema();
});
