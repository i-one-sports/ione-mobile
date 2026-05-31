// app.config.js dynamically injects secrets that must not be committed to git.
// It reads app.json as the base and overrides the @rnmapbox/maps plugin to
// pull the download token from the environment (local .env or EAS Secret).
const baseConfig = require("./app.json");

const plugins = baseConfig.expo.plugins.map((plugin) => {
  if (plugin === "@rnmapbox/maps") {
    return [
      "@rnmapbox/maps",
      { RNMapboxMapsDownloadToken: process.env.MAPBOX_DOWNLOAD_TOKEN ?? "" },
    ];
  }
  return plugin;
});

module.exports = { ...baseConfig.expo, plugins };
