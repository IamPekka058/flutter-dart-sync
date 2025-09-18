# flutter-dart-sync

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

## Overview

**flutter-dart-sync** is a GitHub Action that automatically updates the Dart SDK version in your `pubspec.yaml` to match the Dart version bundled with the installed Flutter SDK.

## Features

- Automatically set and update the Dart SDK version in the `environment` section
- Optionally fail if Flutter is not installed
- Easy integration into CI/CD workflows
- TypeScript codebase with tests and linter


## Usage

Add the action to your workflow:

```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v4

  - name: flutter-dart-sync
    uses: ./
    with:
      pubspec_path: ./pubspec.yaml # required
      fail_if_flutter_not_installed: false # optional
```

## License

See [LICENSE](./LICENSE).
