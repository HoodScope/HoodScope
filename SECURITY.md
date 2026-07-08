# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in HoodScope, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, email the maintainers or open a private security advisory on GitHub.

## Scope

This policy covers:

- The HoodScope web application (`src/app/`)
- The scan API (`src/app/api/scan/`)
- The CLI package (`cli/`)
- The scan engine and data source integrations (`src/lib/`)

## Out of Scope

- Third-party APIs (GoPlus, DexScreener, Robinhood Chain RPC)
- Tokens analyzed by HoodScope — HoodScope reports on tokens; it does not secure them
- User trading decisions

## Safe Harbor

We support good-faith security research. We will not pursue legal action against researchers who:

- Report vulnerabilities promptly and privately
- Do not access user data beyond what is necessary to demonstrate the issue
- Do not degrade service availability

## Response Timeline

- **Acknowledgment**: within 72 hours
- **Initial assessment**: within 7 days
- **Fix or mitigation**: depends on severity
