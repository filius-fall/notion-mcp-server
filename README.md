# Notion MCP Server (Hybrid)

Stateless Notion MCP server with a hybrid deployment model:

- Central home server exposed over Tailscale only
- Local fallback on each Linux device

Brief downtime is acceptable during manual switchovers.

## Requirements

- Node.js 18+
- Tailscale (central server)
- Notion integration token shared with the target database

## Setup

```bash
npm install
npm run build
```

## Docker

Build the image:

```bash
docker build -t notion-mcp .
```

Run the container:

```bash
docker run --rm -d \
  --name notion-mcp \
  -p 43000:43000 \
  -e NOTION_TOKEN=$NOTION_TOKEN \
  -e NOTION_API_VERSION=$NOTION_API_VERSION \
  -e MCP_HOST=0.0.0.0 \
  -e MCP_PORT=43000 \
  notion-mcp
```

Makefile shortcuts:

```bash
make docker-build
make docker-run
```

## Docker Compose (Local MCP)

Create a local `.env` file with your Notion token:

```bash
NOTION_TOKEN=...
NOTION_API_VERSION=2022-06-28
MCP_PORT=43000
```

Build the image once:

```bash
docker build -t notion-mcp .
```

Start local MCP:

```bash
docker compose up -d
```

Stop local MCP:

```bash
docker compose down
```

## Environment Variables

Required:

- `NOTION_TOKEN`
- `NOTION_TEST_DATABASE_ID`

Optional:

- `NOTION_API_VERSION` (default: `2022-06-28`)
- `MCP_HOST` (default: `127.0.0.1`)
- `MCP_PORT` (default: `43000`)
- `MCP_LOG_LEVEL` (default: `info`)

## Runbook

### Manual Switch

```bash
cp configs/opencode-central.json ~/.config/opencode/mcp.json
cp configs/opencode-local.json ~/.config/opencode/mcp.json
```

If the remote MCP is down, start the local MCP with Docker Compose and switch configs:

```bash
docker compose up -d
cp configs/opencode-local.json ~/.config/opencode/mcp.json
```

Rollback: restore the previous config from `~/.config/opencode/mcp.json.bak`.

### Manual Update (Docker)

```bash
git pull
docker build -t notion-mcp .
```

Restart the service:

```bash
systemctl restart notion-mcp.service
systemctl restart notion-mcp-local.service
```

Rollback: `git checkout <last_good_tag>`.

### Tailscale Serve (Central Server)

```bash
tailscale serve tcp 43000 localhost:43000
```

## Local Services

Systemd unit files are in `systemd/` (Docker-based):

- `systemd/notion-mcp.service`
- `systemd/notion-mcp-local.service`

Create environment files at:

- `/etc/notion-mcp.env`
- `/etc/notion-mcp-local.env`
