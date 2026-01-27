#!/usr/bin/env node

import { Command } from 'commander';
import * as path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import fse from 'fs-extra';
import { syncToFtp } from '../sync.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Config interface for ftpdelta.config.js
 */
export interface FtpDeltaConfig {
	host: string;
	user: string;
	password: string;
	secure?: boolean;
	localDir: string;
	remoteDir: string;
}

/**
 * Load config from a JavaScript file
 */
async function loadConfig(configPath: string): Promise<FtpDeltaConfig> {
	const absolutePath = path.resolve(process.cwd(), configPath);
	
	// Check if file exists
	if (!await fse.pathExists(absolutePath)) {
		throw new Error(`Config file not found: ${configPath}\nCreate a ftpdelta.config.js file or specify a different config with --config`);
	}

	try {
		// Import the config file as an ES module
		const configUrl = pathToFileURL(absolutePath).href;
		const configModule = await import(configUrl);
		const config = configModule.default || configModule;

		// Validate required fields
		const required = ['host', 'user', 'password', 'localDir', 'remoteDir'] as const;
		const missing = required.filter(key => !config[key]);

		if (missing.length > 0) {
			throw new Error(`Missing required config fields: ${missing.join(', ')}`);
		}

		return config;
	} catch (err) {
		if (err instanceof Error && err.message.includes('Missing required')) {
			throw err;
		}
		throw new Error(`Failed to load config from ${configPath}: ${err instanceof Error ? err.message : String(err)}`);
	}
}

const program = new Command();

program
	.name('ftpdelta')
	.description('Sync local folders to FTP by uploading only new or modified files')
	.version('1.0.0')
	.option('-c, --config <path>', 'Path to config file', 'ftpdelta.config.js')
	.option('-d, --dry-run', 'Preview changes without uploading')
	.option('-v, --verbose', 'Show detailed logging')
	.parse(process.argv);

const options = program.opts<{
	config: string;
	dryRun: boolean;
	verbose: boolean;
}>();

// Load config file
try {
	const config = await loadConfig(options.config);

	// Run the sync
	const ftpConfig = {
		host: config.host,
		user: config.user,
		password: config.password,
		secure: config.secure || false,
		localDir: config.localDir,
		remoteDir: config.remoteDir,
		dryRun: options.dryRun,
		verbose: options.verbose
	};

	syncToFtp(ftpConfig)
		.then(stats => {
			process.exit(stats.errorCount > 0 ? 1 : 0);
		})
		.catch(err => {
			const errorMessage = err instanceof Error ? err.message : String(err);
			console.error('Sync failed:', errorMessage);
			process.exit(1);
		});
} catch (err) {
	const errorMessage = err instanceof Error ? err.message : String(err);
	console.error('Config error:', errorMessage);
	process.exit(1);
}
