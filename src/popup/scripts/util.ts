export function getStalwartApiUrl(): string {
	const stalwartApiUrl = localStorage.getItem("STALWART_API_URL");
	if (stalwartApiUrl != null && stalwartApiUrl != "") {
		return stalwartApiUrl ?? "";
	} else {
		window.location.href = "/popup/pages/onboarding/index.html";
		console.log("Stalwart API route not set. Redirecting to onboarding.");
		return "";
	}
}

export function getStalwartApiKey(): string {
	const stalwartApiKey = localStorage.getItem("STALWART_API_KEY");
	if (stalwartApiKey != null && stalwartApiKey != "") {
		return stalwartApiKey ?? "";
	} else {
		window.location.href = "/popup/pages/onboarding/index.html";
		console.log("Stalwart API route not set. Redirecting to onboarding.");
		return "";
	}
}

export function getStalwartCurrentEmail(): string {
	const stalwartCurrentEmail = localStorage.getItem("STALWART_EMAIL");
	if (stalwartCurrentEmail != null && stalwartCurrentEmail != "") {
		return stalwartCurrentEmail ?? "";
	} else {
		window.location.href = "/popup/pages/onboarding/account/index.html";
		console.log("Stalwart email not selected. Redirecting to onboarding.");
		return "";
	}
}

export function getStalwartCurrentEmailId(): string {
	const stalwartCurrentEmailId = localStorage.getItem("STALWART_EMAIL_ID");
	if (stalwartCurrentEmailId != null && stalwartCurrentEmailId != "") {
		return stalwartCurrentEmailId ?? "";
	} else {
		window.location.href = "/popup/pages/onboarding/account/index.html";
		console.log("Stalwart email id not found. Redirecting to onboarding.");
		return "";
	}
}

export function setStalwartCurrentEmail(email: string): void {
	localStorage.setItem("STALWART_EMAIL", email);
}

export function setStalwartCurrentEmailId(id: string): void {
	localStorage.setItem("STALWART_EMAIL_ID", id);
}
