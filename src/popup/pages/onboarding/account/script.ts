import { userAgent } from "../../../scripts/constants.js";
import {
	getStalwartApiKey,
	getStalwartApiUrl,
	setStalwartCurrentEmail,
	setStalwartCurrentEmailId,
} from "../../../scripts/util.js";
import type {
	IAccountFetchAllJmapResponse,
	IJmapSessionResponse,
} from "../../../types.js";

const rootDomain = getStalwartApiUrl();
const authToken = getStalwartApiKey();
let accountId = "";

let ids: string[] = [];
let emails: string[] = [];

function select() {
	const dropdownSelected = (
		document.getElementById("accounts") as HTMLSelectElement
	).value;
	const id = ids[emails.findIndex((a) => a == dropdownSelected)];
	if (!id || id == "" || dropdownSelected == "") {
		return alert("Email or ID not found!");
	}

	console.log("Submitting ID:", id, "-", dropdownSelected);
	setStalwartCurrentEmail(dropdownSelected);
	setStalwartCurrentEmailId(id);
}

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

	console.log(responseJson);

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
	ids = responseJson.methodResponses[0][1].ids;

	if (ids.length > 1) {
		console.log("Select one of the following IDs:");
		for (let i = 0; i < ids.length; i++) {
			emails.push(
				responseJson.methodResponses[1][1].list[i]?.emailAddress ?? "",
			);
			console.log(
				`${i}: "${ids[i]}" - "${responseJson.methodResponses[1][1].list[i]?.emailAddress}"`,
			);
			const accounts = document.getElementById("accounts");
			if (accounts != null)
				accounts.innerHTML += `<option>${responseJson.methodResponses[1][1].list[i]?.emailAddress}</option>`;
			else console.log("Accounts dropdown not found!");
		}
	} else if (ids.length == 0) {
		throw Error("No accounts IDs found in Stalwart account.");
	} else {
		accountId = ids[0] ?? "";
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const selectBtn = document.getElementById("select_btn");
	selectBtn?.addEventListener("click", select);
});

fetch_all_accounts();
