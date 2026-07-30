import { setStalwartApiKey, setStalwartApiUrl } from "../../scripts/util.js";

async function finalizeInputs() {
	console.log("Clicked");
	const serverUrlInput = document.getElementById(
		"server_url",
	) as HTMLInputElement | null;
	const apiKeyInput = document.getElementById(
		"api_key",
	) as HTMLInputElement | null;

	if (!serverUrlInput || !apiKeyInput) return;

	if (serverUrlInput.value == "" || apiKeyInput.value == "") {
		alert("Fill out all values to continue!");
		return;
	}

	console.log("Setting Server URL:", serverUrlInput.value);
	await setStalwartApiUrl(serverUrlInput.value);
	await setStalwartApiKey(apiKeyInput.value);
	window.location.href = "/popup/pages/onboarding/account/index.html";
}

document.addEventListener("DOMContentLoaded", () => {
	const continueBtn = document.getElementById("continue_btn");
	continueBtn?.addEventListener("click", async () => await finalizeInputs());
});
