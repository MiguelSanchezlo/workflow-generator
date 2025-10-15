export const goTemplates = {
  azure: {
    webapp: (options) => `name: Deploy Go to Azure Web App

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  AZURE_WEBAPP_NAME: 'your-app-name'
  GO_VERSION: '1.21'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: \${{ env.GO_VERSION }}${options.cache ? "\n          cache: true" : ''}

      - name: Build application
        run: |
          go mod download
          go build -o app .
      ${options.tests ? `
      - name: Run tests
        run: go test ./...` : ''}

      - name: Login to Azure
        uses: azure/login@v2
        with:
          client-id: \${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: \${{ secrets.AZURE_TENANT_ID }}
          subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v3
        with:
          app-name: \${{ env.AZURE_WEBAPP_NAME }}
          package: .

      - name: Azure Logout
        if: always()
        run: az logout`,

    containerapp: (options) => `name: Deploy Go to Azure Container Apps

on:
  push:
    branches: [main]

env:
  AZURE_CONTAINER_APP_NAME: 'your-app'
  AZURE_RESOURCE_GROUP: 'your-rg'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.21'${options.cache ? "\n          cache: true" : ''}

      - name: Build
        run: |
          go mod download
          go build -o app .
      ${options.tests ? `
      - name: Test
        run: go test ./...` : ''}

      - name: Login to Azure
        uses: azure/login@v2
        with:
          client-id: \${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: \${{ secrets.AZURE_TENANT_ID }}
          subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Build and push container
        run: |
          az acr build --registry \${{ secrets.ACR_NAME }} \\
            --image \${{ env.AZURE_CONTAINER_APP_NAME }}:\${{ github.sha }} .

      - name: Deploy to Container App
        run: |
          az containerapp update \\
            --name \${{ env.AZURE_CONTAINER_APP_NAME }} \\
            --resource-group \${{ env.AZURE_RESOURCE_GROUP }} \\
            --image \${{ secrets.ACR_NAME }}.azurecr.io/\${{ env.AZURE_CONTAINER_APP_NAME }}:\${{ github.sha }}`
  },

  aws: {
    lambda: (options) => `name: Deploy Go to AWS Lambda

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.21'

      - name: Build
        run: |
          GOOS=linux GOARCH=amd64 go build -o bootstrap main.go
          zip deployment.zip bootstrap
      ${options.tests ? `
      - name: Run tests
        run: go test ./...` : ''}

      - name: Deploy to Lambda
        run: |
          aws lambda update-function-code \\
            --function-name your-function-name \\
            --zip-file fileb://deployment.zip
        env:
          AWS_ACCESS_KEY_ID: \${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: us-east-1`,

    ec2: (options) => `name: Deploy Go to AWS EC2

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.21'

      - name: Build
        run: |
          go mod download
          GOOS=linux GOARCH=amd64 go build -o app
      ${options.tests ? `
      - name: Test
        run: go test ./...` : ''}

      - name: Deploy to EC2
        run: |
          echo "\${{ secrets.EC2_SSH_KEY }}" > private_key.pem
          chmod 600 private_key.pem
          scp -i private_key.pem -o StrictHostKeyChecking=no app \${{ secrets.EC2_USER }}@\${{ secrets.EC2_HOST }}:/home/\${{ secrets.EC2_USER }}/
          ssh -i private_key.pem -o StrictHostKeyChecking=no \${{ secrets.EC2_USER }}@\${{ secrets.EC2_HOST }} 'sudo systemctl restart your-app'`
  },

  heroku: {
    webapp: (options) => `name: Deploy Go to Heroku

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      ${options.tests ? `
      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.21'

      - name: Run tests
        run: go test ./...` : ''}

      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.13.15
        with:
          heroku_api_key: \${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: your-go-app
          heroku_email: your-email@example.com`
  }
};

export default goTemplates;
