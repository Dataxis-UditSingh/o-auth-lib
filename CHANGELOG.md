# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-06-01

### Added
- Initial release of `o-auth-lib`
- PKCE (Proof Key for Code Exchange) support enabled by default for OAuth flows
- Support for Google and GitHub OAuth providers with preset configurations
- Custom OAuth provider support for flexible integration
- `useAuth()` React hook for browser-based authentication flows
- `authenticate()` generic async function for OAuth and normal authentication
- Normal authentication support with flexible request payload handling (JSON and form-urlencoded)
- State validation to prevent CSRF attacks in OAuth flows
- TypeScript strict mode with full type definitions
- Source maps and declaration maps for debugging and TypeScript support
- Unit tests for OAuth and authentication services (Vitest)
- Comprehensive README with examples and API documentation
- Support for React 17 and 18 as peer dependencies

### Security
- No hardcoded credentials or secrets
- `clientSecret` is optional and not required in browser-only OAuth flows
- Secure random generation using `crypto.getRandomValues()`
- SHA-256 PKCE code challenge generation
- Environment variables for credential management
- `.env` files excluded from npm package

### Documentation
- Installation instructions for npm, yarn, and pnpm
- Browser support and target compatibility (ES2019)
- Usage examples for Google, GitHub, and custom OAuth providers
- Normal auth examples with JSON and form-urlencoded payloads
- API reference for `useAuth()` and `authenticate()`
- PKCE configuration guide
- Security best practices and warnings
