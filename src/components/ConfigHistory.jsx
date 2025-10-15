import React from 'react';

const ConfigHistory = ({ configs, onLoad, onDelete }) => {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getConfigLabel = (config) => {
    return `${config.language} - ${config.framework} - ${config.platform}`;
  };

  if (configs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-xl p-8 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No Saved Configurations</h3>
        <p className="text-gray-500">Your saved workflow configurations will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Configuration History</h2>
        <span className="text-sm text-gray-500">{configs.length} saved configuration{configs.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-4">
        {configs.map((config) => (
          <div
            key={config.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-primary hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">
                  {getConfigLabel(config)}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  Saved on {formatDate(config.timestamp)}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {config.language}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {config.framework}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {config.platform}
                  </span>
                  {config.options?.cache && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Cache
                    </span>
                  )}
                  {config.options?.tests && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Tests
                    </span>
                  )}
                  {config.options?.optimize && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Optimize
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col space-y-2 ml-4">
                <button
                  onClick={() => onLoad(config.id)}
                  className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white text-sm rounded-lg hover:shadow-lg transition-all duration-200 whitespace-nowrap"
                >
                  Load
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this configuration?')) {
                      onDelete(config.id);
                    }
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors duration-200 whitespace-nowrap"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConfigHistory;
