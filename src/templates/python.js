export const pythonTemplates = {
  azure: {
    flask: (options) => `name: Deploy Flask to Azure Web App

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  AZURE_WEBAPP_NAME: 'your-app-name'
  PYTHON_VERSION: '3.10'
  STARTUP_COMMAND: 'gunicorn --bind=0.0.0.0:8000 --timeout 600 --workers 4 app:app'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    environment:
      name: 'Production'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: \${{ env.PYTHON_VERSION }}${options.cache ? "\n          cache: 'pip'" : ''}
      ${options.cache ? `
      - name: Cache dependencies
        uses: actions/cache@v3
        with:
          path: |
            ~/.cache/pip
            ~/.local/lib/python\${{ env.PYTHON_VERSION }}/site-packages
          key: \${{ runner.os }}-pip-\${{ hashFiles('**/requirements.txt') }}` : ''}

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip setuptools wheel
          pip install ${options.optimize ? '--prefer-binary ' : ''}-r requirements.txt
      ${options.tests ? `
      - name: Run tests
        run: |
          pip install pytest
          pytest` : ''}
      ${options.optimize ? `
      - name: Cleanup for production
        run: |
          find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
          find . -type f -name "*.pyc" -delete
          find . -type f -name "*.pyo" -delete` : ''}

      - name: Login to Azure
        uses: azure/login@v2
        with:
          client-id: \${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: \${{ secrets.AZURE_TENANT_ID }}
          subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Configure Azure App Service
        uses: azure/appservice-settings@v1
        with:
          app-name: \${{ env.AZURE_WEBAPP_NAME }}
          mask-inputs: false
          general-settings-json: '{"linuxFxVersion": "PYTHON|\${{ env.PYTHON_VERSION }}"}'

      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v3
        with:
          app-name: \${{ env.AZURE_WEBAPP_NAME }}
          package: '.'
          startup-command: \${{ env.STARTUP_COMMAND }}

      - name: Azure Logout
        if: always()
        run: az logout`,

    django: (options) => `name: Deploy Django to Azure Web App

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  AZURE_WEBAPP_NAME: 'your-app-name'
  PYTHON_VERSION: '3.10'
  STARTUP_COMMAND: 'gunicorn --bind=0.0.0.0:8000 project.wsgi:application'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: \${{ env.PYTHON_VERSION }}${options.cache ? "\n          cache: 'pip'" : ''}

      - name: Install dependencies
        run: pip install -r requirements.txt
      ${options.tests ? `
      - name: Run tests
        run: |
          python manage.py test` : ''}
      ${options.optimize ? `
      - name: Collect static files
        run: python manage.py collectstatic --noinput

      - name: Run migrations
        run: python manage.py migrate --noinput` : ''}

      - name: Login to Azure
        uses: azure/login@v2
        with:
          client-id: \${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: \${{ secrets.AZURE_TENANT_ID }}
          subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Deploy to Azure
        uses: azure/webapps-deploy@v3
        with:
          app-name: \${{ env.AZURE_WEBAPP_NAME }}
          package: '.'
          startup-command: \${{ env.STARTUP_COMMAND }}`,

    fastapi: (options) => `name: Deploy FastAPI to Azure Web App

on:
  push:
    branches: [main]

env:
  AZURE_WEBAPP_NAME: 'your-app-name'
  PYTHON_VERSION: '3.10'
  STARTUP_COMMAND: 'uvicorn main:app --host 0.0.0.0 --port 8000'

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: \${{ env.PYTHON_VERSION }}${options.cache ? "\n          cache: 'pip'" : ''}

      - name: Install dependencies
        run: pip install -r requirements.txt
      ${options.tests ? `
      - name: Run tests
        run: |
          pip install pytest httpx
          pytest` : ''}

      - name: Login to Azure
        uses: azure/login@v2
        with:
          client-id: \${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: \${{ secrets.AZURE_TENANT_ID }}
          subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - name: Deploy to Azure
        uses: azure/webapps-deploy@v3
        with:
          app-name: \${{ env.AZURE_WEBAPP_NAME }}
          package: '.'
          startup-command: \${{ env.STARTUP_COMMAND }}`
  },

  aws: {
    flask: (options) => `name: Deploy Flask to AWS Elastic Beanstalk

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.10'

      - name: Install dependencies
        run: pip install -r requirements.txt
      ${options.tests ? `
      - name: Run tests
        run: pytest` : ''}

      - name: Generate deployment package
        run: zip -r deploy.zip . -x '*.git*'

      - name: Deploy to EB
        uses: einaregilsson/beanstalk-deploy@v21
        with:
          aws_access_key: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws_secret_key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          application_name: your-app
          environment_name: your-app-env
          version_label: \${{ github.sha }}
          region: us-east-1
          deployment_package: deploy.zip`,

    django: (options) => `name: Deploy Django to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Generate deployment package
        run: zip -r deploy.zip .
      - name: Deploy to AWS
        uses: einaregilsson/beanstalk-deploy@v21
        with:
          aws_access_key: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws_secret_key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          application_name: your-django-app
          environment_name: your-django-env
          version_label: \${{ github.sha }}
          region: us-east-1
          deployment_package: deploy.zip`,

    fastapi: (options) => `name: Deploy FastAPI to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Create deployment package
        run: zip -r deploy.zip .
      - name: Deploy to AWS Lambda
        run: |
          aws lambda update-function-code \\
            --function-name your-fastapi-function \\
            --zip-file fileb://deploy.zip
        env:
          AWS_ACCESS_KEY_ID: \${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: us-east-1`
  },

  heroku: {
    flask: (options) => `name: Deploy Flask to Heroku

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      ${options.tests ? `
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.10'

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Run tests
        run: pytest` : ''}

      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.13.15
        with:
          heroku_api_key: \${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: your-app-name
          heroku_email: your-email@example.com`,

    django: (options) => `name: Deploy Django to Heroku

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
          heroku_app_name: your-django-app
          heroku_email: your-email@example.com`,

    fastapi: (options) => `name: Deploy FastAPI to Heroku

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
          heroku_app_name: your-fastapi-app
          heroku_email: your-email@example.com`
  }
};

export default pythonTemplates;
