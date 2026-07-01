import { createHmac, timingSafeEqual } from 'crypto';
import type {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IDataObject,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

export class RelayionTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Relayion Trigger',
		name: 'relayionTrigger',
		icon: 'file:relayion.png',
		group: ['trigger'],
		version: 1,
		subtitle: '={{ $parameter["events"].join(", ") }}',
		description:
			'Starts the workflow when Relayion fires a webhook event (inbound SMS, delivery status, etc.)',
		defaults: { name: 'Relayion Trigger' },
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'relayionApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Activate this workflow first. Once active, n8n will display the webhook URL below. Copy it and register it in the Relayion console under Settings > Webhooks > Create. After saving, copy the secret Relayion shows you and paste it into the Webhook Secret field in your Relayion API credential.',
				name: 'setupNotice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Subscribed Events',
				name: 'events',
				type: 'multiOptions',
				default: [],
				description:
					'Select the events you plan to subscribe to in the Relayion console. This field is for reference only and does not configure the actual subscription.',
				options: [
					{ name: 'Inbound SMS Received', value: 'inbound.received' },
					{ name: 'Outbound SMS Delivered', value: 'outbound.delivered' },
					{ name: 'Outbound SMS Dispatched', value: 'outbound.dispatched' },
					{ name: 'Outbound SMS Failed', value: 'outbound.failed' },
					{ name: 'Outbound SMS Queued', value: 'outbound.queued' },
					{ name: 'Outbound SMS Sent', value: 'outbound.sent' },
				],
			},
		],
		usableAsTool: true,
	};

	// Passive trigger: the webhook URL is registered manually in the Relayion console.
	// These lifecycle stubs satisfy n8n's linter requirement for webhook nodes.
	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				return true;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const res = this.getResponseObject();

		const credentials = await this.getCredentials('relayionApi');
		const webhookSecret = credentials.webhookSecret as string | undefined;

		if (webhookSecret) {
			const signature = req.headers['x-relayion-signature'] as string | undefined;
			const rawBody: Buffer | string = (req as IDataObject & { rawBody: Buffer | string }).rawBody ?? '';
			const bodyString = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody;
			const expected = createHmac('sha256', webhookSecret).update(bodyString).digest('hex');

			// Use timingSafeEqual to prevent timing attacks that could leak the expected signature.
			const sigBuf = Buffer.from(signature ?? '', 'hex');
			const expBuf = Buffer.from(expected, 'hex');
			const isValid = sigBuf.length === expBuf.length && timingSafeEqual(sigBuf, expBuf);

			if (!isValid) {
				res.writeHead(401, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ error: 'Invalid webhook signature.' }));
				return { noWebhookResponse: true };
			}
		}

		const body = this.getBodyData() as IDataObject;

		return {
			workflowData: [
				[
					{
						json: {
							...body,
							receivedAt: new Date().toISOString(),
						},
					},
				],
			],
		};
	}
}
