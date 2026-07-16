import { readFileSync } from "fs";

interface IAccountAlias {
	enabled: boolean;
	name: string;
	domainId: string;
	description: string | null;
}

interface IAccountListItem {
	name: string;
	domainId: string;
	memberGroupIds: Record<string, unknown>;
	memberTenantId: string | null;
	aliases: Record<string, IAccountAlias>;
	description: string;
	emailAddress: string;
}

interface IAccountGetResponse {
	accountId: string;
	list: IAccountListItem[];
	notFound: string[];
}

interface IAccountQueryResponse {
	accountId: string;
	queryState: string;
	canCalculateChanges: boolean;
	position: number;
	ids: string[];
	total: number;
}

interface IAccountFetchAllItem {
	createdAt: string;
	description: string | null;
	emailAddress: string;
	id: string;
}

interface IAccountFetchAllResponse {
	accountId: string;
	list: IAccountFetchAllItem[];
	notFound: string[];
}

interface IAccountFetchAllJmapResponse {
	methodResponses: [
		["x:Account/query", IAccountQueryResponse, string],
		["x:Account/get", IAccountFetchAllResponse, string],
	];
	sessionState: string;
}

interface IJmapSessionResponse {
	primaryAccounts: {
		"urn:ietf:params:jmap:mail": string;
	};
}

interface IJmapResponse {
	methodResponses: [["x:Account/get", IAccountGetResponse, string]];
	sessionState: string;
}

async function select_account_id(ids: string[]) {
	const answer = prompt("Select an account index: ");
	const selectedIndex = Number.parseInt(answer ?? "", 10);

	if (
		!Number.isInteger(selectedIndex) ||
		selectedIndex < 0 ||
		selectedIndex >= ids.length
	) {
		throw Error("Invalid account index selected.");
	}

	const selectedAccountId = ids[selectedIndex] ?? "";
	accountId = selectedAccountId;

	return selectedAccountId;
}

var creds = JSON.parse(readFileSync("./credentials.json", "utf8"));

let domainId = "";
let accountId = "";
let rootDomain = creds.host;
let authToken = creds.api_key;
let userAgent = "TempWart Fetching";
let aliasAmount = 2;

async function fetch_account_id() {
	const res = await fetch(`${rootDomain}/jmap/session`, {
		credentials: "include",
		headers: {
			"User-Agent": userAgent,
			Accept: "*/*",
			"Accept-Language": "en-US,en;q=0.9",
			authorization: `Bearer ${authToken}`,
			"Sec-GPC": "1",
			"Sec-Fetch-Dest": "empty",
			"Sec-Fetch-Mode": "cors",
			"Sec-Fetch-Site": "same-origin",
			Priority: "u=4",
		},
		referrer: `${rootDomain}/account/Management/x:Account/User`,
		method: "GET",
		mode: "cors",
	});

	const responseJson = (await res.json()) as IJmapSessionResponse;

	accountId = responseJson.primaryAccounts["urn:ietf:params:jmap:mail"];
	console.log(`Found primary account ID "${accountId}"`);
}

async function fetch_all_accounts() {
	if (!accountId) await fetch_account_id();

	const body = {
		using: [
			"urn:ietf:params:jmap:core",
			"urn:stalwart:jmap",
			"urn:ietf:params:jmap:blob",
			"urn:ietf:params:jmap:mail",
			"urn:ietf:params:jmap:calendars",
			"urn:ietf:params:jmap:contacts",
			"urn:ietf:params:jmap:principals",
			"urn:ietf:params:jmap:sieve",
			"urn:ietf:params:jmap:vacationresponse",
		],
		methodCalls: [
			[
				"x:Account/query",
				{
					accountId: accountId,
					filter: { "@type": "User" },
					limit: 25,
					position: 0,
					calculateTotal: true,
				},
				"0",
			],
			[
				"x:Account/get",
				{
					accountId: accountId,
					"#ids": {
						resultOf: "0",
						name: "x:Account/query",
						path: "/ids",
					},
					properties: [
						"id",
						"emailAddress",
						"description",
						"createdAt",
					],
				},
				"1",
			],
		],
	};

	const res = await fetch(`${rootDomain}/jmap/`, {
		credentials: "include",
		headers: {
			"User-Agent": userAgent,
			Accept: "*/*",
			"Accept-Language": "en-US,en;q=0.9",
			authorization: `Bearer ${authToken}`,
			"content-type": "application/json",
			"Sec-GPC": "1",
			"Sec-Fetch-Dest": "empty",
			"Sec-Fetch-Mode": "cors",
			"Sec-Fetch-Site": "same-origin",
			Priority: "u=4",
		},
		referrer: `${rootDomain}/account/Management/x:Account/User`,
		body: JSON.stringify(body),
		method: "POST",
		mode: "cors",
	});

	const responseJson = (await res.json()) as IAccountFetchAllJmapResponse;
	const ids = responseJson.methodResponses[0][1].ids;

	if (ids.length > 1) {
		console.log("Select one of the following IDs:");
		for (let i = 0; i < ids.length; i++) {
			console.log(
				`${i}: "${ids[i]}" - "${responseJson.methodResponses[1][1].list[i]?.emailAddress}"`,
			);
		}
		accountId = await select_account_id(ids);
	} else if (ids.length == 0) {
		throw Error("No accounts IDs found in Stalwart account.");
	} else {
		accountId = ids[0] ?? "";
	}
}

async function add_new() {
	if (!domainId || !accountId) await fetch_all_accounts();

	const aliasId = "aliases/" + aliasAmount;

	const body = {
		using: [
			"urn:ietf:params:jmap:core",
			"urn:stalwart:jmap",
			"urn:ietf:params:jmap:blob",
			"urn:ietf:params:jmap:mail",
		],
		methodCalls: [
			[
				"x:Account/set",
				{
					accountId: accountId,
					update: {
						domainId: {
							[aliasId]: {
								enabled: true,
								name: "test",
								domainId: domainId,
							},
						},
					},
				},
				"0",
			],
		],
	};

	await fetch(`${rootDomain}/jmap/`, {
		credentials: "include",
		headers: {
			"User-Agent": userAgent,
			Accept: "*/*",
			"Accept-Language": "en-US,en;q=0.9",
			authorization: `Bearer ${authToken}`,
			"content-type": "application/json",
			"Sec-GPC": "1",
			"Sec-Fetch-Dest": "empty",
			"Sec-Fetch-Mode": "cors",
			"Sec-Fetch-Site": "same-origin",
			Priority: "u=0",
		},
		referrer: `${rootDomain}/account/Management/x:Account/User/${accountId}`,
		body: JSON.stringify(body),
		method: "POST",
		mode: "cors",
	});
}

async function fetch_existing() {
	if (!domainId || !accountId) await fetch_all_accounts();

	const body = {
		using: [
			"urn:ietf:params:jmap:core",
			"urn:stalwart:jmap",
			"urn:ietf:params:jmap:blob",
			"urn:ietf:params:jmap:mail",
		],
		methodCalls: [
			[
				"x:Account/get",
				{
					accountId: accountId,
					ids: [accountId],
					properties: [
						"domainId",
						"emailAddress",
						"name",
						"description",
						"memberTenantId",
						"memberGroupIds",
						"aliases",
						"id",
					],
				},
				"0",
			],
		],
	};

	const res = await fetch(`${rootDomain}/jmap/`, {
		credentials: "include",
		headers: {
			"User-Agent": userAgent,
			Accept: "*/*",
			"Accept-Language": "en-US,en;q=0.9",
			authorization: `Bearer ${authToken}`,
			"content-type": "application/json",
			"Sec-GPC": "1",
			"Sec-Fetch-Dest": "empty",
			"Sec-Fetch-Mode": "cors",
			"Sec-Fetch-Site": "same-origin",
			Priority: "u=4",
		},
		referrer: `${rootDomain}/account/Management/x:Account/User/${accountId}`,
		body: JSON.stringify(body),
		method: "POST",
		mode: "cors",
	});

	if (res.status != 200) {
		throw Error("Response received with non-OK status code.");
	}

	const responseBody = (await res.json()) as IJmapResponse;
	accountId = responseBody.methodResponses[0][1].accountId;
	domainId = responseBody.methodResponses[0][1].list[0]?.domainId ?? "";

	console.log(
		`Aliases for ${responseBody.methodResponses[0][1].list[0]?.emailAddress}`,
	);
	console.log(responseBody.methodResponses[0][1].list[0]?.aliases);
}

fetch_existing();
