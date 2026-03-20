const users = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" },
];

export function getUsers() {
  return users;
}

export function getUserById(id) {
  return users.find((u) => u.id === id) || null;
}

export function createUser(name, email) {
  if (!name || !email) throw new Error("Name and email required");
  const user = { id: users.length + 1, name, email };
  users.push(user);
  return user;
}
