/**
 * Unit tests for the user.ini parser.
 *
 * @module
 */
import { describe, expect, it } from "vitest";
import { parseUsers } from "./load-users";

describe("parseUsers", () => {
  it("parses sections with name and password", () => {
    const users = parseUsers("[Admin]\npw = 1234\n\n[B1]\nname = Anna\npw = Locked\n");
    expect(users).toEqual({
      Admin: { pw: "1234" },
      B1: { name: "Anna", pw: "Locked" },
    });
  });

  it("creates empty users for sections without entries and skips blank values", () => {
    const users = parseUsers("[B2]\nname = \npw = \n");
    expect(users.B2).toEqual({});
  });

  it("ignores comments and blank lines", () => {
    const users = parseUsers("; a comment\n# another\n\n[Host]\npw = 99\n");
    expect(users.Host).toEqual({ pw: "99" });
  });

  it("trims whitespace around keys and values", () => {
    const users = parseUsers("[Local]\n   pw   =   12   \n");
    expect(users.Local).toEqual({ pw: "12" });
  });
});
