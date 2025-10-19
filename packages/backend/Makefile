.PHONY: build run test migrate docker-up docker-down

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
	go run scripts/migrate/main.go

# 启动 Docker 服务
docker-up:
	docker-compose up -d

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

# 开发环境完整启动
dev: docker-up run