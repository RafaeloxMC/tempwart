export interface IAccountAlias {
	enabled: boolean;
	name: string;
	domainId: string;
	description: string | null;
}

export interface IAccountListItem {
	name: string;
	domainId: string;
	memberGroupIds: Record<string, unknown>;
	memberTenantId: string | null;
	aliases: Record<string, IAccountAlias>;
	description: string;
	emailAddress: string;
}

export interface IAccountGetResponse {
	accountId: string;
	list: IAccountListItem[];
	notFound: string[];
}

export interface IAccountQueryResponse {
	accountId: string;
	queryState: string;
	canCalculateChanges: boolean;
	position: number;
	ids: string[];
	total: number;
}

export interface IAccountFetchAllItem {
	createdAt: string;
	description: string | null;
	emailAddress: string;
	id: string;
}

export interface IAccountFetchAllResponse {
	accountId: string;
	list: IAccountFetchAllItem[];
	notFound: string[];
}

export interface IAccountFetchAllJmapResponse {
	methodResponses: [
		["x:Account/query", IAccountQueryResponse, string],
		["x:Account/get", IAccountFetchAllResponse, string],
	];
	sessionState: string;
}

export interface IJmapSessionResponse {
	primaryAccounts: {
		"urn:ietf:params:jmap:mail": string;
	};
}

export interface IJmapResponse {
	methodResponses: [["x:Account/get", IAccountGetResponse, string]];
	sessionState: string;
}
