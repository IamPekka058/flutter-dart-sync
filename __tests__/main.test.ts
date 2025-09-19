import { jest } from '@jest/globals'

// Use unstable_mockModule for ESM mocking
jest.unstable_mockModule('child_process', () => ({
  execSync: jest.fn()
}))
jest.spyOn(process, 'exit').mockImplementation((() => {}) as never)

jest.unstable_mockModule('@actions/core', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}))

// Dynamically import the modules after mocks are set up
const { execSync } = await import('child_process')
const { getFlutterDartSdkVersion } = await import('../src/main.js') // Use .js extension for ESM imports
const core = await import('@actions/core')

const mockedExecSync = execSync as jest.Mock

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
