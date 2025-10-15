// LocalStorage utility for saving and loading workflow configurations

const STORAGE_KEY = 'workflow_configs';
const MAX_CONFIGS = 10;

export const saveConfig = (config) => {
  try {
    const configs = getConfigs();
    const newConfig = {
      ...config,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    };

    configs.unshift(newConfig);

    // Keep only the last MAX_CONFIGS configurations
    const limitedConfigs = configs.slice(0, MAX_CONFIGS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedConfigs));
    return newConfig;
  } catch (error) {
    console.error('Error saving configuration:', error);
    return null;
  }
};

export const getConfigs = () => {
  try {
    const configs = localStorage.getItem(STORAGE_KEY);
    return configs ? JSON.parse(configs) : [];
  } catch (error) {
    console.error('Error loading configurations:', error);
    return [];
  }
};

export const deleteConfig = (id) => {
  try {
    const configs = getConfigs();
    const filteredConfigs = configs.filter(config => config.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredConfigs));
    return true;
  } catch (error) {
    console.error('Error deleting configuration:', error);
    return false;
  }
};

export const clearAllConfigs = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing configurations:', error);
    return false;
  }
};

export const loadConfig = (id) => {
  try {
    const configs = getConfigs();
    return configs.find(config => config.id === id) || null;
  } catch (error) {
    console.error('Error loading configuration:', error);
    return null;
  }
};
