// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// One parameterized progress row per meaningful unit of work.
import { Database } from 'bun:sqlite';

const databasePathChirho = new URL('./progress-chirho.sqlite', import.meta.url).pathname;
const databaseChirho = new Database(databasePathChirho);
databaseChirho.run(`CREATE TABLE IF NOT EXISTS steps_taken_chirho (
  id_chirho INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_code_chirho TEXT NOT NULL,
  timestamp_start_chirho TEXT NOT NULL,
  timestamp_end_chirho TEXT,
  action_taken_chirho TEXT NOT NULL,
  result_of_action_chirho TEXT,
  overview_of_result_chirho TEXT
)`);

const [modeChirho, ...argumentsChirho] = process.argv.slice(2);
const nowChirho = (): string => new Date().toISOString();

if (modeChirho === 'start') {
	const [agentCodeChirho, actionTakenChirho] = argumentsChirho;
	if (!agentCodeChirho || !actionTakenChirho) {
		throw new Error('usage: start <agent_code> "<action>"');
	}
	const resultChirho = databaseChirho
		.query(
			'INSERT INTO steps_taken_chirho (agent_code_chirho, timestamp_start_chirho, action_taken_chirho) VALUES (?, ?, ?) RETURNING id_chirho'
		)
		.get(agentCodeChirho, nowChirho(), actionTakenChirho) as { id_chirho: number };
	console.log(resultChirho.id_chirho);
} else if (modeChirho === 'end') {
	const [idChirho, resultChirho, overviewChirho] = argumentsChirho;
	if (!idChirho || !resultChirho) {
		throw new Error('usage: end <id> "<result>" "<overview>"');
	}
	databaseChirho
		.query(
			'UPDATE steps_taken_chirho SET timestamp_end_chirho = ?, result_of_action_chirho = ?, overview_of_result_chirho = ? WHERE id_chirho = ?'
		)
		.run(nowChirho(), resultChirho, overviewChirho ?? '', Number(idChirho));
	console.log('ok');
} else {
	throw new Error('mode must be start|end');
}

databaseChirho.close();
