const minimatch = require("minimatch");

module.exports = function enableLegacyMinimatch() {
  // Load before FlatCompat loads the lint plugins. They expect Minimatch 3's
  // callable CommonJS export; matching still runs entirely in patched v11.
  const entry = require.resolve("minimatch");
  require.cache[entry].exports = Object.assign(minimatch.minimatch, minimatch);
};
