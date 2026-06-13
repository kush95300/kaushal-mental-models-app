.PHONY: help deploy dev build docker compose k8s helm

help: ## Display this help menu
	@echo "========================================================="
	@echo "   🚀 Mental Models Monolith - Makefile Helper           "
	@echo "========================================================="
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

deploy: ## Launch the interactive deployment script
	@bash scripts/deploy.sh

dev: ## Run local development server
	npm run dev

build: ## Build Next.js production bundle
	npm run build

docker: ## Build standalone Docker image
	docker build -t kaushal-mental-models:latest -f deployment/docker/Dockerfile .

compose: ## Start Docker Compose multi-container environment using remote registry image
	docker compose -f deployment/docker-compose/docker-compose.yml pull
	docker compose -f deployment/docker-compose/docker-compose.yml up -d

app-update: ## Back up database, pull the latest registry image and hot-reload container (retains persistent volume)
	@echo "💾 Creating database volume backup on the host..."
	docker cp kaushal-mental-models-app:/app/data/dev.db ./dev_db_backup_before_update.db || true
	@echo "📥 Pulling latest image from registry..."
	docker compose -f deployment/docker-compose/docker-compose.yml pull
	@echo "🚀 Restarting containers..."
	docker compose -f deployment/docker-compose/docker-compose.yml up -d

k8s: ## Apply Vanilla Kubernetes manifests
	kubectl apply -f deployment/k8s/configmap.yaml
	kubectl apply -f deployment/k8s/deployment.yaml
	kubectl apply -f deployment/k8s/service.yaml
	kubectl apply -f deployment/k8s/ingress.yaml

helm: ## Deploy Helm chart to production namespace
	helm upgrade --install mental-models-app ./deployment/helm/kaushal-mental-models --namespace production --create-namespace
