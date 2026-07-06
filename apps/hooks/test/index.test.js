const { stat, readFile, mkdir } = require('fs').promises;
const path = require('path');
const { 'generate:after': createAsyncapiFile } = require('../src/index.js');

const dummyYAML = `
asyncapi: '2.0.0'
info:
  title: 'Dummy example'
  version: '1.0.0'
`;

const dummyJSON = JSON.stringify({
  asyncapi: '2.0.0',
  info: {
    title: 'Dummy example',
    version: '1.0.0'
  }
}, null, 2);

const testResultPath = path.resolve(__dirname, './temp');
const asyncapiYamlFileName = 'asyncapi.yaml';

describe('createAsyncapiFile', () => {
  /**
     * Setup to create the test directory before running tests.
     * Ensures the test environment is ready.
     */
  beforeAll(async () => {
    await mkdir(testResultPath, { recursive: true });
  });

  it('creates a YAML file when the originalAsyncAPI is in YAML format', async () => {
    const outputFileName = asyncapiYamlFileName;
    const gen = {
      originalAsyncAPI: dummyYAML,
      targetDir: testResultPath,
      templateParams: {}
    };
    await createAsyncapiFile(gen);
    const outputFile = path.join(testResultPath, outputFileName);
    const checkOutputFileExists = await stat(outputFile);
    expect(checkOutputFileExists.isFile()).toBeTruthy();
    const outputFileContent = await readFile(outputFile, 'utf8');
    expect(outputFileContent).toBe(dummyYAML);
  });

  it('creates a JSON file when the originalAsyncAPI is in JSON format', async () => {
    const outputFileName = 'asyncapi.json';
    const gen = {
      originalAsyncAPI: dummyJSON,
      targetDir: testResultPath,
      templateParams: {}
    };
    await createAsyncapiFile(gen);
    const outputFile = path.join(testResultPath, outputFileName);
    const checkOutputFileExists = await stat(outputFile);
    expect(checkOutputFileExists.isFile()).toBeTruthy();
    const outputFileContent = await readFile(outputFile, 'utf8');
    expect(outputFileContent).toBe(dummyJSON);
  });

  it('creates the file in a custom directory when asyncapiFileDir parameter is provided', async () => {
    const customDir = 'custom-test';
    const outputFileName = asyncapiYamlFileName;
    const outputFilePath = path.join(testResultPath, customDir, outputFileName);
    const gen = {
      originalAsyncAPI: dummyYAML,
      targetDir: testResultPath,
      templateParams: {
        asyncapiFileDir: customDir
      }
    };
    await createAsyncapiFile(gen);
    const checkOutputFileExists = await stat(outputFilePath);
    expect(checkOutputFileExists.isFile()).toBeTruthy();
    const outputFileContent = await readFile(outputFilePath, 'utf8');
    expect(outputFileContent).toBe(dummyYAML);
  });

  it('bundles external $refs into a self-contained document when a source path is available', async () => {
    const sourcePath = path.resolve(__dirname, './__fixtures__/asyncapi-with-refs.yml');
    const gen = {
      originalAsyncAPI: await readFile(sourcePath, 'utf8'),
      targetDir: testResultPath,
      templateParams: {}
    };
    await createAsyncapiFile(gen, { asyncapiFilePath: sourcePath });
    const outputFileContent = await readFile(path.join(testResultPath, asyncapiYamlFileName), 'utf8');
    // No external file refs survive; internal '#/...' refs are still allowed.
    expect(outputFileContent).not.toMatch(/\.yml#/);
    expect(outputFileContent).not.toMatch(/\$ref:\s*['"]?\.\.?\//);
    expect(outputFileContent).toContain('channels:');
  });

  it('falls back to writing the original source verbatim when no source path is available', async () => {
    const gen = {
      originalAsyncAPI: dummyYAML,
      targetDir: testResultPath,
      templateParams: {}
    };
    await createAsyncapiFile(gen);
    const outputFileContent = await readFile(path.join(testResultPath, asyncapiYamlFileName), 'utf8');
    expect(outputFileContent).toBe(dummyYAML);
  });
});
