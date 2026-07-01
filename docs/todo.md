# n8n-nodes-relayion — Todo & Roadmap

## Deferred Items

- Replace PNG icon with SVG brand asset when vector version is available. Remove the ESLint override in `eslint.config.mjs` after the swap.
- Set up OIDC Trusted Publishing on npm to replace the `NPM_TOKEN` secret (no long-lived secrets).
- Submit to the n8n community nodes marketplace listing once the node has been validated by customers.
- Add documentation page at `docs.relayion.com` for the n8n integration covering install, credential setup, and trigger configuration.

---

## Pre-Production Checklist

- [x] Security review completed
- [x] HMAC signature verification uses timingSafeEqual
- [x] No hardcoded secrets
- [x] Published to npm with provenance via GitHub Actions
- [x] End-to-end tested (send SMS, inbound trigger)
- [ ] Customer-facing documentation at docs.relayion.com
