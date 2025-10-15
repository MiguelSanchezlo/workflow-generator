export const dockerTemplates = {
  azure: {
    acr: (options) => `name: Build and Push to Azure Container Registry

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  REGISTRY_NAME: 'your-registry'
  IMAGE_NAME: 'your-image'

jobs:
  build-and-push:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Login to Azure
        uses: azure/login@v2
        with:
          client-id: \${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: \${{ secrets.AZURE_TENANT_ID }}
          subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Login to ACR
        run: az acr login --name \${{ env.REGISTRY_NAME }}
      ${options.tests ? `
      - name: Run tests
        run: docker build --target test -t test-image .` : ''}

      - name: Build and push image
        run: |
          docker build -t \${{ env.REGISTRY_NAME }}.azurecr.io/\${{ env.IMAGE_NAME }}:\${{ github.sha }} .
          docker push \${{ env.REGISTRY_NAME }}.azurecr.io/\${{ env.IMAGE_NAME }}:\${{ github.sha }}
          docker tag \${{ env.REGISTRY_NAME }}.azurecr.io/\${{ env.IMAGE_NAME }}:\${{ github.sha }} \\
            \${{ env.REGISTRY_NAME }}.azurecr.io/\${{ env.IMAGE_NAME }}:latest
          docker push \${{ env.REGISTRY_NAME }}.azurecr.io/\${{ env.IMAGE_NAME }}:latest

      - name: Azure Logout
        if: always()
        run: az logout`,

    containerapp: (options) => `name: Deploy to Azure Container Apps

on:
  push:
    branches: [main]

env:
  CONTAINER_APP_NAME: 'your-app'
  RESOURCE_GROUP: 'your-rg'
  REGISTRY_NAME: 'your-registry'
  IMAGE_NAME: 'your-image'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Login to Azure
        uses: azure/login@v2
        with:
          client-id: \${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: \${{ secrets.AZURE_TENANT_ID }}
          subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Build and push to ACR
        run: |
          az acr build --registry \${{ env.REGISTRY_NAME }} \\
            --image \${{ env.IMAGE_NAME }}:\${{ github.sha }} .

      - name: Deploy to Container App
        run: |
          az containerapp update \\
            --name \${{ env.CONTAINER_APP_NAME }} \\
            --resource-group \${{ env.RESOURCE_GROUP }} \\
            --image \${{ env.REGISTRY_NAME }}.azurecr.io/\${{ env.IMAGE_NAME }}:\${{ github.sha }}`
  },

  aws: {
    ecr: (options) => `name: Build and Push to AWS ECR

on:
  push:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: your-repo
  IMAGE_TAG: \${{ github.sha }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: \${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
      ${options.tests ? `
      - name: Run tests
        run: docker build --target test -t test-image .` : ''}

      - name: Build, tag, and push image to Amazon ECR
        env:
          ECR_REGISTRY: \${{ steps.login-ecr.outputs.registry }}
        run: |
          docker build -t \$ECR_REGISTRY/\$ECR_REPOSITORY:\$IMAGE_TAG .
          docker push \$ECR_REGISTRY/\$ECR_REPOSITORY:\$IMAGE_TAG
          docker tag \$ECR_REGISTRY/\$ECR_REPOSITORY:\$IMAGE_TAG \$ECR_REGISTRY/\$ECR_REPOSITORY:latest
          docker push \$ECR_REGISTRY/\$ECR_REPOSITORY:latest`,

    ecs: (options) => `name: Deploy to AWS ECS

on:
  push:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: your-repo
  ECS_SERVICE: your-service
  ECS_CLUSTER: your-cluster
  CONTAINER_NAME: your-container

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: \${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push image
        id: build-image
        env:
          ECR_REGISTRY: \${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: \${{ github.sha }}
        run: |
          docker build -t \$ECR_REGISTRY/\$ECR_REPOSITORY:\$IMAGE_TAG .
          docker push \$ECR_REGISTRY/\$ECR_REPOSITORY:\$IMAGE_TAG
          echo "image=\$ECR_REGISTRY/\$ECR_REPOSITORY:\$IMAGE_TAG" >> $GITHUB_OUTPUT

      - name: Deploy to ECS
        run: |
          aws ecs update-service \\
            --cluster \${{ env.ECS_CLUSTER }} \\
            --service \${{ env.ECS_SERVICE }} \\
            --force-new-deployment`
  },

  dockerhub: {
    build: (options) => `name: Build and Push to Docker Hub

on:
  push:
    branches: [main]

env:
  IMAGE_NAME: your-username/your-image

jobs:
  build-and-push:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKERHUB_USERNAME }}
          password: \${{ secrets.DOCKERHUB_TOKEN }}
      ${options.tests ? `
      - name: Run tests
        run: docker build --target test -t test-image .` : ''}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            \${{ env.IMAGE_NAME }}:\${{ github.sha }}
            \${{ env.IMAGE_NAME }}:latest${options.cache ? "\n          cache-from: type=gha\n          cache-to: type=gha,mode=max" : ''}`
  }
};

export default dockerTemplates;
