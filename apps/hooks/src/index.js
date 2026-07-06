const fs = require('fs');
const path = require('path');
const xfs = require('fs.extra');
const bundle = require('@asyncapi/bundler');

async function createAsyncapiFile(generator) {
  const asyncapi = generator.originalAsyncAPI;
  const targetDir = generator.targetDir;
  const customDirInTarget = generator.templateParams.asyncapiFileDir;
  const sourceFilePath = generator.asyncapiFilePath;
  const getCustomFileLocation = (target, dir, filename) => {
    xfs.mkdirpSync(path.resolve(target, dir));
    return path.resolve(target, dir, filename);
  };
  let extension;

  try {
    JSON.parse(asyncapi);
    extension = 'json';
  } catch (e) {
    extension = 'yaml';
  }

  const outputFileName = `asyncapi.${extension}`;

  const asyncapiOutputLocation = customDirInTarget
    ? getCustomFileLocation(targetDir, customDirInTarget, outputFileName)
    : path.resolve(targetDir, outputFileName);

  let output = asyncapi;

  // Bundle only when the source lives on disk, so relative external $refs
  // (e.g. ./commons/servers.yml) resolve against the document's own directory
  // instead of the current working directory. String/URL input or a bundling
  // failure falls back to writing the original source verbatim.
  if (sourceFilePath && fs.existsSync(sourceFilePath)) {
    try {
      const bundled = await bundle([sourceFilePath], { baseDir: path.dirname(sourceFilePath) });
      output = bundled.yml();
    } catch (err) {
      console.warn(`[generator-hooks] Failed to bundle AsyncAPI document, writing original source verbatim: ${err.message}`);
    }
  }

  fs.writeFileSync(asyncapiOutputLocation, output);
}

module.exports = {
  'generate:after': createAsyncapiFile
};
