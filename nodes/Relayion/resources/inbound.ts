import type { INodeProperties } from 'n8n-workflow';

const show = { resource: ['inbound'] };

export const inboundOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get a message',
				description: 'Get the details of a received message',
			},
			{
				name: 'List',
				value: 'list',
				action: 'List messages',
				description: 'List inbound messages scoped to this API key\'s phone number',
			},
		],
		default: 'list',
	},
];

export const inboundFields: INodeProperties[] = [
	// ── get ──────────────────────────────────────────────────────────────────
	{
		displayName: 'Message',
		name: 'messageId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		description: 'The inbound message to retrieve',
		modes: [
			{
				displayName: 'From List',
				name: 'list',
				type: 'list',
				typeOptions: {
					searchListMethod: 'searchInboundMessages',
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
				displayName: 'From Date',
				name: 'from',
				type: 'dateTime',
				default: '',
				description: 'Return messages received on or after this date',
			},
			{
				displayName: 'Sender Number',
				name: 'senderNumber',
				type: 'string',
				default: '',
				placeholder: '+639171234567',
				description: 'Filter by sender phone number',
			},
			{
				displayName: 'SIM Slot Index',
				name: 'simSlotIndex',
				type: 'options',
				options: [
					{ name: 'SIM 1 (Slot 0)', value: 0 },
					{ name: 'SIM 2 (Slot 1)', value: 1 },
				],
				default: 0,
				description: 'Filter by SIM slot',
			},
			{
				displayName: 'To Date',
				name: 'to',
				type: 'dateTime',
				default: '',
				description: 'Return messages received on or before this date',
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
					{ name: 'Received Date', value: 'receivedAt' },
					{ name: 'Sender Number', value: 'senderNumber' },
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
