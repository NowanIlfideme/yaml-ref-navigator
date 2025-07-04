# Change Log

All notable changes to the "yaml-ref-navigator" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

## [UNRELEASED]

## [0.2.1]

### Change

- Updated this changelog and readme for 0.2.1
- Add logo

## [0.2.0] - 2025-07-04

### Added

- New configuration option `yamlRefNavigator.debug`: Enable debug mode (mostly for development).
- New configuration option `yamlRefNavigator.referencePatterns`: A list of regular expression patterns.
- New configuration option `yamlRefNavigator.yamlVersion`: Change the YAML version that we use.
  Default is '1.2', but can also be '1.1' or 'next' (for future YAML versions yet to be finalized).
- Warning in case of missing patterns.
- More tests, including configuration tests.

### Changed

- The annoying popup is now locked behind debug mode. :smile:

## [0.1.0] - 2025-07-04

Initial release of the extension.
