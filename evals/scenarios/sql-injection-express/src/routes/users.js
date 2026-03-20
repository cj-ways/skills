import { db } from "../db.js";

export function getUser(req, res) {
  const userId = req.params.id;

  // VULN: SQL injection via string concatenation
  const query = "SELECT * FROM users WHERE id = '" + userId + "'";
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(results[0]);
  });
}

export function searchUsers(req, res) {
  const name = req.query.name;
  // VULN: SQL injection via template literal
  db.query(`SELECT * FROM users WHERE name LIKE '%${name}%'`, (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(results);
  });
}
