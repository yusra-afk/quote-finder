import express from 'express';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

//environment variables in Render
const pool = mysql.createPool({
    host: process.env.DB_HOST,        // e.g., u6354r3es4optspf.cbetxkdyhwsb.us-east-1.rds.amazonaws.com
    user: process.env.DB_USER,        // e.g., mp26jo8kppunxiix
    password: process.env.DB_PASSWORD,// from Canvas
    database: process.env.DB_NAME,    // jkvs50o7ha454ro4
    waitForConnections: true,
    connectionLimit: 10
});

// Test Route
app.get("/dbTest", async (req, res) => {
    const conn = await pool.getConnection();
    const [rows] = await conn.query("SELECT CURDATE()");
    res.send(rows);
    conn.release();
});

// Homepage
app.get("/", (req, res) => {
    res.send("Hello Express app!");
});

app.listen(port, () => {
    console.log(`Express server running at http://localhost:${port}`);
});