const ftp = require('basic-ftp');
const glob = require('glob');
const fse = require('fs-extra');
const path = require('path');

/**
 * Sync local directory to FTP server, uploading only new or modified files
 */
async function syncToFtp(config) {
	const { host, user, password, secure, localDir, remoteDir, dryRun, verbose } = config;

	const client = new ftp.Client();
	client.ftp.verbose = verbose;

	let uploadedCount = 0;
	let skippedCount = 0;
	let errorCount = 0;
	const errors = [];

	try {
		// Connect to FTP server
		console.log(`Connecting to ${host}${secure ? ' (FTPS)' : ' (FTP)'}...`);
		await client.access({
			host,
			user,
			password,
			secure
		});
		console.log('Connected successfully.\n');

		// Ensure remote directory exists
		if (!dryRun) {
			await client.ensureDir(remoteDir);
		}

		// Get all local files recursively
		const files = glob.sync('**/*', { cwd: localDir, nodir: true });
		console.log(`Found ${files.length} local files to check.\n`);

		// Process each file
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const localPath = path.join(localDir, file);
			const remotePath = path.posix.join(remoteDir, file.replace(/\\/g, '/')); // Normalize for FTP

			try {
				const localStats = await fse.stat(localPath);
				let shouldUpload = true;
				let reason = 'new file';

				// Check if file exists remotely
				try {
					const remoteSize = await client.size(remotePath);
					const remoteMtime = await client.lastMod(remotePath);

					// Compare size and modification time
					if (remoteSize === localStats.size && remoteMtime.getTime() >= localStats.mtime.getTime()) {
						shouldUpload = false;
						skippedCount++;
						if (verbose) {
							console.log(`[${i + 1}/${files.length}] ⊘ Skipped: ${file} (up to date)`);
						}
					} else if (remoteSize !== localStats.size) {
						reason = `size changed (${remoteSize} → ${localStats.size} bytes)`;
					} else {
						reason = 'modified (newer date)';
					}
				} catch (err) {
					// File doesn't exist remotely, will upload
					reason = 'new file';
				}

				if (shouldUpload) {
					if (dryRun) {
						console.log(`[${i + 1}/${files.length}] ↑ Would upload: ${file} (${reason})`);
						uploadedCount++;
					} else {
						// Ensure remote directory exists
						const remoteFileDir = path.posix.dirname(remotePath);
						await client.ensureDir(remoteFileDir);

						// Upload file
						await client.uploadFrom(localPath, remotePath);
						uploadedCount++;
						console.log(`[${i + 1}/${files.length}] ✓ Uploaded: ${file} (${reason})`);
					}
				}
			} catch (err) {
				// Log error but continue processing
				errorCount++;
				const errorMsg = `Failed to process ${file}: ${err.message}`;
				errors.push(errorMsg);
				console.error(`[${i + 1}/${files.length}] ✗ Error: ${file} - ${err.message}`);
			}
		}

	} catch (err) {
		console.error('\nFatal error:', err.message);
		throw err;
	} finally {
		client.close();
	}

	// Print summary
	console.log('\n' + '='.repeat(50));
	console.log('SYNC SUMMARY');
	console.log('='.repeat(50));
	if (dryRun) {
		console.log(`Would upload: ${uploadedCount} file(s)`);
	} else {
		console.log(`Uploaded: ${uploadedCount} file(s)`);
	}
	console.log(`Skipped: ${skippedCount} file(s) (already up to date)`);
	console.log(`Errors: ${errorCount} file(s)`);

	if (errors.length > 0) {
		console.log('\nErrors encountered:');
		errors.forEach(err => console.log(`  - ${err}`));
	}

	console.log('='.repeat(50));
}

module.exports = { syncToFtp };
