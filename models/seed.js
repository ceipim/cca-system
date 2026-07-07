const { getDb } = require("../database");

const db = getDb();

const defaults = {
  sigla: "GPIN/DCI/SEDEC",
  secretario: "DARIO JOSÉ BRAGA PAIM",
  gerente: "MARLON JOSÉ LIMA DUTRA",
  setor: "Gerência de Projetos de Incentivos",
  contador: "24",
  ano: String(new Date().getFullYear()),
};

const insert = db.prepare(
  "INSERT OR REPLACE INTO params (key, value) VALUES (?, ?)"
);

const insertMany = db.transaction(() => {
  for (const [k, v] of Object.entries(defaults)) {
    insert.run(k, v);
  }
});

insertMany();

console.log("Banco inicializado com sucesso.");
console.log("Parâmetros padrão inseridos.");
