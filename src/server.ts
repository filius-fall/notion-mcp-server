import { config } from "dotenv";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import type { Request, Response } from "express";
import { createNotionClient, getNotionConfig } from "./notion/client.js";
import { registerNotionTools } from "./notion/handlers.js";

config();

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 43000;

const getConfig = () => {
  const host = process.env.MCP_HOST ?? DEFAULT_HOST;
  const portValue = process.env.MCP_PORT ?? String(DEFAULT_PORT);
  const port = Number(portValue);
  const logLevel = process.env.MCP_LOG_LEVEL ?? "info";

  return {
    host,
    port: Number.isNaN(port) ? DEFAULT_PORT : port,
    logLevel,
  };
};

const createServer = () => {
  const server = new McpServer(
    {
      name: "notion-mcp",
      version: "0.1.0",
    },
    {
      capabilities: {
        logging: {},
      },
    }
  );

  registerNotionTools(server);
  return server;
};

type TransportEntry = {
  transport: SSEServerTransport;
  server: McpServer;
};

const respondPing = (req: Request, res: Response) => {
  const id = req.body?.id ?? null;
  res.json({
    jsonrpc: "2.0",
    id,
    result: {
      status: "ok",
    },
  });
};

export const createApp = () => {
  const { host } = getConfig();
  const app = createMcpExpressApp({ host });
  const transports = new Map<string, TransportEntry>();

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/notion/ping", async (_req, res) => {
    try {
      const notion = createNotionClient();
      await notion.users.list({ page_size: 1 });
      const { notionVersion } = getNotionConfig();
      res.json({ connected: true, version: notionVersion });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(500).json({ connected: false, error: message });
    }
  });

  app.get("/mcp/events", async (_req, res) => {
    const transport = new SSEServerTransport("/mcp", res);
    const server = createServer();
    transports.set(transport.sessionId, { transport, server });

    transport.onclose = () => {
      transports.delete(transport.sessionId);
    };

    await server.connect(transport);
  });

  app.post("/mcp", async (req, res) => {
    if (req.body?.method === "ping") {
      respondPing(req, res);
      return;
    }

    const sessionId = req.query.sessionId;
    if (typeof sessionId !== "string") {
      res.status(400).send("Missing sessionId parameter");
      return;
    }

    const entry = transports.get(sessionId);
    if (!entry) {
      res.status(404).send("Session not found");
      return;
    }

    await entry.transport.handlePostMessage(req, res, req.body);
  });

  return app;
};

export const startServer = () => {
  const { host, port, logLevel } = getConfig();
  const app = createApp();

  return app.listen(port, host, () => {
    if (logLevel !== "silent") {
      console.log(`Notion MCP server listening on http://${host}:${port}`);
    }
  });
};

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
