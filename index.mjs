import express from 'express';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// MySQL pool using environment variables
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

// Express settings
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Home route (Quote Finder page)
app.get("/", async (req, res) => {
  try {
    const [authors] = await pool.query("SELECT * FROM q_authors ORDER BY lastName");
    res.render("index", { authors });
  } catch (err) {
    console.error("❌ Error loading homepage:", err.message);
    res.status(500).send("Internal Server Error");
  }
});

// Search by keyword
app.get("/searchByKeyword", async (req, res) => {
    try {
      const keyword = req.query.keyword;
      console.log("🔍 Searching for keyword:", keyword);
  
      if (!keyword || keyword.trim() === "") {
        return res.send("Please enter a valid keyword.");
      }
  
      const [quotes] = await pool.query(
        `SELECT q.quote, a.firstName, a.lastName, c.category 
         FROM q_quotes q
         JOIN q_authors a ON q.authorId = a.authorId
         JOIN q_categories c ON q.categoryId = c.categoryId
         WHERE q.quote LIKE ?`,
        [`%${keyword}%`]
      );
  
      console.log("✅ Search results:", quotes);
  
      res.render("quoteList", { quotes });
    } catch (err) {
      console.error("❌ Error in /searchByKeyword:", err.message);
      res.status(500).send("Internal Server Error: " + err.message);
    }
  });

// Search by author
app.get("/searchByAuthor", async (req, res) => {
  const authorId = req.query.authorId;
  try {
    const [results] = await pool.query(
      `SELECT quote FROM q_quotes WHERE authorId = ?`,
      [authorId]
    );
    res.render("results", { results });
  } catch (err) {
    console.error("❌ Author search failed:", err.message);
    res.status(500).send("Internal Server Error");
  }
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});