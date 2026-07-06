const fs = require('fs');
const path = require('path');
const xfs = require('fs.extra');
const bundle = require('@asyncapi/bundler');

function detectExtension(source) {
  try {
    JSON.parse(source);
    return 'json';
  } catch (e) {
    return 'yaml';
  }
}

function resolveOutputLocation(targetDir, customDirInTarget, outputFileName) {
  if (customDirInTarget) {
    xfs.mkdirpSync(path.resolve(targetDir, customDirInTarget));
    return path.resolve(targetDir, customDirInTarget, outputFileName);
  }
  return path.resolve(targetDir, outputFileName);
}

/**
 * 'generate:after' hook.
 *
 * Writes a single self-contained AsyncAPI document next to the generated client
 * so external $refs are resolvable at runtime (e.g. by @asyncapi/keeper). When a
 * source file path is available on disk it bundles the document (inlining
 * external $refs) via @asyncapi/bundler; otherwise (string/URL input, or a
 * bundling failure) it falls back to writing the original source verbatim.
 *
 * @param {object} generator - The AsyncAPI Generator instance.
 * @returns {Promise<void>}
 */
async function createAsyncapiFile(generator) {
  const originalAsyncAPI = generator.originalAsyncAPI;
  const targetDir = generator.targetDir;
  const customDirInTarget = generator.templateParams.asyncapiFileDir;
  const sourceFilePath = generator.asyncapiFilePath;

  const extension = detectExtension(originalAsyncAPI);
  const outputFileName = `asyncapi.${extension}`;
  const asyncapiOutputLocation = resolveOutputLocation(targetDir, customDirInTarget, outputFileName);

  let output = originalAsyncAPI;

  // Bundle only when the source lives on disk, so relative external $refs
  // (e.g. ./commons/servers.yml) resolve against the document's own location.
  if (typeof sourceFilePath === 'string' && sourceFilePath && fs.existsSync(sourceFilePath)) {
    try {
      // baseDir is required so the document's relative external $refs resolve
      // against its own directory rather than the current working directory.
      const bundled = await bundle([sourceFilePath], { baseDir: path.dirname(sourceFilePath) });
      output = bundled.yml();
    } catch (err) {
      console.warn(`[generator-hooks] Failed to bundle AsyncAPI document, writing original source verbatim: ${err.message}`);
      output = originalAsyncAPI;
    }
  }

  fs.writeFileSync(asyncapiOutputLocation, output);
}

module.exports = {
  'generate:after': createAsyncapiFile
};
