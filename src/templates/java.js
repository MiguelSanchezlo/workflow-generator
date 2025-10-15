export const javaTemplates = {
  azure: {
    springboot: (options) => `name: Deploy Spring Boot to Azure

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  AZURE_WEBAPP_NAME: 'your-app-name'
  JAVA_VERSION: '17'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up JDK
        uses: actions/setup-java@v4
        with:
          java-version: \${{ env.JAVA_VERSION }}
          distribution: 'temurin'${options.cache ? "\n          cache: 'maven'" : ''}

      - name: Build with Maven
        run: mvn clean package -DskipTests=${!options.tests}
      ${options.tests ? `
      - name: Run tests
        run: mvn test` : ''}

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
          package: '\${{ github.workspace }}/target/*.jar'

      - name: Azure Logout
        if: always()
        run: az logout`,

    maven: (options) => `name: Build and Deploy Java Maven to Azure

on:
  push:
    branches: [main]

env:
  AZURE_WEBAPP_NAME: 'your-app-name'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'${options.cache ? "\n          cache: 'maven'" : ''}

      - name: Build with Maven
        run: mvn clean install
      ${options.tests ? `
      - name: Run tests
        run: mvn test` : ''}

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
          package: target/*.jar`,

    gradle: (options) => `name: Build and Deploy Java Gradle to Azure

on:
  push:
    branches: [main]

env:
  AZURE_WEBAPP_NAME: 'your-app-name'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'${options.cache ? "\n          cache: 'gradle'" : ''}

      - name: Build with Gradle
        run: ./gradlew build
      ${options.tests ? `
      - name: Run tests
        run: ./gradlew test` : ''}

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
          package: build/libs/*.jar`
  },

  aws: {
    springboot: (options) => `name: Deploy Spring Boot to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Build with Maven
        run: mvn clean package
      ${options.tests ? `
      - name: Run tests
        run: mvn test` : ''}

      - name: Deploy to AWS Elastic Beanstalk
        uses: einaregilsson/beanstalk-deploy@v21
        with:
          aws_access_key: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws_secret_key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          application_name: your-springboot-app
          environment_name: your-springboot-env
          version_label: \${{ github.sha }}
          region: us-east-1
          deployment_package: target/*.jar`,

    maven: (options) => `name: Deploy Java Maven to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Build with Maven
        run: mvn clean package

      - name: Deploy to AWS
        uses: einaregilsson/beanstalk-deploy@v21
        with:
          aws_access_key: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws_secret_key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          application_name: your-java-app
          environment_name: your-java-env
          version_label: \${{ github.sha }}
          region: us-east-1
          deployment_package: target/*.jar`,

    gradle: (options) => `name: Deploy Java Gradle to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Build with Gradle
        run: ./gradlew build

      - name: Deploy to AWS
        uses: einaregilsson/beanstalk-deploy@v21
        with:
          aws_access_key: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws_secret_key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          application_name: your-gradle-app
          environment_name: your-gradle-env
          version_label: \${{ github.sha }}
          region: us-east-1
          deployment_package: build/libs/*.jar`
  },

  heroku: {
    springboot: (options) => `name: Deploy Spring Boot to Heroku

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
          heroku_app_name: your-springboot-app
          heroku_email: your-email@example.com`,

    maven: (options) => `name: Deploy Java Maven to Heroku

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
          heroku_app_name: your-java-app
          heroku_email: your-email@example.com`,

    gradle: (options) => `name: Deploy Java Gradle to Heroku

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
          heroku_app_name: your-gradle-app
          heroku_email: your-email@example.com`
  }
};

export default javaTemplates;
