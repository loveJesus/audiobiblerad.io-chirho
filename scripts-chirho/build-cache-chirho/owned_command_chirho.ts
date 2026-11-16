// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { spawn as spawnChirho } from 'node:child_process';

/** An owned process group is canceled if its pinned cache fails. Never retry on another backend.
 * See workflows-chirho/build_cache_workflow_chirho.md and experience-chirho/native_players_workflow_chirho.md.
 */
export async function runOwnedCommandChirho(
	commandChirho: string,
	argumentsChirho: readonly string[],
	environmentChirho: NodeJS.ProcessEnv,
	checkPinnedChirho: () => void,
	workingDirectoryChirho = process.cwd()
): Promise<number> {
	checkPinnedChirho();
	const childChirho = spawnChirho(commandChirho, [...argumentsChirho], {
		cwd: workingDirectoryChirho,
		stdio: 'inherit',
		detached: process.platform !== 'win32',
		env: environmentChirho
	});
	let lostChirho = false;
	let killTimerChirho: ReturnType<typeof setTimeout> | undefined;
	const signalChirho = (valueChirho: NodeJS.Signals): void => {
		try {
			if (process.platform !== 'win32' && childChirho.pid)
				process.kill(-childChirho.pid, valueChirho);
			else childChirho.kill(valueChirho);
		} catch {
			/* Only this owned group is targeted; it may already have stopped. */
		}
	};
	const stopChirho = (): void => {
		signalChirho('SIGTERM');
		killTimerChirho ??= setTimeout(() => signalChirho('SIGKILL'), 2000);
	};
	const monitorChirho = setInterval(() => {
		try {
			checkPinnedChirho();
		} catch {
			lostChirho = true;
			console.error(
				'build-cache-chirho: pinned backend or capacity lost; stopping owned job, no retry.'
			);
			clearInterval(monitorChirho);
			stopChirho();
		}
	}, 250);
	process.once('SIGINT', stopChirho);
	process.once('SIGTERM', stopChirho);
	try {
		return await new Promise<number>((resolveChirho) => {
			childChirho.once('error', () => resolveChirho(1));
			childChirho.once('exit', (codeChirho) => resolveChirho(lostChirho ? 1 : (codeChirho ?? 1)));
		});
	} finally {
		clearInterval(monitorChirho);
		clearTimeout(killTimerChirho);
		process.removeListener('SIGINT', stopChirho);
		process.removeListener('SIGTERM', stopChirho);
	}
}
