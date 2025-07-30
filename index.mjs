import express from "express";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Setup view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// DB connection
const pool = mysql.createPool({
  host: "host",
  user: "your_user",
  password: "your_password",
  database: "your_database"
});

// Homepage: show search form and authors
app.get("/", async (req, res) => {
  const [authors] = await pool.query("SELECT authorId, firstName, lastName FROM q_authors ORDER BY lastName");
  res.render("index", { authors });
});

// Search by keyword
app.get("/searchByKeyword", async (req, res) => {
  const keyword = req.query.keyword || "";
  const [rows] = await pool.query(
    "SELECT quote, authorId, firstName, lastName FROM q_quotes NATURAL JOIN q_authors WHERE quote LIKE ?",
    [`%${keyword}%`]
  );
  res.render("results", { quotes: rows });
});

// Search by author
app.get("/searchByAuthor", async (req, res) => {
  const authorId = req.query.authorId;
  const [rows] = await pool.query(
    "SELECT quote, authorId, firstName, lastName FROM q_quotes NATURAL JOIN q_authors WHERE authorId = ?",
    [authorId]
  );
  res.render("results", { quotes: rows });
});

// Local API for author info
app.get("/api/author/:id", async (req, res) => {
  const authorId = req.params.id;
  const [rows] = await pool.query("SELECT * FROM q_authors WHERE authorId = ?", [authorId]);
  res.send(rows);
});

app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});