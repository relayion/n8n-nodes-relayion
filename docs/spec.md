# n8n-nodes-relayion — Spec
Version: 1.1
Date: 2026-06-25
Author: Raffy

## Revision History

| Version | Date | Summary |
|---|---|---|
| 1.0 | 2026-06-25 | Initial spec |
| 1.1 | 2026-07-01 | Add optional device routing on outbound send; add beta release process |

---

## 1. Purpose

An n8n community node package that integrates Relayion's SMS Gateway API into n8n workflows. Customers install it from npm through the n8n community nodes panel and use it to send SMS, query messages and conversations, list devices, and trigger workflows automatically when SMS events occur. Only customer-facing (API key) endpoints are exposed. Internal JWT-protected endpoints are intentionally excluded.

---

## 2. Engineering Mode

Enterprise Mode — this is a published public package representing the Relayion brand. Documentation, API contracts, and release process must meet production standards. Testing mandate is waived because there is no domain logic to test — the package is a thin integration layer over HTTP calls that are exercised end-to-end in n8n directly.

---

## 3. Nodes

### Relayion (regular node)

Executes API calls against the Relayion SMS Gateway. Uses the `execute()` pattern (not routing) so the `baseUrl` can be read from credentials at runtime.

| Resource | Operation | Method | Endpoint |
|---|---|---|---|
| Outbound Message | Send | POST | `/api/v1/outbound` (optional: `deviceId`, `simSlotIndex`) |
| Outbound Message | Get | GET | `/api/v1/outbound/:id` |
| Outbound Message | List | GET | `/api/v1/outbound` |
| Inbound Message | Get | GET | `/api/v1/inbound/:id` |
| Inbound Message | List | GET | `/api/v1/inbound` |
| Conversation | Get | GET | `/api/v1/conversations/:phoneNumber` |
| Device | List | GET | `/api/v1/devices` |

### Relayion Trigger (webhook trigger node)

A passive webhook trigger. Does not auto-register with Relayion. The customer activates the workflow, copies the URL n8n displays, registers it manually in the Relayion console, and pastes the webhook secret into the credential.

Verifies `X-Relayion-Signature` (HMAC-SHA256) on every incoming request using `crypto.timingSafeEqual()`. Rejects with 401 if the signature is invalid. Verification is skipped if `webhookSecret` is blank (development convenience only).

Supported events:
- `inbound.received`
- `outbound.queued`
- `outbound.dispatched`
- `outbound.sent`
- `outbound.delivered`
- `outbound.failed`

---

## 4. Credential — RelayionApi

| Field | Type | Required | Notes |
|---|---|---|---|
| API Key | password | Yes | Bearer token, format `rlyn_...` |
| Base URL | string | Yes | Default `https://api.relayion.com`. Supports self-hosted installs. |
| Webhook Secret | password | No | Required for trigger node signature verification. |

Credential test hits `GET /api/v1/devices` — lightweight, authenticated, no side effects.

---

## 5. Architecture

```
credentials/
  RelayionApi.credentials.ts

nodes/Relayion/
  Relayion.node.ts             — regular node, execute() pattern
  RelayionTrigger.node.ts      — passive webhook trigger
  shared/transport.ts          — httpRequestWithAuthentication wrapper
  resources/outbound.ts        — outbound operations and fields
  resources/inbound.ts         — inbound operations and fields
  resources/conversation.ts    — conversation operations and fields
  resources/device.ts          — device operations and fields
  *.node.json                  — codex metadata
  relayion.png                 — brand icon
```

---

## 6. Release Process

Releases go through GitHub Actions only. Local `npm publish` is blocked by the `prepublishOnly` hook and n8n's provenance requirement (enforced since May 1 2026).

### Stable release

1. Run `npm run release` locally — lints, builds, prompts for version bump, commits, tags, and pushes
2. The tag push triggers `.github/workflows/publish.yml`
3. GitHub Actions builds the package and publishes to npm with provenance attestation
4. n8n detects the new `latest` version and queues a re-review

### Beta release

Used to test in a containerized n8n without triggering n8n's re-review queue.

1. Set version in `package.json` to a pre-release identifier (e.g. `0.1.7-beta.1`) and push the branch
2. Go to GitHub → Actions → **Publish Beta** → Run workflow → select the branch
3. Package lands on npm under the `beta` dist-tag — install via n8n community nodes panel using `n8n-nodes-relayion@beta`
4. When satisfied, set version back to the stable number (e.g. `0.1.7`) and run `npm run release`

---

## 7. External Dependencies

- Relayion SMS Gateway API (`https://api.relayion.com`)
- npm registry (package distribution)
- n8n (host environment — `n8n-workflow` is a peer dependency)

---

## 8. Security

- API key injected via n8n credential system — never set manually in node code
- Webhook signature verified with `timingSafeEqual` to prevent timing attacks
- No hardcoded secrets anywhere in the codebase
- Customers must set `webhookSecret` in production — without it, the trigger accepts any POST

---

## 9. Out of Scope

- JWT-protected internal endpoints (device registration, webhook management, user management)
- Automatic webhook registration with Relayion
- Multi-tenant or admin-level operations
- Any endpoint not accessible via API key
