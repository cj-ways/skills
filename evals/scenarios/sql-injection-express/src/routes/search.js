export function search(req, res) {
  const query = req.query.q;

  // VULN: Reflected XSS — user input directly in HTML
  res.send(`<h1>Search results for: ${query}</h1><div>No results found.</div>`);
}
