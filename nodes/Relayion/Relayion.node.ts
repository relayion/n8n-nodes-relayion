import type {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeListSearchResult,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeApiError } from 'n8n-workflow';

import { relayionApiRequest } from './shared/transport';
import { outboundOperations, outboundFields } from './resources/outbound';
import { inboundOperations, inboundFields } from './resources/inbound';
import { conversationOperations, conversationFields } from './resources/conversation';
import { deviceOperations, deviceFields } from './resources/device';

export class Relayion implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Relayion',
		name: 'relayion',
		icon: 'file:relayion.png',
		group: ['output'],
		version: 1,
		subtitle: '={{ $parameter["resource"] + ": " + $parameter["operation"] }}',
		description: 'Send and receive SMS messages via Relayion',
		defaults: { name: 'Relayion' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'relayionApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Conversation', value: 'conversation' },
					{ name: 'Device', value: 'device' },
					{ name: 'Inbound Message', value: 'inbound' },
					{ name: 'Outbound Message', value: 'outbound' },
				],
				default: 'outbound',
			},
			...outboundOperations,
			...outboundFields,
			...inboundOperations,
			...inboundFields,
			...conversationOperations,
			...conversationFields,
			...deviceOperations,
			...deviceFields,
		],
	};

	methods = {
		listSearch: {
			async searchOutboundMessages(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const credentials = await this.getCredentials('relayionApi');
				const response = await this.helpers.httpRequestWithAuthentication.call(this, 'relayionApi', {
					method: 'GET',
					url: `${credentials.baseUrl}/api/v1/outbound`,
					qs: { limit: 50 },
					json: true,
				});
				const messages = (response.data as IDataObject[]) ?? [];
				return {
					results: messages
						.filter((msg) =>
							!filter ||
							`${msg.recipientNumber} ${msg.id}`.toLowerCase().includes(filter.toLowerCase()),
						)
						.map((msg) => ({
							name: `${msg.recipientNumber} — ${msg.status}`,
							value: msg.id as string,
						})),
				};
			},

			async searchInboundMessages(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				const credentials = await this.getCredentials('relayionApi');
				const response = await this.helpers.httpRequestWithAuthentication.call(this, 'relayionApi', {
					method: 'GET',
					url: `${credentials.baseUrl}/api/v1/inbound`,
					qs: { limit: 50 },
					json: true,
				});
				const messages = (response.data as IDataObject[]) ?? [];
				return {
					results: messages
						.filter((msg) =>
							!filter ||
							`${msg.senderNumber} ${msg.id}`.toLowerCase().includes(filter.toLowerCase()),
						)
						.map((msg) => ({
							name: `${msg.senderNumber} — ${msg.receivedAt}`,
							value: msg.id as string,
						})),
				};
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			const resource = this.getNodeParameter('resource', i) as string;
			const operation = this.getNodeParameter('operation', i) as string;

			try {
				if (resource === 'outbound') {
					if (operation === 'send') {
						const options = this.getNodeParameter('options', i, {}) as {
							deviceId?: string;
							simSlotIndex?: number;
						};
						const body: IDataObject = {
							recipientNumber: this.getNodeParameter('recipientNumber', i) as string,
							body: this.getNodeParameter('body', i) as string,
						};
						if (options.deviceId) body.deviceId = options.deviceId;
						if (options.simSlotIndex !== undefined) body.simSlotIndex = options.simSlotIndex;
						const response = await relayionApiRequest.call(this, 'POST', '/outbound', body);
						returnData.push({ json: response.data as IDataObject, pairedItem: { item: i } });
					} else if (operation === 'get') {
						const messageId = this.getNodeParameter('messageId', i, undefined, {
							extractValue: true,
						}) as string;
						const simplify = this.getNodeParameter('simplify', i, true) as boolean;
						const response = await relayionApiRequest.call(this, 'GET', `/outbound/${messageId}`);
						const data = response.data as IDataObject;
						returnData.push({
							json: simplify ? simplifyObject(data, OUTBOUND_SIMPLE_FIELDS) : data,
							pairedItem: { item: i },
						});
					} else if (operation === 'list') {
						const simplify = this.getNodeParameter('simplify', i, true) as boolean;
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						const options = this.getNodeParameter('options', i, {}) as IDataObject;
						const qs = buildQs(filters, options);
						const response = await relayionApiRequest.call(this, 'GET', '/outbound', {}, qs);
						const messages = response.data as IDataObject[];
						returnData.push(
							...messages.map((msg) => ({
								json: simplify ? simplifyObject(msg, OUTBOUND_SIMPLE_FIELDS) : msg,
								pairedItem: { item: i },
							})),
						);
					}
				} else if (resource === 'inbound') {
					if (operation === 'get') {
						const messageId = this.getNodeParameter('messageId', i, undefined, {
							extractValue: true,
						}) as string;
						const simplify = this.getNodeParameter('simplify', i, true) as boolean;
						const response = await relayionApiRequest.call(this, 'GET', `/inbound/${messageId}`);
						const data = response.data as IDataObject;
						returnData.push({
							json: simplify ? simplifyObject(data, INBOUND_SIMPLE_FIELDS) : data,
							pairedItem: { item: i },
						});
					} else if (operation === 'list') {
						const simplify = this.getNodeParameter('simplify', i, true) as boolean;
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						const options = this.getNodeParameter('options', i, {}) as IDataObject;
						const qs = buildQs(filters, options);
						const response = await relayionApiRequest.call(this, 'GET', '/inbound', {}, qs);
						const messages = response.data as IDataObject[];
						returnData.push(
							...messages.map((msg) => ({
								json: simplify ? simplifyObject(msg, INBOUND_SIMPLE_FIELDS) : msg,
								pairedItem: { item: i },
							})),
						);
					}
				} else if (resource === 'conversation') {
					if (operation === 'get') {
						const phoneNumber = this.getNodeParameter('phoneNumber', i) as string;
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						const options = this.getNodeParameter('options', i, {}) as IDataObject;
						const qs = buildQs(filters, options);
						const encoded = encodeURIComponent(phoneNumber);
						const response = await relayionApiRequest.call(
							this,
							'GET',
							`/conversations/${encoded}`,
							{},
							qs,
						);
						returnData.push({ json: response.data as IDataObject, pairedItem: { item: i } });
					}
				} else if (resource === 'device') {
					if (operation === 'list') {
						const response = await relayionApiRequest.call(this, 'GET', '/devices');
						const devices = response.data as IDataObject[];
						returnData.push(
							...devices.map((dev) => ({ json: dev, pairedItem: { item: i } })),
						);
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
			}
		}

		return [returnData];
	}
}

const OUTBOUND_SIMPLE_FIELDS = ['id', 'recipientNumber', 'body', 'status', 'createdAt'];
const INBOUND_SIMPLE_FIELDS = ['id', 'senderNumber', 'body', 'status', 'receivedAt'];

function simplifyObject(obj: IDataObject, fields: string[]): IDataObject {
	return Object.fromEntries(fields.filter((f) => f in obj).map((f) => [f, obj[f]]));
}

function buildQs(...sources: IDataObject[]): IDataObject {
	const qs: IDataObject = {};
	for (const source of sources) {
		for (const [key, value] of Object.entries(source)) {
			if (value !== '' && value !== null && value !== undefined) {
				qs[key] = value;
			}
		}
	}
	return qs;
}
