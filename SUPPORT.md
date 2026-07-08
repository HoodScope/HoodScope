# Support

## Documentation

- [README](README.md) — overview, quick start, check reference
- [CLI README](cli/README.md) — terminal usage
- [Architecture](docs/architecture.md) — how HoodScope works
- [Sample output](examples/sample_output.md) — example CLI reports
- [Contributing](CONTRIBUTING.md) — development guide
- [GitHub setup](docs/GITHUB_SETUP.md) — login & repo isolation

## Live App

[hoodscope.pro](https://hoodscope.pro)

## Common Issues

### GoPlus checks on Robinhood Chain

GoPlus Security API does not support Robinhood Chain (chain ID 4663) yet. HoodScope returns **INFO** findings explaining the network limitation while RPC, explorer, and DexScreener checks continue.

### Scan is slow

First scan fetches data from 3 sources in parallel. Typical scan takes 5–15 seconds depending on RPC latency.

### AI summary is deterministic

Set `GITHUB_TOKEN` with `models:read` scope to enable GitHub Models AI summaries. See [`.env.example`](.env.example).

## Get Help

- [GitHub Issues](https://github.com/HoodScope/HoodScope/issues) — bugs and feature requests
- [GitHub Profile](https://github.com/HoodScope)
- [Security](SECURITY.md) — report vulnerabilities privately
