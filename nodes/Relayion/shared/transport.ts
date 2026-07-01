import type {
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	IDataObject,
	IHttpRequestOptions,
} from 'n8n-workflow';

export async function relayionApiRequest(
	this: IExecuteFunctions | IHookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject> {
	const credentials = await this.getCredentials('relayionApi');
	const baseUrl = credentials.baseUrl as string;

	const options: IHttpRequestOptions = {
		method,
		url: `${baseUrl}/api/v1${endpoint}`,
		json: true,
	};

	if (Object.keys(body).length) {
		options.body = body;
	}
	if (Object.keys(qs).length) {
		options.qs = qs;
	}

	return this.helpers.httpRequestWithAuthentication.call(this, 'relayionApi', options) as Promise<IDataObject>;
}
