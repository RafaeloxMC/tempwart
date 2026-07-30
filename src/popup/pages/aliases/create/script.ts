import { getStalwartCurrentEmail } from "../../../scripts/util.js";

async function renderLoadedBanner() {
	const rootDomain = await getStalwartCurrentEmail();
	const domainText = document.getElementById("email_domain");
	if (domainText != null)
		domainText.innerText = "@" + (rootDomain.split("@")[1] ?? "N/A");
}

function create() {}

document.addEventListener("DOMContentLoaded", () => {
	const createBtn = document.getElementById("create_alias_btn");
	createBtn?.addEventListener("click", () => create());
});
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", renderLoadedBanner, {
		once: true,
	});
} else {
	renderLoadedBanner();
}
