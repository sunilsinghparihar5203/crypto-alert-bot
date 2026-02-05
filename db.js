import sqlite3 from 'sqlite3';
import path from 'path';

const db = new sqlite3.Database(path.resolve('alerts.db'));

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY,
      user_id TEXT,
      symbol TEXT,
      price REAL,
      direction TEXT
    )
  `);
});

export default db;
