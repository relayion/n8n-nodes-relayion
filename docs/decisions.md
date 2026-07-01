# n8n-nodes-relayion — Architecture Decisions

Not loaded by default. Read when making significant architectural choices or when you need context on why something was built a specific way.

---

### [DEC-001] Use execute() pattern instead of routing for the regular node
**Date:** 2026-06-25
**Status:** Accepted

**Context:** n8n's routing pattern (used in the starter template) hardcodes `requestDefaults.baseURL` at the node description level. Relayion supports self-hosted installs, so the base URL must come from credentials at runtime.

**Decision:** Use the `execute()` pattern with a shared transport helper that reads `baseUrl` from credentials on every call.

**Alternatives considered:** Routing with a hardcoded base URL — rejected because it would break self-hosted Relayion setups.

**Consequences:** Slightly more boilerplate in `execute()`, but full runtime flexibility for base URL.

---

### [DEC-002] Passive webhook trigger — no auto-registration
**Date:** 2026-06-25
**Status:** Accepted

**Context:** Relayion's webhook management endpoints (create, delete, list) are JWT-protected internal endpoints. Customers cannot call them with an API key.

**Decision:** Implement a passive trigger. The customer registers the webhook URL manually in the Relayion console. The node only verifies incoming requests.

**Alternatives considered:** Auto-registration using JWT — rejected because JWT is internal-only and not exposed to customers.

**Consequences:** One-time manual setup step for the customer. Documented clearly in the node's setup notice and README.

---

### [DEC-003] HMAC verification using timingSafeEqual
**Date:** 2026-06-25
**Status:** Accepted

**Context:** Webhook signature verification using plain string equality (`!==`) is vulnerable to timing attacks that can leak the expected signature byte by byte.

**Decision:** Use `crypto.timingSafeEqual()` with a length check guard. The signature and expected HMAC are decoded from hex into equal-length buffers before comparison.

**Alternatives considered:** Plain `!==` string comparison — rejected due to timing attack vulnerability for a public package.

**Consequences:** Constant-time comparison on every webhook call. Length mismatch short-circuits before `timingSafeEqual` is called, avoiding a potential throw on mismatched buffer sizes.

---

### [DEC-004] PNG icon instead of SVG
**Date:** 2026-06-25
**Status:** Accepted

**Context:** n8n recommends SVG icons for community nodes. The Relayion brand asset was only available as a PNG at the time of initial release.

**Decision:** Use the PNG brand asset. Downgraded the ESLint SVG rule from error to warning in `eslint.config.mjs` to unblock publishing.

**Alternatives considered:** SVG — to be revisited when a vector version of the brand asset is available.

**Consequences:** Icon may appear slightly less sharp at very large sizes. Replace with SVG when available and remove the ESLint override.

---

### [DEC-005] Publishing via GitHub Actions with npm provenance
**Date:** 2026-06-25
**Status:** Accepted

**Context:** Starting May 1 2026, n8n requires all community node packages to be published via GitHub Actions with npm provenance statements. Local publishing is blocked by the `prepublishOnly` hook.

**Decision:** All releases go through `.github/workflows/publish.yml`. Local `npm run release` handles versioning, committing, tagging, and pushing. The tag push triggers the workflow which publishes with `--provenance`.

**Alternatives considered:** Local publish — no longer supported by n8n's toolchain.

**Consequences:** Publish requires a valid `NPM_TOKEN` secret in the GitHub repo with 2FA bypass enabled.
