import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod";
import { createNotionClient } from "./client.js";

const jsonText = (value: unknown) => JSON.stringify(value);

export const registerNotionTools = (server: McpServer) => {
  server.registerTool(
    "notion.databases.retrieve",
    {
      description:
        "Retrieve a Notion database by id. Use when user wants to see database schema, properties, or structure of a Notion database.",
      inputSchema: z.object({
        database_id: z.string(),
      }),
    },
    async ({ database_id }) => {
      const notion = createNotionClient();
      const result = await notion.request<Record<string, unknown>>({
        path: `databases/${database_id}`,
        method: "get",
      });
      return {
        content: [{ type: "text", text: jsonText(result) }],
        structuredContent: result,
      };
    }
  );

  server.registerTool(
    "notion.databases.create",
    {
      description:
        "Create a new Notion database with custom schema. Use when user wants to create a new database/table in Notion.",
      inputSchema: z.object({
        parent: z.record(z.string(), z.unknown()),
        title: z.array(
          z.object({
            type: z.string(),
            text: z.object({
              content: z.string(),
            }),
          })
        ),
        properties: z.record(z.string(), z.unknown()),
      }),
    },
    async ({ parent, title, properties }) => {
      const notion = createNotionClient();
      const result = await notion.request<Record<string, unknown>>({
        path: "databases",
        method: "post",
        body: {
          parent,
          title,
          properties,
        },
      });
      return {
        content: [{ type: "text", text: jsonText(result) }],
        structuredContent: result,
      };
    }
  );

  server.registerTool(
    "notion.databases.query",
    {
      description:
        "Query a Notion database to retrieve pages/entries. Use when user wants to list, search, or filter entries in a Notion database.",
      inputSchema: z.object({
        database_id: z.string(),
        filter: z.unknown().optional(),
        sorts: z.array(z.unknown()).optional(),
        start_cursor: z.string().optional(),
        page_size: z.number().optional(),
      }),
    },
    async ({ database_id, filter, sorts, start_cursor, page_size }) => {
      const notion = createNotionClient();
      const result = await notion.request<Record<string, unknown>>({
        path: `databases/${database_id}/query`,
        method: "post",
        body: {
          filter,
          sorts,
          start_cursor,
          page_size,
        },
      });

      return {
        content: [{ type: "text", text: jsonText(result) }],
        structuredContent: result,
      };
    }
  );

  server.registerTool(
    "notion.databases.update",
    {
      description:
        "Update a Notion database schema, title, or properties. Use when user wants to modify database structure.",
      inputSchema: z.object({
        database_id: z.string(),
        title: z
          .array(
            z.object({
              type: z.string(),
              text: z.object({
                content: z.string(),
              }),
            })
          )
          .optional(),
        description: z.array(z.unknown()).optional(),
        properties: z.record(z.string(), z.unknown()).optional(),
      }),
    },
    async ({ database_id, title, description, properties }) => {
      const notion = createNotionClient();
      const body: Record<string, unknown> = {};
      if (title) body.title = title;
      if (description) body.description = description;
      if (properties) body.properties = properties;

      const result = await notion.request<Record<string, unknown>>({
        path: `databases/${database_id}`,
        method: "patch",
        body,
      });

      return {
        content: [{ type: "text", text: jsonText(result) }],
        structuredContent: result,
      };
    }
  );

  server.registerTool(
    "notion.pages.retrieve",
    {
      description:
        "Retrieve a Notion page by id. Use when user wants to read page properties or content.",
      inputSchema: z.object({
        page_id: z.string(),
      }),
    },
    async ({ page_id }) => {
      const notion = createNotionClient();
      const result = await notion.request<Record<string, unknown>>({
        path: `pages/${page_id}`,
        method: "get",
      });
      return {
        content: [{ type: "text", text: jsonText(result) }],
        structuredContent: result,
      };
    }
  );

  server.registerTool(
    "notion.pages.create",
    {
      description:
        "Create a new page in Notion. Use when user says 'save to notion', 'create page', 'notion this', 'add to notion', or wants to store data in Notion.",
      inputSchema: z.object({
        parent: z.record(z.string(), z.unknown()),
        properties: z.record(z.string(), z.unknown()),
        children: z.array(z.unknown()).optional(),
      }),
    },
    async ({ parent, properties, children }) => {
      const notion = createNotionClient();
      const result = await notion.request<Record<string, unknown>>({
        path: "pages",
        method: "post",
        body: {
          parent,
          properties,
          children,
        },
      });

      return {
        content: [{ type: "text", text: jsonText(result) }],
        structuredContent: result,
      };
    }
  );

  server.registerTool(
    "notion.pages.update",
    {
      description:
        "Update a Notion page properties. Use when user wants to modify existing page data.",
      inputSchema: z.object({
        page_id: z.string(),
        properties: z.record(z.string(), z.unknown()),
      }),
    },
    async ({ page_id, properties }) => {
      const notion = createNotionClient();
      const result = await notion.request<Record<string, unknown>>({
        path: `pages/${page_id}`,
        method: "patch",
        body: {
          properties,
        },
      });

      return {
        content: [{ type: "text", text: jsonText(result) }],
        structuredContent: result,
      };
    }
  );

  server.registerTool(
    "notion.pages.delete",
    {
      description:
        "Archive/delete a Notion page. Use when user wants to remove or delete a page from Notion.",
      inputSchema: z.object({
        page_id: z.string(),
      }),
    },
    async ({ page_id }) => {
      const notion = createNotionClient();
      const result = await notion.request<Record<string, unknown>>({
        path: `pages/${page_id}/archive`,
        method: "post",
      });

      return {
        content: [{ type: "text", text: jsonText(result) }],
        structuredContent: result,
      };
    }
  );

  server.registerTool(
    "notion.blocks.children.list",
    {
      description:
        "Retrieve children of a block (page content/body). Use when user wants to read page content beyond properties.",
      inputSchema: z.object({
        block_id: z.string(),
        start_cursor: z.string().optional(),
        page_size: z.number().optional(),
      }),
    },
    async ({ block_id, start_cursor, page_size }) => {
      const notion = createNotionClient();
      const query: Record<string, string | number> = {};
      if (start_cursor) query.start_cursor = start_cursor;
      if (page_size) query.page_size = page_size;

      const result = await notion.request<Record<string, unknown>>({
        path: `blocks/${block_id}/children`,
        method: "get",
        query,
      });

      return {
        content: [{ type: "text", text: jsonText(result) }],
        structuredContent: result,
      };
    }
  );

  server.registerTool(
    "notion.blocks.children.append",
    {
      description:
        "Append content blocks to a page or block. Use when user wants to add paragraphs, headings, lists, or other content to a page.",
      inputSchema: z.object({
        block_id: z.string(),
        children: z.array(z.record(z.string(), z.unknown())),
      }),
    },
    async ({ block_id, children }) => {
      const notion = createNotionClient();
      const result = await notion.request<Record<string, unknown>>({
        path: `blocks/${block_id}/children`,
        method: "patch",
        body: {
          children,
        },
      });

      return {
        content: [{ type: "text", text: jsonText(result) }],
        structuredContent: result,
      };
    }
  );

  server.registerTool(
    "notion.blocks.update",
    {
      description:
        "Update a block's content. Use when user wants to edit existing page content blocks.",
      inputSchema: z.object({
        block_id: z.string(),
        block: z.record(z.string(), z.unknown()),
      }),
    },
    async ({ block_id, block }) => {
      const notion = createNotionClient();
      const result = await notion.request<Record<string, unknown>>({
        path: `blocks/${block_id}`,
        method: "patch",
        body: block,
      });

      return {
        content: [{ type: "text", text: jsonText(result) }],
        structuredContent: result,
      };
    }
  );

  server.registerTool(
    "notion.blocks.delete",
    {
      description: "Archive/delete a block. Use when user wants to remove content from a page.",
      inputSchema: z.object({
        block_id: z.string(),
      }),
    },
    async ({ block_id }) => {
      const notion = createNotionClient();
      const result = await notion.request<Record<string, unknown>>({
        path: `blocks/${block_id}`,
        method: "delete",
      });

      return {
        content: [{ type: "text", text: jsonText(result) }],
        structuredContent: result,
      };
    }
  );
};
