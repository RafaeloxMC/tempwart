import { userAgent } from "./scripts/constants.js";
import {
	getStalwartApiKey,
	getStalwartApiUrl,
	getStalwartCurrentEmail,
	getStalwartCurrentEmailId,
} from "./scripts/util.js";
import type { IJmapResponse } from "./types.js";

async function renderLoadedBanner() {
	const rootDomain = await getStalwartApiUrl();
	const email = await getStalwartCurrentEmail();

	const banner = document.createElement("div");
	banner.textContent = "Server " + rootDomain + " as " + email;
	document.body.appendChild(banner);
	console.log("Popup script loaded");
	await fetchExisting(rootDomain, email);
}

async function fetchExisting(rootDomain: string, email: string) {
	const authToken = await getStalwartApiKey();
	const accountId = await getStalwartCurrentEmailId();

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

	console.log(
		`Aliases for ${responseBody.methodResponses[0][1].list[0]?.emailAddress}`,
	);
	console.log(responseBody.methodResponses[0][1].list[0]?.aliases);

	const aliasEntries = Object.entries(
		responseBody.methodResponses[0][1].list[0]?.aliases ?? {},
	).filter(([, alias]) => alias.description == "Created by TempWart");

	const aliasesHTML = document.getElementById("aliases");

	if (aliasesHTML != null) {
		for (const [aliasId, alias] of aliasEntries) {
			console.log(alias);

			const row = document.createElement("tr");
			row.innerHTML = `<td><input type="checkbox" ${alias.enabled ? "checked" : ""}/></td><td><span>${alias.name}@${email.split("@")[1]}</span></td><td><img src="assets/bin.png" class="bin" alt="bin" width="16" height="16" /></td></tr>`;

			const bin = row.querySelector(".bin");
			bin?.addEventListener("click", () =>
				handleDeleteClick(
					rootDomain,
					authToken,
					accountId,
					aliasId,
					row,
				),
			);

			aliasesHTML.appendChild(row);
		}
	}
}

async function handleDeleteClick(
	rootDomain: string,
	authToken: string,
	accountId: string,
	aliasId: string,
	row: HTMLTableRowElement,
) {
	try {
		await deleteAlias(rootDomain, authToken, accountId, aliasId);
		row.remove();
	} catch (error) {
		console.error(error);
	}
}

async function deleteAlias(
	rootDomain: string,
	authToken: string,
	accountId: string,
	aliasId: string,
) {
	const body = {
		using: ["urn:ietf:params:jmap:core", "urn:stalwart:jmap"],
		methodCalls: [
			[
				"x:Account/set",
				{
					accountId,
					update: {
						[accountId]: {
							[`aliases/${aliasId}`]: null,
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
	if (!response.ok)
		throw Error(`Alias deletion request failed (${response.status}).`);

	const responseJson = (await response.json()) as {
		methodResponses?: [
			string,
			{ notUpdated?: Record<string, unknown> },
			string,
		][];
	};
	const methodResponse = responseJson.methodResponses?.[0];
	if (methodResponse?.[0] !== "x:Account/set") {
		const detail = methodResponse?.[1];
		throw Error(
			`Alias deletion was rejected${detail ? `: ${JSON.stringify(detail)}` : "."}`,
		);
	}

	const notUpdated = methodResponse[1].notUpdated?.[accountId];
	if (notUpdated != null) {
		throw Error(
			`Alias deletion was rejected: ${JSON.stringify(notUpdated)}`,
		);
	}
}

function create() {
	window.location.href = "/popup/pages/aliases/create/index.html";
}

document.addEventListener("DOMContentLoaded", () => {
	const createBtn = document.getElementById("alias_create_btn");
	createBtn?.addEventListener("click", create);
});

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", renderLoadedBanner, {
		once: true,
	});
} else {
	renderLoadedBanner();
}
