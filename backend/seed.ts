// seed json file
import fs from "fs";
import { Database } from "bun:sqlite";

const db = new Database("db.sqlite");

// Create table with proper schema
db.query(
  "CREATE TABLE IF NOT EXISTS seeded_rocks (name TEXT, density REAL);",
).run();

const data = JSON.parse(fs.readFileSync("./new_data.json").toString());

// Use prepared statement to prevent SQL injection
const insertStmt = db.prepare(
  "INSERT INTO seeded_rocks (name, density) VALUES (?, ?)",
);

for (const d of data) {
  insertStmt.run(d.name, d.density);
}
