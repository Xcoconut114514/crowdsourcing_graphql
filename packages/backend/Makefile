.PHONY: build run test migrate docker-up docker-down clean

# 构建
build:
	go build -o bin/server cmd/server/main.go

# 运行
run:
	go run cmd/server/main.go

# 测试
test:
	go test -v ./...

# 数据库迁移
migrate:
	@echo "Running database migrations..."
	go run cmd/server/main.go --migrate

# 启动 Docker 服务
docker-up:
	docker-compose up -d postgres

# 停止 Docker 服务
docker-down:
	docker-compose down

# 安装依赖
deps:
	go mod download
	go mod tidy

# 代码格式化
fmt:
	go fmt ./...

# 代码检查
lint:
	golangci-lint run

# 清理
clean:
	rm -rf bin/
	go clean

# 完整的开发环境启动
dev: docker-up
	@echo "Waiting for database..."
	@sleep 5
	@echo "Starting backend..."
	@make run

# 查看日志
logs:
	docker-compose logs -f

# 重置数据库
reset-db:
	docker-compose down -v
	docker-compose up -d postgres
	@sleep 5
	@make run