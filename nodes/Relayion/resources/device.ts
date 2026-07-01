import type { INodeProperties } from 'n8n-workflow';

const show = { resource: ['device'] };

export const deviceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show },
		options: [
			{
				name: 'List',
				value: 'list',
				action: 'List devices',
				description: 'List devices accessible to this API key, with their SIM information',
			},
		],
		default: 'list',
	},
];

// No additional fields — GET /api/v1/devices takes no parameters.
export const deviceFields: INodeProperties[] = [];
