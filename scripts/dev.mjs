import { spawn } from "node:child_process";

const children = [
	spawn("bun", ["scripts/copy-static.mjs", "--watch"], { stdio: "inherit" }),
	spawn(
		"bunx",
		[
			"tsc",
			"-p",
			"tsconfig.build.json",
			"--watch",
			"--preserveWatchOutput",
		],
		{ stdio: "inherit" },
	),
	spawn("web-ext", ["run", "--source-dir", "dist"], { stdio: "inherit" }),
];

let shuttingDown = false;

function shutdown(signal) {
	if (shuttingDown) {
		return;
	}

	shuttingDown = true;
	for (const child of children) {
		if (!child.killed) {
			child.kill(signal);
		}
	}
	setTimeout(() => process.exit(0), 100).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

for (const child of children) {
	child.on("exit", (code, signal) => {
		if (shuttingDown) {
			return;
		}

		if (code !== 0) {
			process.exitCode = code ?? 1;
			shutdown(signal ?? "SIGINT");
		}
	});
}
