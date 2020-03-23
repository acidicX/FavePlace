/* eslint-disable @typescript-eslint/no-var-requires */
const { override } = require('customize-cra');

const overrideWebpackPublicPath = config => {
  if (config.mode === 'production') {
    config.output.publicPath = '<%= PUBLIC_URL %>/';
  }
  return config;
};

const overridePublicURL = config => {
  if (config.mode === 'production') {
    const plugins = config.plugins.map(plugin => {
      if (plugin.constructor.name === 'HtmlWebpackPlugin') {
        plugin.options.filename = 'index.ejs';
        // Note: Ejs tags have to be "<%-" so the content does not get escaped
        plugin.options.injectedConfiguration = `<%- injectedConfiguration %>`;
      }
      if (plugin.constructor.name === 'InterpolateHtmlPlugin') {
        plugin.replacements.PUBLIC_URL = '<%= PUBLIC_URL %>';
      }
      return plugin;
    });
    config.plugins = plugins;
  }
  return config;
};

const overrideWebpackConfig = override(overrideWebpackPublicPath, overridePublicURL);

module.exports = {
  webpack: overrideWebpackConfig,
};
