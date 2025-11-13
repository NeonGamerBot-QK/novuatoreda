// seed json file 
import fs from 'fs'
import { Database } from "bun:sqlite";
const db = new Database("db.sqlite");
db.query("CREATE TABLE IF NOT EXISTS")
const data = JSON.parse(fs.readFileSync("./new_data.json").toString())

for (const d of data) {
    db.query(`insert (${d.name}, ${d.density})`)
}