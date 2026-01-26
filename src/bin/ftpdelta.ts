#!/usr/bin/env node

import { Command } from 'commander';
import dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { syncToFtp } from '../sync.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const program = new Command();

program
    .name('ftpdelta')
    .description('Sync local folders to FTP by uploading only new or modified files')
    .version('1.0.0')
    .option('-c, --config <path>', 'Path to .env config file', '.env')
    .option('-d, --dry-run', 'Preview changes without uploading')
    .option('-v, --verbose', 'Show detailed logging')
    .parse(process.argv);

const options = program.opts<{
    config: string;
    dryRun: boolean;
    verbose: boolean;
}>();

// Load environment variables from specified config file
const configPath = path.resolve(process.cwd(), options.config);
dotenv.config({ path: configPath });

// Validate required environment variables
const required = ['FTP_HOST', 'FTP_USER', 'FTP_PASS', 'LOCAL_DIR', 'REMOTE_DIR'] as const;
const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
    console.error(`Error: Missing required environment variables: ${missing.join(', ')}`);
    console.error(`Please create a ${options.config} file with these variables.`);
    process.exit(1);
}

// Type-safe environment variable access
const ftpConfig = {
    host: process.env.FTP_HOST!,
    user: process.env.FTP_USER!,
    password: process.env.FTP_PASS!,
    secure: process.env.FTP_SECURE === 'true',
    localDir: process.env.LOCAL_DIR!,
    remoteDir: process.env.REMOTE_DIR!,
    dryRun: options.dryRun,
    verbose: options.verbose
};

// Run the sync
syncToFtp(ftpConfig)
    .then(stats => {
        process.exit(stats.errorCount > 0 ? 1 : 0);
    })
    .catch(err => {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error('Sync failed:', errorMessage);
        process.exit(1);
    });
