import React, { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import templates from './templates';
import ConfigHistory from './components/ConfigHistory';
import { saveConfig, getConfigs, deleteConfig, loadConfig } from './utils/storage';
import { generateShareableUrl, copyToClipboard, downloadWorkflow, loadConfigFromUrl } from './utils/shareConfig';

function App() {
  const [language, setLanguage] = useState('python');
  const [framework, setFramework] = useState('flask');
  const [platform, setPlatform] = useState('azure');
  const [options, setOptions] = useState({
    cache: true,
    tests: true,
    optimize: true,
  });
  const [generatedWorkflow, setGeneratedWorkflow] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [configs, setConfigs] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Framework options based on selected language
  const frameworkOptions = {
    python: ['flask', 'django', 'fastapi'],
    nodejs: ['express', 'nextjs', 'react'],
    java: ['springboot', 'maven', 'gradle'],
    go: language === 'go' && platform === 'aws' ? ['lambda', 'ec2'] : ['webapp', 'containerapp'],
    docker: platform === 'dockerhub' ? ['build'] : ['acr', 'ecr', 'ecs', 'containerapp'],
  };

  // Update framework when language changes
  useEffect(() => {
    const options = frameworkOptions[language];
    if (options && !options.includes(framework)) {
      setFramework(options[0]);
    }
  }, [language, platform]);

  // Load configurations from localStorage
  useEffect(() => {
    setConfigs(getConfigs());
  }, []);

  // Load configuration from URL on mount
  useEffect(() => {
    const urlConfig = loadConfigFromUrl();
    if (urlConfig) {
      loadConfiguration(urlConfig);
      showNotification('Configuration loaded from URL', 'success');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const generateWorkflow = useCallback(() => {
    try {
      const template = templates[language]?.[platform]?.[framework];

      if (!template) {
        showNotification('Template not available for this configuration', 'error');
        return;
      }

      const workflow = template(options);
      setGeneratedWorkflow(workflow);
      showNotification('Workflow generated successfully!', 'success');
    } catch (error) {
      console.error('Error generating workflow:', error);
      showNotification('Error generating workflow', 'error');
    }
  }, [language, platform, framework, options]);

  // Auto-generate workflow when options change
  useEffect(() => {
    generateWorkflow();
  }, [generateWorkflow]);

  const handleSaveConfig = () => {
    const config = {
      language,
      framework,
      platform,
      options,
      workflow: generatedWorkflow,
    };

    const saved = saveConfig(config);
    if (saved) {
      setConfigs(getConfigs());
      showNotification('Configuration saved!', 'success');
    } else {
      showNotification('Error saving configuration', 'error');
    }
  };

  const handleDeleteConfig = (id) => {
    if (deleteConfig(id)) {
      setConfigs(getConfigs());
      showNotification('Configuration deleted', 'success');
    } else {
      showNotification('Error deleting configuration', 'error');
    }
  };

  const loadConfiguration = (config) => {
    setLanguage(config.language);
    setFramework(config.framework);
    setPlatform(config.platform);
    setOptions(config.options);
    if (config.workflow) {
      setGeneratedWorkflow(config.workflow);
    }
  };

  const handleLoadConfig = (id) => {
    const config = loadConfig(id);
    if (config) {
      loadConfiguration(config);
      setShowHistory(false);
      showNotification('Configuration loaded!', 'success');
    } else {
      showNotification('Error loading configuration', 'error');
    }
  };

  const handleShareConfig = async () => {
    const config = { language, framework, platform, options };
    const url = generateShareableUrl(config);

    if (url) {
      const success = await copyToClipboard(url);
      if (success) {
        showNotification('Shareable link copied to clipboard!', 'success');
      } else {
        showNotification('Error copying link to clipboard', 'error');
      }
    } else {
      showNotification('Error generating shareable link', 'error');
    }
  };

  const handleDownload = () => {
    if (downloadWorkflow(generatedWorkflow, `${language}-${framework}-${platform}.yml`)) {
      showNotification('Workflow downloaded!', 'success');
    } else {
      showNotification('Error downloading workflow', 'error');
    }
  };

  const handleCopyWorkflow = async () => {
    const success = await copyToClipboard(generatedWorkflow);
    if (success) {
      showNotification('Workflow copied to clipboard!', 'success');
    } else {
      showNotification('Error copying workflow', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-purple-600 to-secondary">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg animate-slideUp ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white font-medium`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-white bg-opacity-10 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">CI/CD Workflow Generator</h1>
              <p className="text-gray-100 mt-1">Generate GitHub Actions workflows in seconds</p>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-all duration-200 backdrop-blur-sm border border-white border-opacity-20"
            >
              {showHistory ? 'Hide' : 'Show'} History ({configs.length})
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Language Selection */}
            <div className="bg-white rounded-xl shadow-xl p-6 animate-fadeIn">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Language</h2>
              <div className="grid grid-cols-2 gap-3">
                {['python', 'nodejs', 'java', 'go', 'docker'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`p-3 rounded-lg font-medium transition-all duration-200 ${
                      language === lang
                        ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg transform scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform Selection */}
            <div className="bg-white rounded-xl shadow-xl p-6 animate-fadeIn">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Platform</h2>
              <div className="grid grid-cols-1 gap-3">
                {language === 'docker'
                  ? ['azure', 'aws', 'dockerhub'].map((plat) => (
                      <button
                        key={plat}
                        onClick={() => setPlatform(plat)}
                        className={`p-3 rounded-lg font-medium transition-all duration-200 ${
                          platform === plat
                            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {plat === 'dockerhub' ? 'Docker Hub' : plat.toUpperCase()}
                      </button>
                    ))
                  : ['azure', 'aws', 'heroku'].map((plat) => (
                      <button
                        key={plat}
                        onClick={() => setPlatform(plat)}
                        className={`p-3 rounded-lg font-medium transition-all duration-200 ${
                          platform === plat
                            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {plat === 'aws' ? 'AWS' : plat.charAt(0).toUpperCase() + plat.slice(1)}
                      </button>
                    ))
                }
              </div>
            </div>

            {/* Framework Selection */}
            <div className="bg-white rounded-xl shadow-xl p-6 animate-fadeIn">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Framework</h2>
              <div className="grid grid-cols-1 gap-3">
                {frameworkOptions[language]?.map((fw) => (
                  <button
                    key={fw}
                    onClick={() => setFramework(fw)}
                    className={`p-3 rounded-lg font-medium transition-all duration-200 ${
                      framework === fw
                        ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {fw.charAt(0).toUpperCase() + fw.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="bg-white rounded-xl shadow-xl p-6 animate-fadeIn">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Options</h2>
              <div className="space-y-3">
                {[
                  { key: 'cache', label: 'Enable Caching', description: 'Cache dependencies for faster builds' },
                  { key: 'tests', label: 'Run Tests', description: 'Include test execution step' },
                  { key: 'optimize', label: 'Optimize', description: 'Add optimization steps' },
                ].map((option) => (
                  <label key={option.key} className="flex items-start space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={options[option.key]}
                      onChange={(e) => setOptions({ ...options, [option.key]: e.target.checked })}
                      className="mt-1 h-5 w-5 text-primary rounded focus:ring-primary cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-800 group-hover:text-primary transition-colors">
                        {option.label}
                      </div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-xl p-6 animate-fadeIn space-y-3">
              <button
                onClick={handleSaveConfig}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Save Configuration
              </button>
              <button
                onClick={handleShareConfig}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Share Configuration
              </button>
            </div>
          </div>

          {/* Editor Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Code Editor */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden animate-fadeIn">
              <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Generated Workflow</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopyWorkflow}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200"
                  >
                    Copy
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors duration-200"
                  >
                    Download
                  </button>
                </div>
              </div>
              <Editor
                height="600px"
                defaultLanguage="yaml"
                value={generatedWorkflow}
                onChange={(value) => setGeneratedWorkflow(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  readOnly: false,
                  automaticLayout: true,
                }}
              />
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-xl shadow-xl p-6 animate-fadeIn">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">How to Use</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Select your programming language, deployment platform, and framework</li>
                <li>Configure options like caching, tests, and optimization</li>
                <li>The workflow will be generated automatically</li>
                <li>Copy or download the workflow file</li>
                <li>Create <code className="bg-gray-100 px-2 py-1 rounded">.github/workflows/</code> directory in your repository</li>
                <li>Save the workflow as <code className="bg-gray-100 px-2 py-1 rounded">deploy.yml</code> in that directory</li>
                <li>Configure required secrets in your GitHub repository settings</li>
                <li>Push to your repository and watch the magic happen!</li>
              </ol>
            </div>
          </div>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="mt-6 animate-slideUp">
            <ConfigHistory
              configs={configs}
              onLoad={handleLoadConfig}
              onDelete={handleDeleteConfig}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-white text-sm bg-white bg-opacity-10 backdrop-blur-md">
        <p>Built with React, Vite, and Tailwind CSS</p>
        <p className="mt-2">Open source CI/CD workflow generator for GitHub Actions</p>
      </footer>
    </div>
  );
}

export default App;
