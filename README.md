# CI/CD Workflow Generator

A professional, full-featured GitHub Actions workflow generator built with React, Vite, and Tailwind CSS. Generate customized CI/CD workflows for multiple languages, frameworks, and cloud platforms in seconds.

## Features

### Supported Technologies

**Languages & Frameworks:**
- **Python**: Flask, Django, FastAPI
- **Node.js**: Express, Next.js, React
- **Java**: Spring Boot, Maven, Gradle
- **Go**: Web Apps, Container Apps, Lambda, EC2
- **Docker**: ACR, ECR, ECS, Container Apps, Docker Hub

**Deployment Platforms:**
- **Azure**: Web Apps, Static Web Apps, Container Registry, Container Apps
- **AWS**: Elastic Beanstalk, S3, Lambda, EC2, ECR, ECS
- **Heroku**: Direct deployments
- **Docker Hub**: Container registry

### Key Features

- **Real-time Workflow Generation**: Workflows are generated automatically as you configure options
- **Monaco Editor Integration**: Professional code editor with syntax highlighting
- **Configuration Management**:
  - Save up to 10 configurations locally
  - Load previous configurations
  - Delete unwanted configurations
- **Sharing**: Generate shareable URLs to share configurations with team members
- **Export Options**:
  - Copy workflow to clipboard
  - Download as `.yml` file
- **Customization Options**:
  - Enable/disable dependency caching
  - Include/exclude test execution
  - Add optimization steps
- **Beautiful UI**: Modern gradient design with smooth animations
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/workflow-generator.git
cd workflow-generator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

### Basic Workflow

1. **Select Language**: Choose from Python, Node.js, Java, Go, or Docker
2. **Select Platform**: Choose your deployment platform (Azure, AWS, Heroku, or Docker Hub)
3. **Select Framework**: Choose the framework or build tool
4. **Configure Options**:
   - **Enable Caching**: Speed up builds by caching dependencies
   - **Run Tests**: Include test execution in the workflow
   - **Optimize**: Add optimization steps (static files, migrations, cleanup, etc.)
5. **Review & Edit**: The workflow is generated in real-time. Edit if needed.
6. **Copy or Download**: Use the generated workflow in your project

### Saving Configurations

Click the "Save Configuration" button to save your current settings. Saved configurations appear in the History panel (click "Show History" to view).

### Sharing Configurations

Click "Share Configuration" to generate a shareable URL. The URL contains your current configuration and can be shared with team members.

### Using Generated Workflows

1. Copy or download the generated workflow
2. In your GitHub repository, create the directory structure:
   ```
   .github/workflows/
   ```
3. Save the workflow file as `deploy.yml` (or any `.yml` name)
4. Configure required secrets in your GitHub repository:
   - Go to Settings → Secrets and variables → Actions
   - Add the required secrets for your platform (see below)
5. Push to your repository - the workflow will run automatically

## Required Secrets by Platform

### Azure
- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`

For Azure Container Registry:
- `ACR_NAME`

For Static Web Apps:
- `AZURE_STATIC_WEB_APPS_API_TOKEN`

### AWS
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Additional for specific services:
- `AWS_S3_BUCKET` (for S3 deployments)
- EC2 deployments may require:
  - `EC2_SSH_KEY`
  - `EC2_USER`
  - `EC2_HOST`

### Heroku
- `HEROKU_API_KEY`
- Update `heroku_app_name` and `heroku_email` in the workflow

### Docker Hub
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

## Project Structure

```
workflow-generator/
├── src/
│   ├── components/
│   │   └── ConfigHistory.jsx      # Configuration history component
│   ├── templates/
│   │   ├── python.js               # Python workflow templates
│   │   ├── nodejs.js               # Node.js workflow templates
│   │   ├── java.js                 # Java workflow templates
│   │   ├── go.js                   # Go workflow templates
│   │   ├── docker.js               # Docker workflow templates
│   │   └── index.js                # Template exports
│   ├── utils/
│   │   ├── storage.js              # LocalStorage utilities
│   │   └── shareConfig.js          # URL sharing & export utilities
│   ├── App.jsx                     # Main application component
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Global styles
├── public/                         # Static assets
├── index.html                      # HTML template
├── package.json                    # Dependencies
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
└── README.md                       # This file
```

## Technologies Used

- **React 18**: UI library
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Monaco Editor**: Professional code editor (used by VS Code)
- **js-yaml**: YAML parsing (optional, for future enhancements)

## Customization

### Adding New Templates

1. Open the appropriate template file in `src/templates/` (e.g., `python.js`)
2. Add your template function:
```javascript
export const pythonTemplates = {
  azure: {
    myframework: (options) => `
      name: My Custom Workflow
      on:
        push:
          branches: [main]
      jobs:
        deploy:
          runs-on: ubuntu-latest
          steps:
            - uses: actions/checkout@v4
            ${options.tests ? '- name: Run tests\n  run: pytest' : ''}
    `
  }
};
```

3. Update the framework options in `App.jsx`:
```javascript
const frameworkOptions = {
  python: ['flask', 'django', 'fastapi', 'myframework'],
  // ...
};
```

### Modifying Styles

Tailwind CSS is configured in `tailwind.config.js`. You can customize:
- Colors (primary, secondary)
- Animations
- Breakpoints
- And more

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Code splitting for Monaco Editor
- Lazy loading of components
- Optimized production builds
- Minimal bundle size

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)

## Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/yourusername/workflow-generator/issues) page
2. Create a new issue if your problem isn't already listed
3. Provide as much detail as possible

## Roadmap

- [ ] Add support for GitLab CI/CD
- [ ] Add support for CircleCI
- [ ] Template validation
- [ ] Workflow testing simulation
- [ ] Export to multiple CI/CD platforms
- [ ] Dark/Light theme toggle
- [ ] More framework templates
- [ ] Advanced configuration options
- [ ] Workflow visualization

---

Made with ❤️ for the developer community
