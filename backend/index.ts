// bun sqlite
import express from "express"
import { Database } from "bun:sqlite";


const db = new Database("db.sqlite");
const app = express()


app.get('/space_rocks', async (req, res) => {
    const queried = await db.query("select * from seeded_rocks;").all()
    res.send(queried)
})
app.listen(process.env.PORT || 3000, () => {
    console.log(`app uppies`)
})
