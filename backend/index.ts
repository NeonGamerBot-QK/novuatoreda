// bun sqlite
import express from "express";
import { Database } from "bun:sqlite";

const db = new Database("db.sqlite");
const app = express();
const registerUserTransaction = db.prepare(
  "INSERT INTO users (name, password_hash) VALUES (?, ?)",
);

app.get("/space_rocks", async (req, res) => {
  const queried = await db.query("select * from seeded_rocks;").all();
  res.send(queried);
});

app.post("/register_account", async (req, res) => {
  const { name, passhash } = req.body;
  try {
    await registerUserTransaction.run(name, passhash);
    res.status(201).json({ message: "OK, created :)" });
  } catch (e) {
    res.status(500).json({ e });
  }
});

app.post("/login", (req, res) => {});
app.listen(process.env.PORT || 3000, () => {
  console.log(`app uppies`);
});
