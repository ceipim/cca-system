const express = require("express");
const path = require("path");
const cors = require("cors");
const apiRoutes = require("./routes/api");
const { getDb } = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

// Auto-seed na primeira execução (banco vazio)
function autoSeed() {
  const db = getDb();
  const row = db.prepare("SELECT COUNT(*) AS total FROM params").get();
  if (row.total === 0) {
    const defaults = {
      sigla: "GPIN/DCI/SEDEC",
      secretario: "DARIO JOSÉ BRAGA PAIM",
      gerente: "MARLON JOSÉ LIMA DUTRA",
      setor: "Gerência de Projetos de Incentivos",
      contador: "1",
      ano: String(new Date().getFullYear()),
    };
    const insert = db.prepare("INSERT OR REPLACE INTO params (key, value) VALUES (?, ?)");
    const tx = db.transaction(() => {
      for (const [k, v] of Object.entries(defaults)) insert.run(k, v);
    });
    tx();
    console.log("  Banco inicializado com parâmetros padrão.");
  }
}

autoSeed();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log(`\n  CCA System rodando em http://${HOST}:${PORT}\n`);
});
