// Utility functions for sharing workflow configurations

export const encodeConfig = (config) => {
  try {
    const configString = JSON.stringify(config);
    return btoa(encodeURIComponent(configString));
  } catch (error) {
    console.error('Error encoding configuration:', error);
    return null;
  }
};

export const decodeConfig = (encodedConfig) => {
  try {
    const configString = decodeURIComponent(atob(encodedConfig));
    return JSON.parse(configString);
  } catch (error) {
    console.error('Error decoding configuration:', error);
    return null;
  }
};

export const generateShareableUrl = (config) => {
  const encoded = encodeConfig(config);
  if (!encoded) return null;

  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?config=${encoded}`;
};

export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        textArea.remove();
        return true;
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        textArea.remove();
        return false;
      }
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

export const loadConfigFromUrl = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedConfig = urlParams.get('config');

    if (!encodedConfig) return null;

    return decodeConfig(encodedConfig);
  } catch (error) {
    console.error('Error loading configuration from URL:', error);
    return null;
  }
};

export const downloadWorkflow = (yamlContent, filename = 'workflow.yml') => {
  try {
    const blob = new Blob([yamlContent], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error('Error downloading workflow:', error);
    return false;
  }
};
