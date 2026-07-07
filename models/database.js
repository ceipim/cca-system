const { getDb } = require("../database");

function getParam(key) {
  const row = getDb().prepare("SELECT value FROM params WHERE key = ?").get(key);
  return row ? row.value : null;
}

function setParam(key, value) {
  getDb().prepare("INSERT OR REPLACE INTO params (key, value) VALUES (?, ?)").run(key, String(value));
}

function getAllParams() {
  const rows = getDb().prepare("SELECT key, value FROM params").all();
  const obj = {};
  for (const r of rows) obj[r.key] = r.value;
  return obj;
}

function getNextNumero(ano) {
  const row = getDb()
    .prepare("SELECT COALESCE(MAX(numero), 0) + 1 AS next FROM emissions WHERE ano = ?")
    .get(ano);
  return row.next;
}

function createEmission(data) {
  const stmt = getDb().prepare(`
    INSERT INTO emissions (numero, ano, siged, razao, cnpj, final, intermed, placas, secretario, gerente, setor, sigla)
    VALUES (@numero, @ano, @siged, @razao, @cnpj, @final, @intermed, @placas, @secretario, @gerente, @setor, @sigla)
  `);
  return stmt.run(data);
}

function listEmissions() {
  return getDb().prepare("SELECT * FROM emissions ORDER BY id DESC").all();
}

function getEmission(id) {
  return getDb().prepare("SELECT * FROM emissions WHERE id = ?").get(id);
}

function deleteEmission(id) {
  return getDb().prepare("DELETE FROM emissions WHERE id = ?").run(id);
}

module.exports = {
  getParam,
  setParam,
  getAllParams,
  getNextNumero,
  createEmission,
  listEmissions,
  getEmission,
  deleteEmission,
};
