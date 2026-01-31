IMAGE_NAME ?= notion-mcp
CONTAINER_NAME ?= notion-mcp
PORT ?= 43000

.PHONY: install build test dev docker-build docker-run docker-stop docker-logs docker-shell compose-up compose-down compose-logs

install:
	npm install

build:
	npm run build

test:
	npm test

dev:
	npm run dev

docker-build:
	docker build -t $(IMAGE_NAME) .

docker-run:
	docker run --rm -d \
		--name $(CONTAINER_NAME) \
		-p $(PORT):43000 \
		-e NOTION_TOKEN=$$NOTION_TOKEN \
		-e NOTION_API_VERSION=$$NOTION_API_VERSION \
		-e MCP_HOST=0.0.0.0 \
		-e MCP_PORT=43000 \
		$(IMAGE_NAME)

docker-stop:
	docker stop $(CONTAINER_NAME)

docker-logs:
	docker logs -f $(CONTAINER_NAME)

docker-shell:
	docker exec -it $(CONTAINER_NAME) sh

compose-up:
	docker compose up -d

compose-down:
	docker compose down

compose-logs:
	docker compose logs -f
