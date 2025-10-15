export const nodejsTemplates = {
  azure: {
    express: (options) => `name: Deploy Express.js to Azure Web App

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  AZURE_WEBAPP_NAME: 'your-app-name'
  NODE_VERSION: '18.x'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}${options.cache ? "\n          cache: 'npm'" : ''}
      ${options.cache ? `
      - name: Cache node modules
        uses: actions/cache@v3
        with:
          path: ~/.npm
          key: \${{ runner.os }}-node-\${{ hashFiles('**/package-lock.json') }}` : ''}

      - name: Install dependencies
        run: npm ci
      ${options.tests ? `
      - name: Run tests
        run: npm test` : ''}
      ${options.optimize ? `
      - name: Build for production
        run: npm run build --if-present` : ''}

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

    nextjs: (options) => `name: Deploy Next.js to Azure Static Web Apps

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'${options.cache ? "\n          cache: 'npm'" : ''}

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
      ${options.tests ? `
      - name: Run tests
        run: npm test` : ''}

      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: \${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: \${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: ""
          output_location: "out"`,

    react: (options) => `name: Deploy React to Azure Static Web Apps

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'${options.cache ? "\n          cache: 'npm'" : ''}

      - name: Install and Build
        run: |
          npm ci
          npm run build
      ${options.tests ? `
      - name: Run tests
        run: npm test -- --passWithNoTests` : ''}

      - name: Deploy to Azure
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: \${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: \${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          output_location: "build"`
  },

  aws: {
    express: (options) => `name: Deploy Express to AWS Elastic Beanstalk

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'

      - name: Install dependencies
        run: npm ci
      ${options.tests ? `
      - name: Run tests
        run: npm test` : ''}

      - name: Generate deployment package
        run: zip -r deploy.zip . -x '*.git*' 'node_modules/*'

      - name: Deploy to AWS
        uses: einaregilsson/beanstalk-deploy@v21
        with:
          aws_access_key: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws_secret_key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          application_name: your-express-app
          environment_name: your-express-env
          version_label: \${{ github.sha }}
          region: us-east-1
          deployment_package: deploy.zip`,

    nextjs: (options) => `name: Deploy Next.js to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'

      - name: Install and build
        run: |
          npm ci
          npm run build
      ${options.tests ? `
      - name: Run tests
        run: npm test` : ''}

      - name: Deploy to S3
        run: |
          aws s3 sync ./out s3://\${{ secrets.AWS_S3_BUCKET }} --delete
        env:
          AWS_ACCESS_KEY_ID: \${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: us-east-1`,

    react: (options) => `name: Deploy React to AWS S3

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'

      - name: Install and build
        run: |
          npm ci
          npm run build

      - name: Deploy to S3
        run: aws s3 sync ./build s3://\${{ secrets.AWS_S3_BUCKET }} --delete
        env:
          AWS_ACCESS_KEY_ID: \${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: \${{ secrets.AWS_SECRET_ACCESS_KEY }}`
  },

  heroku: {
    express: (options) => `name: Deploy Express to Heroku

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      ${options.tests ? `
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18.x'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test` : ''}

      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.13.15
        with:
          heroku_api_key: \${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: your-express-app
          heroku_email: your-email@example.com`,

    nextjs: (options) => `name: Deploy Next.js to Heroku

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.13.15
        with:
          heroku_api_key: \${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: your-nextjs-app
          heroku_email: your-email@example.com`,

    react: (options) => `name: Deploy React to Heroku

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.13.15
        with:
          heroku_api_key: \${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: your-react-app
          heroku_email: your-email@example.com
          buildpack: https://github.com/mars/create-react-app-buildpack.git`
  }
};

export default nodejsTemplates;
