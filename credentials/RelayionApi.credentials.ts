import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class RelayionApi implements ICredentialType {
	name = 'relayionApi';
	displayName = 'Relayion API';
	documentationUrl = 'https://docs.relayion.com';
	icon = 'file:relayion.png' as const;

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your API key starting with rlyn_. Found in the Relayion console under API Keys.',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.relayion.com',
			description: 'Relayion API base URL. Change only if self-hosting.',
		},
		{
			displayName: 'Webhook Secret',
			name: 'webhookSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'Webhook secret shown when creating a webhook in the Relayion console. Required only when using the Relayion Trigger node to verify incoming webhook signatures.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	// GET /api/v1/devices is a lightweight authenticated call — no side effects, fast response.
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api/v1/devices',
			method: 'GET',
		},
	};
}
