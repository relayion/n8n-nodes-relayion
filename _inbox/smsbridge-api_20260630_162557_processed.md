# smsbridge-api → smsbridge-node-n8n
Date: 2026-06-30
From: smsbridge-api
To: smsbridge-node-n8n

---

## What changed in the API

API keys now have a multi-scope model. Instead of being hard-bound to one device at creation, each key has an authorized list of devices (scopes). One scope is marked as the default.

### Nothing breaks in the published node

Existing `POST /api/v1/outbound` calls that only send `recipientNumber` and `body` continue to work exactly as before — the default scope's device is used automatically. No action is required to maintain current behavior.

### New capability: optional device routing on outbound send

`POST /api/v1/outbound` now accepts two optional fields:

```json
{
  "recipientNumber": "+639171234567",
  "body": "Your appointment is confirmed.",
  "deviceId": "uuid",
  "simSlotIndex": 0
}
```

- `deviceId` — route to a specific authorized device. Must be in the key's scope list or the API returns 403.
- `simSlotIndex` — pin to a specific SIM slot on the resolved device (0 or 1). Omit to use the device's default SIM.

Both are optional and independent. Omit both to use the key's default scope (current behavior).

### New error codes to handle on outbound send

| Code | HTTP | When |
|---|---|---|
| `UNAUTHORIZED_DEVICE` | 403 | `deviceId` specified but not in the key's authorized scopes |
| `NO_ELIGIBLE_DEVICE` | 422 | All authorized devices are currently offline or disabled |

---

## What smsbridge-node-n8n needs to update

### `nodes/Relayion/resources/outbound.ts` — add Options to the send operation

The send operation currently has no Options collection. Add one with `deviceId` and `simSlotIndex` as optional fields:

```ts
{
  displayName: 'Options',
  name: 'options',
  type: 'collection',
  placeholder: 'Add Option',
  default: {},
  displayOptions: { show: { ...show, operation: ['send'] } },
  options: [
    {
      displayName: 'Device ID',
      name: 'deviceId',
      type: 'string',
      default: '',
      placeholder: 'e.g. b1c2d3e4-...',
      description: 'Route this message through a specific authorized device. Leave blank to use the API key\'s default device.',
    },
    {
      displayName: 'SIM Slot Index',
      name: 'simSlotIndex',
      type: 'number',
      typeOptions: { minValue: 0, maxValue: 1 },
      default: 0,
      description: 'SIM slot to send from on the resolved device (0 or 1). Only relevant if the device has multiple SIMs.',
    },
  ],
},
```

### `Relayion.node.ts` (or wherever outbound send is executed) — pass the new fields

In the send case, read the options and include them in the request body only when provided:

```ts
const options = this.getNodeParameter('options', i, {}) as {
  deviceId?: string;
  simSlotIndex?: number;
};

const body: Record<string, unknown> = {
  recipientNumber: this.getNodeParameter('recipientNumber', i) as string,
  body: this.getNodeParameter('body', i) as string,
};

if (options.deviceId) body.deviceId = options.deviceId;
if (options.simSlotIndex !== undefined) body.simSlotIndex = options.simSlotIndex;
```

### Version bump

This is a new capability (not a breaking change). A minor version bump is appropriate after implementing.
