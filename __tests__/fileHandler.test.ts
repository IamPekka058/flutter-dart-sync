import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { jest } from '@jest/globals'

jest.unstable_mockModule('@actions/core', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}))

const {
  updateDependencyVersion,
  getPubspecDartSdkVersion,
  updatePubspecDartSdkVersion
} = await import('../src/fileHandler')
const core = await import('@actions/core')
import PubspecFile from '../src/PubspecType'

jest.spyOn(process, 'exit').mockImplementation(((code?: number) => {
  throw new Error(`process.exit: ${code}`)
}) as never)

describe('FileHandler', () => {
  const testYamlPath = path.join(process.cwd(), '__fixtures__', 'pubspec.yaml')
  const baseYaml = `name: test_project\nenvironment:\n  sdk: "2.12.0"\ndependencies:\n  http: ^0.13.0\n`

  beforeEach(() => {
    fs.writeFileSync(testYamlPath, baseYaml)
    jest.clearAllMocks()
  })

  afterEach(() => {
    fs.unlinkSync(testYamlPath)
  })

  it('should update dependency version', () => {
    updateDependencyVersion(testYamlPath, 'http', '^1.0.0', 'dependencies')
    const content = fs.readFileSync(testYamlPath, 'utf8')
    const doc = yaml.load(content) as PubspecFile
    expect(doc.dependencies).toBeDefined()
    expect(doc.dependencies?.http).toBe('^1.0.0')
  })

  it('should get Dart SDK version', () => {
    const version = getPubspecDartSdkVersion(testYamlPath)
    expect(version).toBe('2.12.0')
  })

  it('should update Dart SDK version', () => {
    updatePubspecDartSdkVersion(testYamlPath, '3.0.0')
    const content = fs.readFileSync(testYamlPath, 'utf8')
    const doc = yaml.load(content) as PubspecFile
    expect(doc.environment).toBeDefined()
    expect(doc.environment?.sdk).toBe('3.0.0')
  })
  it('should throw error if dependency type is invalid', () => {
    expect(() => {
      updateDependencyVersion(testYamlPath, 'http', '^1.0.0', 'invalidType')
    }).toThrow('process.exit: 1')
  })
  it('should throw error if pubspec.yaml is malformed', () => {
    fs.writeFileSync(
      testYamlPath,
      'name: test_project\nenvironment:\n  sdk: "2.12.0"\ndependencies:\n  http: [^0.13.0\n'
    ) // Malformed YAML
    expect(() => {
      updateDependencyVersion(testYamlPath, 'http', '^1.0.0', 'dependencies')
    }).toThrow('process.exit: 1')
    expect(core.info).not.toHaveBeenCalled()
    expect(core.error).toHaveBeenCalled()
    expect(core.debug).toHaveBeenCalled()
  })
})
