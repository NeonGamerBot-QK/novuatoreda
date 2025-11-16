// bun sqlite
import express from "express";
import { Database } from "bun:sqlite";
import http from "http";
import { Server } from "socket.io";
const db = new Database("db.sqlite");
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const registerUserTransaction = db.prepare(
  "INSERT INTO users (name, password_hash) VALUES (?, ?)",
);
const getUserByUserName = db.prepare(`select * from users where name = ?`);

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
  const authHeader = req.headers["Authorization"];
  if (!authHeader) {
    return res.status(401).json({
      message: "no auth key??",
    });
  }
  // extract password and name from auth header
  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "utf-8",
  );
  const [name, password] = credentials.split(":");
  if (!name || !password) {
    return res.status(403).json({
      message: "no user or pass??",
    });
  }
  // get user by username
  const userData = await getUserByUserName.get(name);
  req.userData = userData;
  if (!userData) {
    return res.status(403).json({
      message: "no user??",
    });
  }
  // check password hash
  //@ts-ignore shut yo ass up old sport
  const isValidPass = Bun.password.verifySync(
    password,
    userData.password_hash!,
  );
  if (isValidPass) {
    next();
  } else {
    res.status(401).json({
      message: "bad password ;p",
    });
  }
}

app.post("/get_my_server_info", loginMiddleware, (req, res) => {
  //@ts-ignore
  res.json(req.userData!);
});
const active_users: any[] = [];

// Socket.IO auth middleware
io.use(async (socket, next) => {
  console.debug(`socket auth`);
  const authHeader = socket.handshake.headers["authorization"];
  if (!authHeader) {
    return next(new Error("no auth key??"));
  }

  const base64Credentials = authHeader.split(" ")[1];
  const credentials = Buffer.from(base64Credentials, "base64").toString(
    "utf-8",
  );
  const [name, password] = credentials.split(":");

  if (!name || !password) {
    return next(new Error("no user or pass??"));
  }

  const userData = await getUserByUserName.get(name);
  if (!userData) {
    return next(new Error("no user??"));
  }

  //@ts-ignore shut yo ass up old sport
  const isValidPass = Bun.password.verifySync(
    password,
    //@ts-ignore
    userData.password_hash!,
  );
  if (isValidPass) {
    socket.data.user = userData;
    next();
  } else {
    next(new Error("bad password ;p"));
  }
});

io.on("connection", (socket) => {
  const user = socket.data.user;
  console.log(`User ${user.name} connected`);
  active_users.push(user);

  socket.on("disconnect", () => {
    const index = active_users.findIndex((u) => u.id === user.id);
    if (index !== -1) active_users.splice(index, 1);
  });
});
server.listen(process.env.PORT || 3000, () => {
  console.log(`app uppies`);
});
