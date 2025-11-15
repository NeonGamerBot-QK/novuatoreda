// seed database tables
import fs from "fs";
import { Database } from "bun:sqlite";

const db = new Database("db.sqlite");

// dump db before hand
// Create table with proper schema
db.query(
  "CREATE TABLE IF NOT EXISTS seeded_rocks (name TEXT, density REAL);",
).run();

const data = JSON.parse(fs.readFileSync("./new_data.json").toString());

const insertStmt = db.prepare(
  "INSERT INTO seeded_rocks (name, density) VALUES (?, ?)",
);

for (const d of data) {
  insertStmt.run(d.name, d.density);
}
// Create users table
db.query(
  `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`,
).run();

// Create trades table
db.query(
  `
  CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trade_name TEXT NOT NULL,
    items_traded TEXT NOT NULL,
    initiator_user_id INTEGER NOT NULL,
    users_involved TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (initiator_user_id) REFERENCES users(id)
  );
`,
).run();

console.log("Database tables created successfully");
db.close();
