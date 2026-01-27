# FtpDelta

A TypeScript command-line tool that efficiently syncs local folders to remote FTP servers by uploading only new or modified files based on size and modification date comparison.

## Features

- **Delta Sync**: Only uploads files that are new or have changed (by size or modification date)
- **FTPS Support**: Optional secure FTP connection
- **Resilient**: Errors are logged without stopping the sync; restarting will skip already-uploaded files
- **Dry Run**: Preview what would be uploaded without making changes
- **Progress Tracking**: See real-time upload progress and detailed summary
- **Type Safe**: Written in TypeScript with strict type checking
- **Modern Modules**: Uses ES6 module system

## Installation

### As a Dev Dependency (Recommended)

Install from GitHub:

```bash
npm install --save-dev github:iMarti/FtpDelta
```

Or from npm (if published):

```bash
npm install --save-dev ftpdelta
```

### For Local Development

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Build the TypeScript code:

```bash
npm run build
```

## Configuration

Create a `ftpdelta.config.js` file in your project root:

```javascript
export default {
	host: 'ftp.yourserver.com',
	user: 'username',
	password: 'password',
	secure: false,           // Set to true for FTPS
	localDir: './dist',      // Path to local folder
	remoteDir: '/public_html' // Remote FTP directory
};
```

**Important**: Add `ftpdelta.config.js` to your `.gitignore` to keep credentials secure!

```
# .gitignore
ftpdelta.config.js
```

## Usage

### When Installed as Dev Dependency

Add scripts to your `package.json`:

```json
{
  "scripts": {
    "deploy": "ftpdelta",
    "deploy:dry": "ftpdelta --dry-run",
    "deploy:verbose": "ftpdelta --verbose"
  }
}
```

Then run:

```bash
npm run deploy         # Deploy to FTP
npm run deploy:dry     # Preview without uploading
npm run deploy:verbose # Deploy with detailed logs
```

Or use `npx` directly:

```bash
npx ftpdelta --dry-run
npx ftpdelta --verbose
npx ftpdelta --config ftpdelta.config.prod.js
```

### Testing Locally During Development

When developing FtpDelta itself, use the following workflow:

1. **Build the TypeScript code:**

```bash
npm run build
```

2. **Create a test config file** in the project root:

```javascript
// ftpdelta.config.js
export default {
	host: 'your-test-ftp-server.com',
	user: 'testuser',
	password: 'testpass',
	secure: false,
	localDir: './test-files',  // Create a test folder with sample files
	remoteDir: '/test-upload'
};
```

3. **Run with npm start** (uses the compiled code from `dist/`):

```bash
npm start                  # Run sync
npm start -- --dry-run     # Preview without uploading
npm start -- --verbose     # Detailed logging
npm start -- --config ftpdelta.config.test.js  # Custom config
```

**Note:** The `--` is required to pass arguments through npm to the underlying command.

### Command-line Options

```bash
ftpdelta [options]

Options:
  -c, --config <path>  Path to config file (default: "ftpdelta.config.js")
  -d, --dry-run        Preview changes without uploading
  -v, --verbose        Show detailed logging
  -h, --help           Display help information
  -V, --version        Display version number
```

## How It Works

1. **Connects** to the FTP server using credentials from `ftpdelta.config.js`
2. **Scans** the local directory recursively for all files
3. **Compares** each local file with its remote counterpart:
   - If remote file doesn't exist → **upload**
   - If file sizes differ → **upload**
   - If local file is newer (by modification date) → **upload**
   - If remote file is same size and same/newer date → **skip**
4. **Uploads** files that need updating, creating remote directories as needed
5. **Logs** any errors but continues processing remaining files
6. **Shows** summary of uploaded, skipped, and failed files

### Restart Behavior

If the sync is interrupted or encounters errors, simply restart the tool. Files that were successfully uploaded will have newer modification dates on the remote server and will be automatically skipped, ensuring only remaining files are processed.

## Dependencies

- **basic-ftp**: Modern FTP client with Promise support
- **glob**: Pattern matching for recursive file listing
- **fs-extra**: Enhanced file system utilities
- **commander**: CLI argument parsing

## Dev Dependencies

- **@types/fs-extra**: TypeScript types for fs-extra
- **@types/node**: TypeScript types for Node.js
- **typescript**: TypeScript compiler

## License

ISC
