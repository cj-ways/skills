import { describe, it, expect } from "vitest";
import { getUsers, getUserById, createUser } from "../src/users.js";

describe("getUsers", () => {
  it("returns all users", () => {
    const users = getUsers();
    expect(users.length).toBeGreaterThanOrEqual(2);
  });
});

describe("getUserById", () => {
  it("returns user when found", () => {
    const user = getUserById(1);
    expect(user).not.toBeNull();
    expect(user.name).toBe("Alice");
  });

  it("returns null when not found", () => {
    const user = getUserById(999);
    expect(user).toBeNull();
  });
});

describe("createUser", () => {
  it("creates a user with valid input", () => {
    const user = createUser("Charlie", "charlie@example.com");
    expect(user).toHaveProperty("id");
    expect(user.name).toBe("Charlie");
  });

  it("throws on missing name", () => {
    expect(() => createUser(null, "test@example.com")).toThrow("Name and email required");
  });
});
