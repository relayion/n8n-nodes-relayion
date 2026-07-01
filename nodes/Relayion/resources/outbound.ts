import type { INodeProperties } from 'n8n-workflow';

const show = { resource: ['outbound'] };

export const outboundOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		options: [
			{
				name: 'Send SMS',
				value: 'send',
				action: 'Send an SMS',
				description: 'Submit an outbound SMS request',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a message',
				description: 'Get the details of a sent message',
			},
			{
				name: 'List',
				value: 'list',
				action: 'List messages',
				description: 'List outbound messages for this API key',
			},
		],
		default: 'send',
	},
];

export const outboundFields: INodeProperties[] = [
	// ── send ─────────────────────────────────────────────────────────────────
	{
		displayName: 'Recipient Number',
		name: 'recipientNumber',
		type: 'string',
		required: true,
		default: '',
		placeholder: '+639171234567',
		description: 'Phone number to send the SMS to, in E.164 format',
		displayOptions: { show: { ...show, operation: ['send'] } },
	},
	{
		displayName: 'Message Body',
		name: 'body',
		type: 'string',
		typeOptions: { rows: 3 },
		required: true,
		default: '',
		placeholder: 'e.g. Your appointment is confirmed for tomorrow at 10am.',
		description: 'Text content of the SMS',
		displayOptions: { show: { ...show, operation: ['send'] } },
	},

	// ── send options ─────────────────────────────────────────────────────────
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

	// ── get ──────────────────────────────────────────────────────────────────
	{
		displayName: 'Message',
		name: 'messageId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'The outbound message to retrieve',
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'searchOutboundMessages',
					searchable: true,
				},
			},
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				hint: 'Enter the message ID',
				placeholder: 'e.g. msg_abc123',
			},
		],
		displayOptions: { show: { ...show, operation: ['get'] } },
	},

	// ── simplify (get + list) ────────────────────────────────────────────────
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		default: true,
		description: 'Whether to return a simplified version of the response instead of the full data',
		displayOptions: { show: { ...show, operation: ['get', 'list'] } },
	},

	// ── list ─────────────────────────────────────────────────────────────────
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { ...show, operation: ['list'] } },
		options: [
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Delivered', value: 'delivered' },
					{ name: 'Dispatched', value: 'dispatched' },
					{ name: 'Failed', value: 'failed' },
					{ name: 'Queued', value: 'queued' },
					{ name: 'Sent', value: 'sent' },
				],
				default: 'delivered',
				description: 'Filter by delivery status',
			},
			{
				displayName: 'Recipient Number',
				name: 'recipientNumber',
				type: 'string',
				default: '',
				placeholder: '+639171234567',
				description: 'Filter by recipient phone number',
			},
			{
				displayName: 'From Date',
				name: 'from',
				type: 'dateTime',
				default: '',
				description: 'Return messages created on or after this date',
			},
			{
				displayName: 'To Date',
				name: 'to',
				type: 'dateTime',
				default: '',
				description: 'Return messages created on or before this date',
			},
		],
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { ...show, operation: ['list'] } },
		options: [
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 50,
				description: 'Max number of results to return',
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 1,
				description: 'Page number (1-indexed)',
			},
			{
				displayName: 'Sort By',
				name: 'sortBy',
				type: 'options',
				options: [
					{ name: 'Created Date', value: 'createdAt' },
					{ name: 'Recipient Number', value: 'recipientNumber' },
					{ name: 'Status', value: 'status' },
				],
				default: 'createdAt',
				description: 'Field to sort results by',
			},
			{
				displayName: 'Sort Order',
				name: 'sortOrder',
				type: 'options',
				options: [
					{ name: 'Ascending', value: 'asc' },
					{ name: 'Descending', value: 'desc' },
				],
				default: 'desc',
				description: 'Direction to sort results',
			},
		],
	},
];
