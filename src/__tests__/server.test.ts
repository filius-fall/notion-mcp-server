import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Server } from "node:http";
import { createApp } from "../server.js";

let server: Server;
let baseUrl: string;

const jsonRequest = async (url: string, body: Record<string, unknown>) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return response;
};

beforeAll(async () => {
  const app = createApp();
  server = app.listen(0);
  await new Promise<void>((resolve, reject) => {
    server.once("listening", () => resolve());
    server.once("error", error => reject(error));
  });

  const address = server.address();
  if (address && typeof address === "object") {
    baseUrl = `http://127.0.0.1:${address.port}`;
  }
});

afterAll(async () => {
  if (!server) {
    return;
  }

  await new Promise<void>(resolve => {
    server.close(() => resolve());
  });
});

describe("server", () => {
  it("responds to /health", async () => {
    const response = await fetch(`${baseUrl}/health`);
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toEqual({ status: "ok" });
  });

  it("responds to ping JSON-RPC", async () => {
    const response = await jsonRequest(`${baseUrl}/mcp`, {
      jsonrpc: "2.0",
      id: 1,
      method: "ping",
      params: {},
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.result).toEqual({ status: "ok" });
    expect(payload.id).toBe(1);
  });
});
