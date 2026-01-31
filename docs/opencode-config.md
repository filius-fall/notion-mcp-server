# OpenCode MCP Configuration

## Config Location

OpenCode reads MCP configuration from:

`~/.config/opencode/mcp.json`

## Central Server (Tailscale)

```json
{
  "mcpServerUrl": "http://<tailscale-host>:3000/mcp"
}
```

## Local Fallback

```json
{
  "mcpServerUrl": "http://localhost:3000/mcp"
}
```

## Manual Switch

```bash
cp configs/opencode-central.json ~/.config/opencode/mcp.json
cp configs/opencode-local.json ~/.config/opencode/mcp.json
```
