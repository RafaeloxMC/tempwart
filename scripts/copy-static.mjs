import { watch } from "node:fs";
import { mkdir, readdir, copyFile, unlink, stat } from "node:fs/promises";
import path from "node:path";

const sourceRoot = path.resolve("src");
const outputRoot = path.resolve("dist");
const staticExtensions = new Set([
	".html",
	".css",
	".json",
	".png",
	".svg",
	".ico",
	".jpg",
	".jpeg",
	".gif",
	".webp",
]);

async function syncStaticFiles() {
	const sourceFiles = new Set();
	await copyStaticTree(sourceRoot, outputRoot, sourceFiles);
	await pruneDeletedStaticFiles(outputRoot, sourceRoot, sourceFiles);
}

async function copyStaticTree(sourceDir, targetDir, sourceFiles) {
	await mkdir(targetDir, { recursive: true });
	const entries = await readdir(sourceDir, { withFileTypes: true });

	for (const entry of entries) {
		const sourcePath = path.join(sourceDir, entry.name);
		const targetPath = path.join(targetDir, entry.name);

		if (entry.isDirectory()) {
			await copyStaticTree(sourcePath, targetPath, sourceFiles);
			continue;
		}

		if (!shouldCopy(entry.name)) {
			continue;
		}

		sourceFiles.add(path.relative(sourceRoot, sourcePath));
		await copyFile(sourcePath, targetPath);
	}
}

async function pruneDeletedStaticFiles(targetDir, sourceDir, sourceFiles) {
	const entries = await readdir(targetDir, { withFileTypes: true });

	for (const entry of entries) {
		const targetPath = path.join(targetDir, entry.name);
		const sourcePath = path.join(sourceDir, entry.name);

		if (entry.isDirectory()) {
			if (await exists(sourcePath)) {
				await pruneDeletedStaticFiles(
					targetPath,
					sourcePath,
					sourceFiles,
				);
			}
			continue;
		}

		if (!shouldCopy(entry.name)) {
			continue;
		}

		const relativePath = path.relative(sourceRoot, sourcePath);
		if (!sourceFiles.has(relativePath) && (await exists(targetPath))) {
			await unlink(targetPath);
		}
	}
}

async function exists(filePath) {
	try {
		await stat(filePath);
		return true;
	} catch {
		return false;
	}
}

function shouldCopy(fileName) {
	const extension = path.extname(fileName).toLowerCase();
	return staticExtensions.has(extension);
}

async function run() {
	await syncStaticFiles();

	if (!process.argv.includes("--watch")) {
		return;
	}

	let timer = null;
	const queueSync = () => {
		if (timer) {
			clearTimeout(timer);
		}

		timer = setTimeout(() => {
			syncStaticFiles().catch((error) => {
				console.error(error);
				process.exitCode = 1;
			});
		}, 100);
	};

	const watcher = watch(sourceRoot, { recursive: true }, queueSync);
	const shutdown = () => watcher.close();
	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);
	await new Promise(() => {});
}

run().catch((error) => {
	console.error(error);
	process.exit(1);
});
