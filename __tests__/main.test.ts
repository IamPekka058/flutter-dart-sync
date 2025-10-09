import { jest } from '@jest/globals'

// Use unstable_mockModule for ESM mocking
jest.unstable_mockModule('child_process', () => ({
  execSync: jest.fn()
}))
jest.spyOn(process, 'exit').mockImplementation((() => {}) as never)

jest.unstable_mockModule('@actions/core', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  getInput: jest.fn(),
  warning: jest.fn(),
  setFailed: jest.fn()
}))
jest.unstable_mockModule('../src/fileHandler.ts', () => ({
  getPubspecDartSdkVersion: jest.fn(),
  updatePubspecDartSdkVersion: jest.fn(),
  getPubspecFile: jest.fn()
}))

// Some modules import the file with a .js extension (e.g. './fileHandler.js')
// when running under ESM. Mock that specifier as well so imports are intercepted.
jest.unstable_mockModule('../src/fileHandler.js', () => ({
  getPubspecDartSdkVersion: jest.fn(),
  updatePubspecDartSdkVersion: jest.fn(),
  getPubspecFile: jest.fn()
}))

// Dynamically import the modules after mocks are set up
const { execSync } = await import('child_process')
const { getFlutterDartSdkVersion, run } = await import('../src/main.js') // Use .js extension for ESM imports
const core = await import('@actions/core')
const fileHandler = await import('../src/fileHandler.ts')

const mockedExecSync = execSync as jest.Mock
const mockedGetPubspecDartSdkVersion =
  fileHandler.getPubspecDartSdkVersion as jest.Mock
const mockedUpdatePubspecDartSdkVersion =
  fileHandler.updatePubspecDartSdkVersion as jest.Mock

describe('Main', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return flutter dart sdk version', () => {
    mockedExecSync.mockReturnValue(
      JSON.stringify({
        frameworkVersion: '3.24.3',
        channel: 'stable',
        repositoryUrl: 'https://github.com/flutter/flutter.git',
        frameworkRevision: '48c8d940e4',
        frameworkCommitDate: '2025-09-05 13:20:31 -0700',
        engineRevision: 'f63f65892d',
        dartSdkVersion: '3.5.2',
        devToolsVersion: '2.39.3'
      })
    )

    const version = getFlutterDartSdkVersion()
    expect(version).toBe('3.5.2')
    expect(mockedExecSync).toHaveBeenCalledWith('flutter --version --machine', {
      encoding: 'utf-8'
    })
  })
  it('should handle error when flutter command fails', () => {
    mockedExecSync.mockImplementation(() => {
      throw new Error('Command failed')
    })

    const version = getFlutterDartSdkVersion()
    expect(version).toBeUndefined()
    expect(mockedExecSync).toHaveBeenCalledWith('flutter --version --machine', {
      encoding: 'utf-8'
    })
    expect(core.error).toHaveBeenCalledWith(
      'Failed to get Flutter Dart SDK version.'
    )
    expect(process.exit).toHaveBeenCalledWith(1)
  })
})

describe('run', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  it('should warn if Flutter is not installed and failIfFlutterNotInstalled is false', async () => {
    jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
      if (name === 'pubspec_path') return 'pubspec.yaml'
      if (name === 'fail_if_flutter_not_installed') return 'false'
      return ''
    })
    jest.spyOn(core, 'warning').mockImplementation(jest.fn())
    jest.spyOn(core, 'setFailed').mockImplementation(jest.fn())
    mockedExecSync.mockImplementation(() => {
      throw new Error('not found')
    })

    await run()
    expect(core.warning).toHaveBeenCalledWith(
      expect.stringContaining('Flutter is not installed')
    )
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it('should fail if Flutter is not installed and failIfFlutterNotInstalled is true', async () => {
    jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
      if (name === 'pubspec_path') return 'pubspec.yaml'
      if (name === 'fail_if_flutter_not_installed') return 'true'
      return ''
    })
    jest.spyOn(core, 'setFailed').mockImplementation(jest.fn())
    mockedExecSync.mockImplementation(() => {
      throw new Error('not found')
    })

    await run()
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('Flutter is not installed')
    )
  })

  it('should not update pubspec.yaml if Dart version is already up to date', async () => {
    jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
      if (name === 'pubspec_path') return 'pubspec.yaml'
      if (name === 'fail_if_flutter_not_installed') return 'false'
      return ''
    })
    mockedExecSync.mockReturnValue(JSON.stringify({ dartSdkVersion: '3.5.2' }))
    mockedGetPubspecDartSdkVersion.mockReturnValue('3.5.2')
    jest.spyOn(core, 'info').mockImplementation(jest.fn())

    await run()
    expect(core.info).toHaveBeenCalledWith(
      expect.stringContaining('already up to date')
    )
    expect(mockedUpdatePubspecDartSdkVersion).not.toHaveBeenCalled()
  })

  it('should update pubspec.yaml if Dart version is outdated', async () => {
    jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
      if (name === 'pubspec_path') return 'pubspec.yaml'
      if (name === 'fail_if_flutter_not_installed') return 'false'
      return ''
    })
    mockedExecSync.mockReturnValue(JSON.stringify({ dartSdkVersion: '3.5.2' }))
    mockedGetPubspecDartSdkVersion.mockReturnValue('3.4.0')
    jest.spyOn(core, 'info').mockImplementation(jest.fn())

    await run()
    expect(core.info).toHaveBeenCalledWith(
      expect.stringContaining('Updating Dart SDK version')
    )
    expect(mockedUpdatePubspecDartSdkVersion).toHaveBeenCalledWith(
      'pubspec.yaml',
      '3.5.2'
    )
  })

  it('should handle error when reading pubspec.yaml fails', async () => {
    jest.spyOn(core, 'getInput').mockImplementation((name: string) => {
      if (name === 'pubspec_path') return 'pubspec.yaml'
      if (name === 'fail_if_flutter_not_installed') return 'false'
      return ''
    })
    mockedExecSync.mockReturnValue(JSON.stringify({ dartSdkVersion: '3.5.2' }))
    mockedGetPubspecDartSdkVersion.mockImplementation(() => {
      throw new Error('read error')
    })
    jest.spyOn(core, 'setFailed').mockImplementation(jest.fn())

    await run()
    expect(core.setFailed).toHaveBeenCalledWith('read error')
  })
})
