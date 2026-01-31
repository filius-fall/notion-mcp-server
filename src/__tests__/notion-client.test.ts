import { describe, expect, it } from "vitest";
import { createNotionClient } from "../notion/client.js";

describe("notion client", () => {
  it("requires NOTION_TOKEN", () => {
    const original = process.env.NOTION_TOKEN;
    delete process.env.NOTION_TOKEN;

    expect(() => createNotionClient()).toThrow("NOTION_TOKEN is required");

    if (original) {
      process.env.NOTION_TOKEN = original;
    }
  });
});
