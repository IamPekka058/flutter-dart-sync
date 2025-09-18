# flutter-dart-sync

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

> [!NOTE] The current version of this action only supports pinning the exact
> Dart SDK version (e.g., `sdk: 3.1.0`). It does not yet support version ranges
> (e.g., `sdk: '>=3.1.0 <4.0.0'`).

**flutter-dart-sync** is a GitHub Action that automatically updates the Dart SDK
version in your `pubspec.yaml` to match the Dart version bundled with the
installed Flutter SDK. This ensures that your project's Dart SDK constraint is
always in sync with the Flutter version used in your CI environment.

## Inputs

| Name                            | Description                                                     | Required | Default          |
| ------------------------------- | --------------------------------------------------------------- | -------- | ---------------- |
| `pubspec_path`                  | Path to the `pubspec.yaml` file.                                | `true`   | `./pubspec.yaml` |
| `fail_if_flutter_not_installed` | Whether to fail the action if the Flutter SDK is not installed. | `false`  | `false`          |

## Usage

To use this action in your workflow, add the following step. It's recommended to
place it after you have checked out your code and set up the Flutter SDK.

```yaml
name: CI

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.16.0' # Example version

      - name: Sync Dart SDK version with Flutter
        uses: IamPekka058/flutter-dart-sync@v1 # Replace with the correct version
        with:
          pubspec_path: './pubspec.yaml'
          fail_if_flutter_not_installed: true

      # Add subsequent steps like flutter pub get, build, test, etc.
      - name: Install Dependencies
        run: flutter pub get

      - name: Run Tests
        run: flutter test
```

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE)
file for details.
