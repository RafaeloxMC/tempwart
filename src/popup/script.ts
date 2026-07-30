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

	const aliases = Object.values(
		responseBody.methodResponses[0][1].list[0]?.aliases ?? {},
	).filter((a) => a.description == "Created by TempWart");

	const aliasesHTML = document.getElementById("aliases");

	if (aliases.length == 0) {
		if (aliasesHTML != null)
			aliasesHTML.innerHTML = "<span>No aliases yet.</span>";
	}

	for (const alias of aliases) {
		console.log(alias);

		if (aliasesHTML != null)
			aliasesHTML.innerHTML += `<div><input type="checkbox" ${alias.enabled ? "checked" : ""}/><span>${alias.name}@${email.split("@")[1]}</span></div>`;
	}
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", renderLoadedBanner, {
		once: true,
	});
} else {
	renderLoadedBanner();
}
