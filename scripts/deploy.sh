#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -e

# Colors for rich formatting
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo -e "${CYAN}${BOLD}=====================================================${NC}"
echo -e "${CYAN}${BOLD}  🚀 Mental Models Monolith - Interactive Deployment ${NC}"
echo -e "${CYAN}${BOLD}=====================================================${NC}"
echo ""

echo -e "${YELLOW}Please select your preferred deployment method:${NC}"
echo -e "  ${BOLD}1)${NC} Standalone Docker Container"
echo -e "  ${BOLD}2)${NC} Docker Compose (Recommended for Single-Host)"
echo -e "  ${BOLD}3)${NC} Vanilla Kubernetes Manifests"
echo -e "  ${BOLD}4)${NC} Helm Chart (Recommended for Enterprise K8s)"
echo -e "  ${BOLD}5)${NC} Local Development Server (npm run dev)"
echo -e "  ${BOLD}q)${NC} Quit"
echo ""

read -p "Enter your choice [1-5 or q]: " choice

case $choice in
  1)
    echo -e "\n${CYAN}[Option 1] Deploying via Standalone Docker Container...${NC}"
    read -p "Enter Docker image name [default: kaushal-mental-models:latest]: " img_name
    img_name=${img_name:-kaushal-mental-models:latest}
    read -p "Enter host port to bind [default: 3000]: " port
    port=${port:-3000}

    echo -e "\n${YELLOW}Building Docker image '${img_name}'...${NC}"
    docker build -t "${img_name}" -f deployment/docker/Dockerfile .

    echo -e "\n${YELLOW}Running container on port ${port}...${NC}"
    # Stop existing container if present
    docker stop mental-models-app 2>/dev/null || true
    docker rm mental-models-app 2>/dev/null || true

    echo -e "\n${YELLOW}Ensuring docker volume 'kaushal-db-volume' exists...${NC}"
    docker volume create kaushal-db-volume >/dev/null

    docker run -d -p "${port}:3000" -v kaushal-db-volume:/app/prisma -e JWT_SECRET=super-secret-production-key-change-me --name mental-models-app "${img_name}"
    echo -e "\n${GREEN}✔ Standalone Docker container successfully deployed at http://localhost:${port}${NC}"
    ;;
  
  2)
    echo -e "\n${CYAN}[Option 2] Deploying via Docker Compose...${NC}"
    echo -e "${YELLOW}Starting multi-container environment with persistent SQLite volume...${NC}"
    docker compose -f deployment/docker-compose/docker-compose.yml up -d --build
    echo -e "\n${GREEN}✔ Docker Compose deployment successfully launched at http://localhost:3000${NC}"
    read -p "Do you want to view real-time logs now? (y/n) [default: n]: " show_logs
    if [[ "$show_logs" =~ ^[Yy]$ ]]; then
      docker compose -f deployment/docker-compose/docker-compose.yml logs -f
    fi
    ;;
  
  3)
    echo -e "\n${CYAN}[Option 3] Deploying via Vanilla Kubernetes Manifests...${NC}"
    read -p "Ensure your kubectl is configured correctly. Proceed? (y/n) [default: y]: " k8s_proc
    k8s_proc=${k8s_proc:-y}
    if [[ "$k8s_proc" =~ ^[Yy]$ ]]; then
      echo -e "\n${YELLOW}Applying K8s ConfigMap, PVC, Deployment, Service, and Ingress...${NC}"
      kubectl apply -f deployment/k8s/configmap.yaml
      kubectl apply -f deployment/k8s/deployment.yaml
      kubectl apply -f deployment/k8s/service.yaml
      kubectl apply -f deployment/k8s/ingress.yaml
      echo -e "\n${GREEN}✔ Vanilla Kubernetes manifests successfully applied!${NC}"
      echo -e "Run 'kubectl get pods -l app=kaushal-mental-models' to check pod status."
    else
      echo -e "${YELLOW}Deployment aborted.${NC}"
    fi
    ;;
  
  4)
    echo -e "\n${CYAN}[Option 4] Deploying via Helm Chart...${NC}"
    read -p "Enter Kubernetes namespace for deployment [default: production]: " ns
    ns=${ns:-production}
    read -p "Enter Helm release name [default: mental-models-app]: " rel_name
    rel_name=${rel_name:-mental-models-app}

    echo -e "\n${YELLOW}Installing/Upgrading Helm chart '${rel_name}' in namespace '${ns}'...${NC}"
    helm upgrade --install "${rel_name}" ./deployment/helm/kaushal-mental-models --namespace "${ns}" --create-namespace
    echo -e "\n${GREEN}✔ Helm chart successfully deployed!${NC}"
    echo -e "Run 'helm status ${rel_name} -n ${ns}' to verify release status."
    ;;

  5)
    echo -e "\n${CYAN}[Option 5] Starting Local Development Server...${NC}"
    echo -e "${YELLOW}Ensuring database schema is pushed...${NC}"
    npx prisma db push
    echo -e "\n${GREEN}Starting Next.js dev server...${NC}"
    npm run dev
    ;;

  [Qq]* )
    echo -e "\n${YELLOW}Exiting deployment menu.${NC}"
    exit 0
    ;;

  * )
    echo -e "\n${RED}Invalid selection. Please run the script again.${NC}"
    exit 1
    ;;
esac
