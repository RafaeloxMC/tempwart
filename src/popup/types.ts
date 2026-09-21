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

export interface IJmapSessionAccount {
	name: string;
	isPersonal: boolean;
	isReadOnly: boolean;
	accountCapabilities: Record<string, unknown>;
}

export interface IJmapSessionResponse {
	accounts: Record<string, IJmapSessionAccount>;
	primaryAccounts: {
		"urn:ietf:params:jmap:mail": string;
	};
}

export interface IJmapResponse {
	methodResponses: [["x:Account/get", IAccountGetResponse, string]];
	sessionState: string;
}
