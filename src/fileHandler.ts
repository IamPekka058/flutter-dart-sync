import * as fs from 'fs'
import * as yaml from 'js-yaml'
import PubspecFile from './PubspecType.js'
import * as core from '@actions/core'

/**
 * Updates the pubspec.yaml file to set the Dart SDK version constraint to the specified version.
 *
 * @param pubspecPath Path to the pubspec.yaml file.
 * @param newVersion Dart SDK version to set in the pubspec.yaml file.
 */
export function updatePubspecDartSdkVersion(
  pubspecPath: string,
  newVersion: string
): void {
    updateDependencyVersion(pubspecPath, 'sdk', newVersion, 'environment');
}

/**
 * Updates the specified dependency version in the pubspec.yaml file.
 *
 * @param pubspecPath - The path to the pubspec.yaml file.
 * @param dependencyName - The name of the dependency to update.
 * @param dependencyVersion - The new version of the dependency.
 */
export function updateDependencyVersion(
  pubspecPath: string,
  dependencyName: string, dependencyVersion:string, dependencyType: string){

    try {
        const pubspecContent = fs.readFileSync(pubspecPath, 'utf-8')
        const pubspec = yaml.load(pubspecContent) as PubspecFile

        if (
            typeof pubspec[dependencyType] === 'object' &&
            pubspec[dependencyType] !== null
        ) {
            (pubspec[dependencyType] as Record<string, unknown>)[dependencyName] = dependencyVersion
        } else {
            throw new Error(`Dependency type '${dependencyType}' not found or not an object in pubspec.yaml`)
        }

        const newPubspecContent = yaml.dump(pubspec)
        fs.writeFileSync(pubspecPath, newPubspecContent, 'utf-8')
        core.info(`Updated ${dependencyName} ${dependencyType} version in pubspec.yaml to ${dependencyVersion}`)
    } catch (error) {
        core.debug(
            `Failed to update dependency in pubspec.yaml: ${error instanceof Error ? error.message : String(error)}`
        )
        core.error(
            'Failed to update dependency in pubspec.yaml. Please ensure the file is writable and the path is correct.'
        )
        process.exit(1)
    }
  }

/**
 * Reads the Dart SDK version constraint from the given pubspec.yaml file.
    const pubspecContent = fs.readFileSync(pubspecPath, 'utf-8');
 * @param pubspecPath - The path to the pubspec.yaml file.
 * @returns The minimum Dart SDK version specified in the pubspec.yaml, or an empty string if not found.
**/
export function getPubspecDartSdkVersion(pubspecPath: string): string {
  try {
    const pubspecContent = fs.readFileSync(pubspecPath, 'utf-8')

    const pubspec = yaml.load(pubspecContent) as PubspecFile
    const sdkConstraint = pubspec?.environment?.sdk
    if (typeof sdkConstraint === 'string') {
      // Handles both constraint strings (e.g., ">=2.12.0 <3.0.0") and plain version numbers (e.g., "2.12.0")
      const match = sdkConstraint.match(/(?:>=\s*)?([\d.]+)/)
      if (match && match[1]) {
        return match[1]
      }
    }
    throw new Error('Dart SDK version constraint not found in pubspec.yaml')
  } catch (error) {
    core.debug(
      `Failed to read or parse pubspec.yaml: ${error instanceof Error ? error.message : String(error)}`
    )
    core.error(
      'Failed to read or parse pubspec.yaml. Please ensure the path is correct and contains a valid Dart SDK version constraint.'
    )
    process.exit(1)
  }
}