import { db } from "../db.js";

// SAFE: This uses parameterized queries — should NOT be flagged
export function getPost(req, res) {
  const postId = req.params.id;
  db.query("SELECT * FROM posts WHERE id = ?", [postId], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(results[0]);
  });
}

// SAFE: Parameterized insert
export function createPost(req, res) {
  const { title, body, authorId } = req.body;
  db.query(
    "INSERT INTO posts (title, body, author_id) VALUES (?, ?, ?)",
    [title, body, authorId],
    (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.status(201).json({ id: result.insertId });
    }
  );
}
