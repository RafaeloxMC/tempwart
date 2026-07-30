import { storage } from "./storage.js";

async function getStoredString(key: string): Promise<string | undefined> {
	const result = await storage.get(key);
	const value = result[key];

	return typeof value === "string" && value !== "" ? value : undefined;
}

export async function getStalwartApiUrl(): Promise<string> {
	const stalwartApiUrl = await getStoredString("STALWART_API_URL");
	if (stalwartApiUrl != null) {
		return stalwartApiUrl;
	}

	window.location.href = "/popup/pages/onboarding/index.html";
	console.log("Stalwart API route not set. Redirecting to onboarding.");
	return "";
}

export async function getStalwartApiKey(): Promise<string> {
	const stalwartApiKey = await getStoredString("STALWART_API_KEY");
	if (stalwartApiKey != null) {
		return stalwartApiKey;
	}

	window.location.href = "/popup/pages/onboarding/index.html";
	console.log("Stalwart API route not set. Redirecting to onboarding.");
	return "";
}

export async function getStalwartCurrentEmail(): Promise<string> {
	const stalwartCurrentEmail = await getStoredString("STALWART_EMAIL");
	if (stalwartCurrentEmail != null) {
		return stalwartCurrentEmail;
	}

	window.location.href = "/popup/pages/onboarding/account/index.html";
	console.log("Stalwart email not selected. Redirecting to onboarding.");
	return "";
}

export async function getStalwartCurrentEmailId(): Promise<string> {
	const stalwartCurrentEmailId = await getStoredString("STALWART_EMAIL_ID");
	if (stalwartCurrentEmailId != null) {
		return stalwartCurrentEmailId;
	}

	window.location.href = "/popup/pages/onboarding/account/index.html";
	console.log("Stalwart email id not found. Redirecting to onboarding.");
	return "";
}

export async function setStalwartCurrentEmail(email: string): Promise<void> {
	await storage.set({ STALWART_EMAIL: email });
}

export async function setStalwartCurrentEmailId(id: string): Promise<void> {
	await storage.set({ STALWART_EMAIL_ID: id });
}

export async function setStalwartApiUrl(url: string): Promise<void> {
	await storage.set({ STALWART_API_URL: url });
}

export async function setStalwartApiKey(key: string): Promise<void> {
	await storage.set({ STALWART_API_KEY: key });
}
