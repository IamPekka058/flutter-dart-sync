import * as core from '@actions/core'
import { execSync } from 'child_process'
import {
  getPubspecDartSdkVersion,
  updatePubspecDartSdkVersion
} from './fileHandler.js'
import { commitWithApp } from './commitHandler.js'

/**
 * Main entry point for the GitHub Action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const pubspec_path = core.getInput('pubspec_path', { required: true })
    const failIfFlutterNotInstalled =
      core.getInput('fail_if_flutter_not_installed', { required: false }) ===
      'true'

    core.debug(`pubspec_path: ${pubspec_path}`)
    core.debug(`fail_if_flutter_not_installed: ${failIfFlutterNotInstalled}`)

    if (!checkFlutterInstalled()) {
      if (failIfFlutterNotInstalled) {
        core.setFailed(
          'Flutter is not installed or not found in PATH. Please install Flutter and ensure it is accessible from the command line.'
        )
        return
      } else {
        core.warning(
          'Flutter is not installed or not found in PATH. Skipping Dart SDK version synchronization.'
        )
        return
      }
    }

    core.info(
      'Flutter is installed. Proceeding with Dart SDK version synchronization.'
    )

    // Get the Dart SDK version from Flutter
    const flutterDartVersion = getFlutterDartSdkVersion()
    const pubspecDartVersion = getPubspecDartSdkVersion(pubspec_path)

    if (flutterDartVersion == pubspecDartVersion) {
      core.info(
        `Dart SDK version in pubspec.yaml (${pubspecDartVersion}) is already up to date with Flutter's Dart SDK version (${flutterDartVersion}). No changes needed.`
      )
      return
    }

    core.info(
      `Updating Dart SDK version in pubspec.yaml from ${pubspecDartVersion} to ${flutterDartVersion}.`
    )

    updatePubspecDartSdkVersion(pubspec_path, flutterDartVersion)
    core.info('Dart SDK version synchronization complete.')

    commitWithApp(pubspec_path)

    return
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

/**
 * Checks if Flutter is installed and available in the system PATH.
 *
 * Executes 'flutter --version' to verify installation.
 * @returns {boolean} True if Flutter is installed, false otherwise.
 */
function checkFlutterInstalled(): boolean {
  try {
    execSync('flutter --version', { stdio: 'ignore' })
    return true
  } catch (error) {
    core.debug(
      `Flutter check failed: ${error instanceof Error ? error.message : String(error)}`
    )
    return false
  }
}

/**
 * Gets the Dart SDK version bundled with the installed Flutter SDK.
 *
 * @returns The Dart SDK version bundled with the installed Flutter SDK, or null if it cannot be determined.
 */
export function getFlutterDartSdkVersion(): string {
  try {
    const output = execSync('flutter --version --machine', {
      encoding: 'utf-8'
    })
    const versionInfo = JSON.parse(output)
    const flutterDartVersion = versionInfo?.dartSdkVersion
    return flutterDartVersion
  } catch (error) {
    core.debug(
      `Failed to get Flutter Dart SDK version: ${error instanceof Error ? error.message : String(error)}`
    )
    core.error('Failed to get Flutter Dart SDK version.')
    process.exit(1)
  }
}
