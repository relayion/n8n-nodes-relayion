# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this package, please report it privately. **Do not open a public GitHub issue.**

Send your report to hello@relayion.com and include:

- A description of the vulnerability
- Steps to reproduce
- Potential impact

We will respond within 72 hours and aim to release a fix within 14 days for confirmed issues.

## Scope

This package is an n8n community node. The following are in scope:

- Webhook signature verification bypass
- Credential or secret exposure
- Dependency vulnerabilities with exploitable attack vectors in published package code

The following are out of scope:

- Vulnerabilities in n8n itself (report to [n8n](https://github.com/n8n-io/n8n/security))
- Vulnerabilities only present in dev dependencies (not shipped in the published package)

## Production Recommendation

Always configure the **Webhook Secret** in your Relayion API credential when using the Relayion Trigger node. Without it, the trigger will accept any incoming POST request to its webhook URL. The secret is shown once when creating a webhook in the Relayion console.
