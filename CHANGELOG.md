# Changelog

All notable changes to `barber-saas-platform-admin-app` are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-10-08

MVP 2 (corte 2): first release of this repository to `main`, promoted from `develop` through `qa`
with `git cherry-pick -x` (norm 10–11).

User stories: code-corhuila/barber-saas-docs#12, code-corhuila/barber-saas-docs#59.

### Added

- **shell:** add the contract with the shell and the four view states
- **platform:** call platform-admin-service and apply its rules
- **platform:** add the barbershop screens and expose them as routes
- **platform:** add the plan screens

### Fixed

- **plans:** say 'Hasta 1 barbero' for a one-barber plan

### Documentation

- **readme:** point the header to Barber Saas and barber-saas-docs
- **readme:** explain the app and how to build an Angular domain app

### Maintenance

- set up the Ionic Angular domain app with Native Federation
- let the test step pass until the first test exists
- **deploy:** serve the built remote for development and review

[2.0.0]: https://github.com/code-corhuila/barber-saas-platform-admin-app/releases/tag/v2.0.0
