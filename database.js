const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./inventory.db', (err) => {
    if (err)
        console.error(err);
    else
        console.log('Connected to database');
});

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOCASE NOT NULL UNIQUE,
            password_hash TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            quantity INTEGER NOT NULL DEFAULT 1,
            owner_id INTEGER NOT NULL,

            FOREIGN KEY (owner_id)
                REFERENCES users(id)
                ON DELETE CASCADE
        )
    `);
});

module.exports = db;