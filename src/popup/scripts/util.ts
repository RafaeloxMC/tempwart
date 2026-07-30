import type {
	IAccountFetchAllJmapResponse,
	IJmapSessionResponse,
} from "../types.js";
import { userAgent } from "./constants.js";
import { storage } from "./storage.js";

let accountId = "";
let ids: string[] = [];
let emails: string[] = [];

async function getStoredString(key: string): Promise<string | undefined> {
	const result = await storage.get(key);
	const value = result[key];

	return typeof value === "string" && value !== "" ? value : undefined;
}

export async function getStalwartApiUrl(): Promise<string> {
	const stalwartApiUrl = await getStoredString("STALWART_API_URL");
	if (stalwartApiUrl != null) {
		return stalwartApiUrl;
	}

	window.location.href = "/popup/pages/onboarding/index.html";
	console.log("Stalwart API route not set. Redirecting to onboarding.");
	return "";
}

export async function getStalwartApiKey(): Promise<string> {
	const stalwartApiKey = await getStoredString("STALWART_API_KEY");
	if (stalwartApiKey != null) {
		return stalwartApiKey;
	}

	window.location.href = "/popup/pages/onboarding/index.html";
	console.log("Stalwart API route not set. Redirecting to onboarding.");
	return "";
}

export async function getStalwartCurrentEmail(): Promise<string> {
	const stalwartCurrentEmail = await getStoredString("STALWART_EMAIL");
	if (stalwartCurrentEmail != null) {
		return stalwartCurrentEmail;
	}

	window.location.href = "/popup/pages/onboarding/account/index.html";
	console.log("Stalwart email not selected. Redirecting to onboarding.");
	return "";
}

export async function getStalwartCurrentEmailId(): Promise<string> {
	const stalwartCurrentEmailId = await getStoredString("STALWART_EMAIL_ID");
	if (stalwartCurrentEmailId != null) {
		return stalwartCurrentEmailId;
	}

	window.location.href = "/popup/pages/onboarding/account/index.html";
	console.log("Stalwart email id not found. Redirecting to onboarding.");
	return "";
}

export async function setStalwartCurrentEmail(email: string): Promise<void> {
	await storage.set({ STALWART_EMAIL: email });
}

export async function setStalwartCurrentEmailId(id: string): Promise<void> {
	await storage.set({ STALWART_EMAIL_ID: id });
}

export async function setStalwartApiUrl(url: string): Promise<void> {
	await storage.set({ STALWART_API_URL: url });
}

export async function setStalwartApiKey(key: string): Promise<void> {
	await storage.set({ STALWART_API_KEY: key });
}

export async function fetch_account_id(): Promise<string | null> {
	const rootDomain = await getStalwartApiUrl();
	const authToken = await getStalwartApiKey();

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

	console.log(responseJson);

	return responseJson.primaryAccounts["urn:ietf:params:jmap:mail"];
}

export async function fetch_all_accounts(): Promise<string[]> {
	if (!accountId) {
		accountId = (await fetch_account_id()) ?? "";
	}

	const rootDomain = await getStalwartApiUrl();
	const authToken = await getStalwartApiKey();

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
	ids = responseJson.methodResponses[0][1].ids;
	emails = responseJson.methodResponses[1][1].list.map(
		(item) => item.emailAddress,
	);
	return ids;
}

export function getFetchedAccountEmails(): string[] {
	return emails;
}
