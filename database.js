const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = path.join(__dirname, "data", "cca.db");

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initTables();
  }
  return db;
}

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS params (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS emissions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      numero      INTEGER NOT NULL,
      ano         INTEGER NOT NULL,
      siged       TEXT DEFAULT '',
      razao       TEXT NOT NULL,
      cnpj        TEXT DEFAULT '',
      final       TEXT DEFAULT '',
      intermed    TEXT DEFAULT '',
      placas      TEXT DEFAULT '',
      secretario  TEXT DEFAULT '',
      gerente     TEXT DEFAULT '',
      setor       TEXT DEFAULT '',
      sigla       TEXT DEFAULT '',
      created_at  TEXT DEFAULT (datetime('now', '-3 hours'))
    );
  `);
}

module.exports = { getDb };
