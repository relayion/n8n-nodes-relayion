import type { INodeProperties } from 'n8n-workflow';

const show = { resource: ['conversation'] };

export const conversationOperations: INodeProperties[] = [
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
				action: 'Get a conversation',
				description:
					'Get a unified thread of inbound and outbound messages with a phone number',
			},
		],
		default: 'get',
	},
];

export const conversationFields: INodeProperties[] = [
	{
		displayName: 'Phone Number',
		name: 'phoneNumber',
		type: 'string',
		required: true,
		default: '',
		placeholder: '+639171234567',
		description: 'The external phone number whose conversation to retrieve',
		displayOptions: { show: { ...show, operation: ['get'] } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { ...show, operation: ['get'] } },
		options: [
			{
				displayName: 'Direction',
				name: 'direction',
				type: 'options',
				options: [
					{ name: 'Both', value: '' },
					{ name: 'Inbound Only', value: 'inbound' },
					{ name: 'Outbound Only', value: 'outbound' },
				],
				default: '',
				description: 'Restrict results to one direction',
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
				description: 'Scope to a specific SIM slot',
			},
			{
				displayName: 'From Date',
				name: 'from',
				type: 'dateTime',
				default: '',
				description: 'Return messages on or after this date',
			},
			{
				displayName: 'To Date',
				name: 'to',
				type: 'dateTime',
				default: '',
				description: 'Return messages on or before this date',
			},
		],
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { ...show, operation: ['get'] } },
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
				displayName: 'Sort Order',
				name: 'sortOrder',
				type: 'options',
				options: [
					{ name: 'Ascending', value: 'asc' },
					{ name: 'Descending', value: 'desc' },
				],
				default: 'desc',
				description: 'Direction to sort messages in the conversation',
			},
		],
	},
];
