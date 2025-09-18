import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { updateDependencyVersion, getPubspecDartSdkVersion, updatePubspecDartSdkVersion } from '../src/fileHandler';

describe('FileHandler', () => {
  const testYamlPath = path.join(process.cwd(), '__fixtures__', 'pubspec.yaml');
  const baseYaml = `name: test_project\nenvironment:\n  sdk: "2.12.0"\ndependencies:\n  http: ^0.13.0\n`;

  beforeEach(() => {
    fs.writeFileSync(testYamlPath, baseYaml);
  });

  afterEach(() => {
    fs.unlinkSync(testYamlPath);
  });

  it('should update dependency version', () => {
    updateDependencyVersion(testYamlPath, 'http', '^1.0.0', 'dependencies');
    const content = fs.readFileSync(testYamlPath, 'utf8');
    const doc = yaml.load(content) as any;
    expect(doc.dependencies.http).toBe('^1.0.0');
  });

  it('should get Dart SDK version', () => {
    const version = getPubspecDartSdkVersion(testYamlPath);
    expect(version).toBe('2.12.0');
  });

  it('should update Dart SDK version', () => {
    updatePubspecDartSdkVersion(testYamlPath, '3.0.0');
    const content = fs.readFileSync(testYamlPath, 'utf8');
    const doc = yaml.load(content) as any;
    expect(doc.environment.sdk).toBe('3.0.0');
  });
});
