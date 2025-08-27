const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho para o arquivo do banco
const dbPath = path.join(__dirname, '../../database/delivery.db');

// Criação da conexão com o banco
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar com o banco:', err.message);
  } else {
    console.log('✅ Conectado ao banco SQLite');
  }
});

// Habilitar foreign keys
db.run('PRAGMA foreign_keys = ON');

// Configurar timezone para Brasil (GMT-3)
db.run("PRAGMA timezone = 'America/Sao_Paulo'");

// Função para executar queries com promessa
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Função para executar uma única query (INSERT, UPDATE, DELETE)
const runCommand = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({
          id: this.lastID,
          changes: this.changes
        });
      }
    });
  });
};

// Função para obter uma única linha
const getOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

module.exports = {
  db,
  runQuery,
  runCommand,
  getOne
};
