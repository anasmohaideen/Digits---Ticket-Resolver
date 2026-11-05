import { execSync } from 'node:child_process';

if (process.env.DEW_SKIP_LATEST === '1') {
	process.exit(0);
}

const userAgent = process.env.npm_config_user_agent ?? '';
if (!userAgent.includes('pnpm')) {
	console.warn(
		'[refresh-dew-latest] Skipping: Dew latest refresh runs under pnpm only. Use `pnpm install`.',
	);
	process.exit(0);
}

const packages = [
	'@freshworks/dew-components',
	'@freshworks/dew-styles',
	'@freshworks/dew-mcp-server',
	'@freshworks/dew-theme-generator',
];

console.log('[refresh-dew-latest] Updating Dew packages to latest…');

execSync(`pnpm update ${packages.join(' ')} --latest --ignore-scripts`, {
	stdio: 'inherit',
	env: { ...process.env, DEW_SKIP_LATEST: '1' },
});
