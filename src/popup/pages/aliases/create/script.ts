import {
	getStalwartApiKey,
	getStalwartApiUrl,
	getStalwartCurrentEmail,
	getStalwartCurrentEmailId,
} from "../../../scripts/util.js";
import type { IJmapResponse } from "../../../types.js";

let accountId = "";
let domainId = "";
let nextAliasNumber = 0;

function setStatus(message: string, isError = false) {
	const status = document.getElementById("status");
	if (status != null) {
		status.textContent = message;
		status.setAttribute("role", "status");
		status.classList.toggle("error", isError);
	}
}

async function renderLoadedBanner() {
	const rootDomain = await getStalwartCurrentEmail();
	const domainText = document.getElementById("email_domain");
	if (domainText != null)
		domainText.innerText = "@" + (rootDomain.split("@")[1] ?? "N/A");
}

async function loadAccount() {
	accountId = await getStalwartCurrentEmailId();
	const rootDomain = await getStalwartApiUrl();
	const authToken = await getStalwartApiKey();

	const body = {
		using: ["urn:ietf:params:jmap:core", "urn:stalwart:jmap"],
		methodCalls: [
			[
				"x:Account/get",
				{
					accountId,
					ids: [accountId],
					properties: ["domainId", "aliases"],
				},
				"0",
			],
		],
	};

	const response = await fetch(`${rootDomain}/jmap/`, {
		credentials: "include",
		headers: {
			Accept: "application/json",
			authorization: `Bearer ${authToken}`,
			"content-type": "application/json",
		},
		body: JSON.stringify(body),
		method: "POST",
	});
	if (!response.ok)
		throw Error(`Account request failed (${response.status}).`);

	const responseJson = (await response.json()) as IJmapResponse;
	const account = responseJson.methodResponses[0][1].list[0];
	if (account == null) throw Error("Selected account was not found.");

	domainId = account.domainId;
	const aliasNumbers = Object.keys(account.aliases ?? {})
		.map((id) => Number.parseInt(id.replace("aliases/", ""), 10))
		.filter(Number.isInteger);
	nextAliasNumber = Math.max(-1, ...aliasNumbers) + 1;
}

async function addNew() {
	const aliasName = (
		document.getElementById("alias_name") as HTMLInputElement
	).value.trim();
	if (aliasName === "") {
		setStatus("Enter an alias name.", true);
		return;
	}
	if (!accountId || !domainId) await loadAccount();

	const rootDomain = await getStalwartApiUrl();
	const authToken = await getStalwartApiKey();
	const aliasId = "aliases/" + nextAliasNumber;

	const body = {
		using: ["urn:ietf:params:jmap:core", "urn:stalwart:jmap"],
		methodCalls: [
			[
				"x:Account/set",
				{
					accountId,
					update: {
						[accountId]: {
							[aliasId]: {
								enabled: true,
								name: aliasName,
								domainId: domainId,
								description: "Created by TempWart",
							},
						},
					},
				},
				"0",
			],
		],
	};

	const response = await fetch(`${rootDomain}/jmap/`, {
		credentials: "include",
		headers: {
			Accept: "application/json",
			authorization: `Bearer ${authToken}`,
			"content-type": "application/json",
		},
		body: JSON.stringify(body),
		method: "POST",
	});
	if (!response.ok) throw Error(`Alias request failed (${response.status}).`);
	const responseJson = (await response.json()) as {
		methodResponses?: [string, Record<string, unknown>, string][];
	};
	const methodResponse = responseJson.methodResponses?.[0];
	if (methodResponse?.[0] !== "x:Account/set") {
		const detail = methodResponse?.[1];
		throw Error(
			`Alias was rejected${detail ? `: ${JSON.stringify(detail)}` : "."}`,
		);
	}

	nextAliasNumber++;
	(document.getElementById("alias_name") as HTMLInputElement).value = "";
	setStatus("Alias created.");
}

async function create() {
	const createButton = document.getElementById(
		"create_alias_btn",
	) as HTMLButtonElement;
	createButton.disabled = true;
	setStatus("Creating alias...");
	try {
		await addNew();
	} catch (error) {
		setStatus(
			error instanceof Error ? error.message : "Could not create alias.",
			true,
		);
	} finally {
		createButton.disabled = false;
	}
}

document.addEventListener("DOMContentLoaded", () => {
	const createBtn = document.getElementById("create_alias_btn");
	createBtn?.addEventListener("click", create);
});
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", renderLoadedBanner, {
		once: true,
	});
} else {
	renderLoadedBanner();
}

loadAccount().catch((error) =>
	setStatus(
		error instanceof Error ? error.message : "Could not load account.",
		true,
	),
);
