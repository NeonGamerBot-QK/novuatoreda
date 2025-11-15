// bun sqlite
import express from "express";
import { Database } from "bun:sqlite";

const db = new Database("db.sqlite");
const app = express();
const registerUserTransaction = db.prepare(
  "INSERT INTO users (name, password_hash) VALUES (?, ?)",
);
const getUserByUserName = db.prepare(
  `select * from users where name = ?`
)

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

async function loginMiddleware(req, res, next) {
  const authHeader = req.headers["Authorization"]
  if (!authHeader) {
    return res.status(401).json({
      message: "no auth key??"
    })
  }
  // extract password and name from auth header
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [name, password] = credentials.split(':');
  if (!name || !password) {
    return res.status(403).json({
      message: "no user or pass??"
    })

  }
  // get user by username
  const userData = await getUserByUserName.get(name)
  req.userData = userData
  if (!userData) {
    return res.status(403).json({
      message: "no user??"
    })
  }
  // check password hash
  //@ts-ignore shut yo ass up old sport
  const isValidPass = Bun.password.verifySync(password, userData.password_hash!)
  if (isValidPass) {
    next()
  } else {
    res.status(401).json({
      message: "bad password ;p"
    })
  }
}
app.post('/get_my_server_info', loginMiddleware, (req, res) => {
  //@ts-ignore
  res.json(req.userData!)
})
// todo: socket io
app.listen(process.env.PORT || 3000, () => {
  console.log(`app uppies`);
});