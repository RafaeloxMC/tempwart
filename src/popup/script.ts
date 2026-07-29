import { getStalwartApiUrl } from "./scripts/util.js";

async function renderLoadedBanner() {
	const banner = document.createElement("div");
	banner.textContent =
		"TempWart TypeScript loaded. Server URL: " + getStalwartApiUrl();
	document.body.appendChild(banner);
	console.log("Popup script loaded");
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", renderLoadedBanner, {
		once: true,
	});
} else {
	renderLoadedBanner();
}
