import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createNotionClient, getNotionConfig } from "./notion/client.js";
import { registerNotionTools } from "./notion/handlers.js";

const jsonText = (value: unknown) => JSON.stringify(value);

async function main() {
  const server = new McpServer(
    {
      name: "notion-mcp",
      version: "0.1.0"
    },
    {
      capabilities: {
        logging: {}
      }
    }
  );

  registerNotionTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  if (process.env.MCP_LOG_LEVEL !== "silent") {
    console.error("Notion MCP server (stdio) started");
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
