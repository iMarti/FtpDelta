# FtpDelta

A command-line tool that efficiently syncs local folders to remote FTP servers by uploading only new or modified files based on size and modification date comparison.

## Features

- **Delta Sync**: Only uploads files that are new or have changed (by size or modification date)
- **FTPS Support**: Optional secure FTP connection
- **Resilient**: Errors are logged without stopping the sync; restarting will skip already-uploaded files
- **Dry Run**: Preview what would be uploaded without making changes
- **Progress Tracking**: See real-time upload progress and detailed summary

## Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

3. Copy the example environment file and configure it:

```bash
cp .env.example .env
```

4. Edit `.env` with your FTP credentials and directories:

```env
FTP_HOST=ftp.example.com
FTP_USER=your_username
FTP_PASS=your_password
FTP_SECURE=false           # Set to 'true' for FTPS
LOCAL_DIR=./local          # Path to local folder
REMOTE_DIR=/public_html    # Remote FTP directory
```

## Usage

### Basic sync:

```bash
npm start
```

Or if installed globally/linked:

```bash
ftpdelta
```

### Command-line options:

```bash
ftpdelta [options]

Options:
  -c, --config <path>  Path to .env config file (default: ".env")
  -d, --dry-run        Preview changes without uploading
  -v, --verbose        Show detailed logging
  -h, --help           Display help information
  -V, --version        Display version number
```

### Examples:

**Preview what would be uploaded:**
```bash
ftpdelta --dry-run
```

**Use a different config file:**
```bash
ftpdelta --config .env.production
```

**Verbose output with detailed logs:**
```bash
ftpdelta --verbose
```

**Combine options:**
```bash
ftpdelta --dry-run --verbose
```

## How It Works

1. **Connects** to the FTP server using credentials from `.env`
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
- **dotenv**: Environment variable management

## License

ISC
