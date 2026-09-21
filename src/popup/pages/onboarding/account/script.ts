import { userAgent } from "../../../scripts/constants.js";
import {
	getStalwartApiKey,
	getStalwartApiUrl,
	setStalwartCurrentEmail,
	setStalwartCurrentEmailId,
} from "../../../scripts/util.js";
import type {
	IJmapSessionAccount,
	IJmapSessionResponse,
} from "../../../types.js";

let accountId = "";

let ids: string[] = [];
let emails: string[] = [];
let sessionAccounts: Record<string, IJmapSessionAccount> = {};

async function select() {
	const dropdownSelected = (
		document.getElementById("accounts") as HTMLSelectElement
	).value;
	const id = ids[emails.findIndex((a) => a == dropdownSelected)];
	if (!id || id == "" || dropdownSelected == "") {
		return alert("Email or ID not found!");
	}

	console.log("Submitting ID:", id, "-", dropdownSelected);
	await setStalwartCurrentEmail(dropdownSelected);
	await setStalwartCurrentEmailId(id);
	window.location.href = "/popup/index.html";
}

async function fetch_account_id() {
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

	sessionAccounts = responseJson.accounts ?? {};
	accountId = responseJson.primaryAccounts["urn:ietf:params:jmap:mail"];
	console.log(`Found primary account ID "${accountId}"`);
}

async function fetch_all_accounts() {
	if (!accountId) await fetch_account_id();

	ids = Object.keys(sessionAccounts);

	if (ids.length == 0) {
		throw Error("No accounts found in Stalwart session.");
	}

	console.log("Select one of the following IDs:");
	for (let i = 0; i < ids.length; i++) {
		const id = ids[i];
		if (!id) continue;
		const email = sessionAccounts[id]?.name ?? "";
		emails.push(email);
		console.log(`${i}: "${id}" - "${email}"`);
		const accounts = document.getElementById("accounts");
		if (accounts != null)
			accounts.innerHTML += `<option>${email}</option>`;
		else console.log("Accounts dropdown not found!");
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const selectBtn = document.getElementById("select_btn");
	selectBtn?.addEventListener("click", select);
});

fetch_all_accounts();
