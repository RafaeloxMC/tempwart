function getStalwartAPIURL(): string {
	const stalwartApiUrl = localStorage.getItem("STALWART_API_URL");
	if (stalwartApiUrl != null && stalwartApiUrl != "") {
		return stalwartApiUrl ?? "";
	} else {
		window.location.href = "/popup/pages/onboarding/index.html";
		console.log("Stalwart API route not set. Redirecting to onboarding.");
		return "";
	}
}

async function renderLoadedBanner() {
	const banner = document.createElement("div");
	banner.textContent =
		"TempWart TypeScript loaded. Server URL: " + getStalwartAPIURL();
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
