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

function fillInputs() {
	const serverUrlInput = document.getElementById(
		"server_url",
	) as HTMLInputElement | null;
	const apiKeyInput = document.getElementById(
		"api_key",
	) as HTMLInputElement | null;

	const tempURL = localStorage.getItem("temp_url");
	const tempKey = localStorage.getItem("temp_key");

	if (serverUrlInput) serverUrlInput.value = tempURL ?? "";
	if (apiKeyInput) apiKeyInput.value = tempKey ?? "";
}

async function onUrlChange() {
	const serverUrlInput = document.getElementById(
		"server_url",
	) as HTMLInputElement | null;
	localStorage.setItem("temp_url", serverUrlInput?.value ?? "");
}

async function onKeyChange() {
	const apiKeyInput = document.getElementById(
		"api_key",
	) as HTMLInputElement | null;
	localStorage.setItem("temp_key", apiKeyInput?.value ?? "");
}

document.addEventListener("DOMContentLoaded", () => {
	const continueBtn = document.getElementById("continue_btn");
	const serverUrlInput = document.getElementById("server_url");
	const apiKeyInput = document.getElementById("api_key");
	fillInputs();
	continueBtn?.addEventListener("click", async () => await finalizeInputs());
	serverUrlInput?.addEventListener("change", async () => await onUrlChange());
	apiKeyInput?.addEventListener("change", async () => await onKeyChange());
});
