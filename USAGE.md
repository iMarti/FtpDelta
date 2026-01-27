# Using FtpDelta in Your Project

## Installation

Install FtpDelta as a dev dependency in your project:

```bash
npm install --save-dev github:iMarti/FtpDelta
```

Or if published to npm:

```bash
npm install --save-dev ftpdelta
```

## Setup

1. **Create a `ftpdelta.config.js` file** in your project root:

```javascript
export default {
	host: 'ftp.yourserver.com',
	user: 'username',
	password: 'password',
	secure: false,
	localDir: './dist',
	remoteDir: '/public_html'
};
```

2. **Add `ftpdelta.config.js` to your `.gitignore`**:

```
ftpdelta.config.js
```

3. **Add npm scripts** to your `package.json`:

```json
{
  "scripts": {
    "deploy": "ftpdelta",
    "deploy:dry": "ftpdelta --dry-run",
    "deploy:production": "ftpdelta --config ftpdelta.config.prod.js"
  }
}
```

## Usage

### Deploy to FTP

```bash
npm run deploy
```

### Preview changes (dry run)

```bash
npm run deploy:dry
```

### Deploy with custom config

```bash
npx ftpdelta --config ftpdelta.config.staging.js
```

### Deploy with verbose logging

```bash
npx ftpdelta --verbose
```

## Multiple Environments

Create environment-specific config files:

- `ftpdelta.config.js` (development)
- `ftpdelta.config.staging.js`
- `ftpdelta.config.prod.js`

Then deploy to different environments:

```bash
npx ftpdelta --config ftpdelta.config.staging.js
npx ftpdelta --config ftpdelta.config.prod.js
```

## Example Workflow

1. Build your project: `npm run build`
2. Preview FTP changes: `npm run deploy:dry`
3. Deploy to server: `npm run deploy`

## Tips

- Always test with `--dry-run` first
- Use `--verbose` for debugging connection issues
- The tool skips unchanged files automatically
- Restart safely - already uploaded files won't be re-uploaded
