type StorageShape = {
	get: (
		keys: string | string[] | Record<string, unknown>,
	) => Promise<Record<string, any>>;
	set: (items: Record<string, unknown>) => Promise<void>;
};

function getExtensionStorage(): StorageShape {
	const anyGlobal = globalThis as any;

	if (anyGlobal.browser?.storage?.local) {
		return anyGlobal.browser.storage.local;
	}

	if (anyGlobal.chrome?.storage?.local) {
		return {
			get: (keys) =>
				new Promise((resolve, reject) => {
					anyGlobal.chrome.storage.local.get(keys, (result: any) => {
						const err = anyGlobal.chrome.runtime?.lastError;
						if (err) reject(new Error(err.message));
						else resolve(result);
					});
				}),
			set: (items) =>
				new Promise((resolve, reject) => {
					anyGlobal.chrome.storage.local.set(items, () => {
						const err = anyGlobal.chrome.runtime?.lastError;
						if (err) reject(new Error(err.message));
						else resolve();
					});
				}),
		};
	}

	throw new Error("No extension storage API found");
}

export const storage = getExtensionStorage();
