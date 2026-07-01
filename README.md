# n8n-nodes-relayion

This is an n8n community node for [Relayion](https://relayion.com), an SMS gateway that lets you send and receive SMS messages through a registered Android device.

Use this node to send SMS from any n8n workflow, query message history, browse conversations, and trigger workflows automatically when an SMS is received or a delivery status changes.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Trigger Node Setup](#trigger-node-setup)
[Compatibility](#compatibility)
[Resources](#resources)

---

## Installation

In your n8n instance, go to **Settings > Community Nodes > Install** and enter:

```
n8n-nodes-relayion
```

Restart n8n when prompted.

---

## Operations

### Relayion (regular node)

| Resource | Operation | Description |
|---|---|---|
| Outbound Message | Send SMS | Submit an outbound SMS to a recipient number |
| Outbound Message | Get | Retrieve a sent message and its current delivery status |
| Outbound Message | List | List sent messages with optional filters (status, recipient, date range) |
| Inbound Message | Get | Retrieve a specific received message |
| Inbound Message | List | List received messages with optional filters (sender, date range, SIM slot) |
| Conversation | Get | Get a unified thread of all messages (sent and received) with a phone number |
| Device | List | List devices registered to this API key's account, with SIM information |

### Relayion Trigger

Starts a workflow automatically when Relayion fires a webhook event.

| Event | Description |
|---|---|
| `inbound.received` | An SMS was received on your device |
| `outbound.queued` | An outbound SMS was accepted and queued |
| `outbound.dispatched` | The send instruction was delivered to the device |
| `outbound.sent` | The device confirmed the SMS was submitted to the carrier |
| `outbound.delivered` | A delivery receipt was received from the carrier |
| `outbound.failed` | The SMS failed to send |

---

## Credentials

Create a **Relayion API** credential in n8n with the following fields:

| Field | Required | Description |
|---|---|---|
| API Key | Yes | Your API key from the Relayion console (`rlyn_...`). Found under **API Keys**. |
| Base URL | Yes | Default is `https://api.relayion.com`. Change this only if you are self-hosting. |
| Webhook Secret | No | Required only when using the Relayion Trigger node. See below. |

Each API key in Relayion has a default device and SIM. The node uses that default automatically. You can optionally override it per message using the **Device ID** and **SIM Slot Index** options on the Send SMS operation.

---

## Trigger Node Setup

The Relayion Trigger does not auto-register webhooks. Setup is a one-time manual step:

1. Add a **Relayion Trigger** node to your workflow and activate it. n8n will display a webhook URL.
2. In the Relayion console, go to **Webhooks > Create** and paste that URL.
3. Select the events you want to subscribe to and complete the form.
4. Copy the secret shown after creation.
5. Paste that secret into the **Webhook Secret** field of your Relayion API credential in n8n.

From that point, Relayion will call the webhook URL whenever a subscribed event occurs and n8n will start your workflow with the event payload.

> **Important** Always set the Webhook Secret in production. Without it, the trigger accepts any incoming POST request without verifying its origin.

---

## Compatibility

Tested against n8n version **1.0+**.

Requires a Relayion account with at least one registered device and an active API key.

---

## Resources

- [Relayion website](https://relayion.com)
- [Relayion documentation](https://relayion.com/docs)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Report an issue](https://github.com/relayion/n8n-nodes-relayion/issues)
