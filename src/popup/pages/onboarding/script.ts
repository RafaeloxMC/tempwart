function finalizeInputs() {
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
	localStorage.setItem("STALWART_API_URL", serverUrlInput.value);
	localStorage.setItem("STALWART_API_KEY", apiKeyInput.value);
	window.location.href = "/popup/index.html";
}

document.addEventListener("DOMContentLoaded", () => {
	const continueBtn = document.getElementById("continue_btn");
	continueBtn?.addEventListener("click", finalizeInputs);
});
