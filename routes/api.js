const express = require("express");
const router = express.Router();
const db = require("../models/database");

// GET /api/status — estado atual (contador, ano, params)
router.get("/status", (req, res) => {
  const params = db.getAllParams();
  const ano = parseInt(params.ano, 10) || new Date().getFullYear();
  const contador = parseInt(params.contador, 10) || db.getNextNumero(ano);
  res.json({ ok: true, contador, ano, ...params });
});

// PUT /api/params — atualizar parâmetros
router.put("/params", (req, res) => {
  const allowed = ["sigla", "secretario", "gerente", "setor", "contador", "ano"];
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      db.setParam(key, req.body[key]);
    }
  }
  res.json({ ok: true });
});

// GET /api/emissions — listar emissões
router.get("/emissions", (req, res) => {
  const list = db.listEmissions();
  res.json({ ok: true, data: list });
});

// POST /api/emissions — criar nova emissão
router.post("/emissions", (req, res) => {
  const { razao } = req.body;
  if (!razao || !razao.trim()) {
    return res.status(400).json({ ok: false, error: "Razão Social é obrigatória" });
  }

  const params = db.getAllParams();
  const ano = parseInt(params.ano, 10) || new Date().getFullYear();
  const contador = parseInt(params.contador, 10) || db.getNextNumero(ano);

  const data = {
    numero: contador,
    ano,
    siged: req.body.siged || "",
    razao: razao.toUpperCase().trim(),
    cnpj: req.body.cnpj || "",
    final: req.body.final ? "x" : "",
    intermed: req.body.intermed ? "x" : "",
    placas: req.body.placas ? "x" : "",
    secretario: params.secretario || "",
    gerente: params.gerente || "",
    setor: params.setor || "",
    sigla: params.sigla || "",
  };

  var result = db.createEmission(data);

  db.setParam("contador", String(contador + 1));

  res.json({ ok: true, id: result.lastInsertRowid, numero: contador, ano });
});

// DELETE /api/emissions/:id
router.delete("/emissions/:id", (req, res) => {
  db.deleteEmission(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
