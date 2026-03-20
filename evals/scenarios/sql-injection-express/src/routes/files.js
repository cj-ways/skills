import { readFileSync } from "fs";
import { join } from "path";

export function getFile(req, res) {
  const filename = req.params.filename;
  // VULN: Path traversal — user can pass ../../etc/passwd
  const filepath = join("/uploads", filename);
  try {
    const content = readFileSync(filepath, "utf-8");
    res.send(content);
  } catch {
    res.status(404).json({ error: "File not found" });
  }
}
