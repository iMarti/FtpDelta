/**
 * FtpDelta Configuration
 * 
 * Copy this file to ftpdelta.config.js and fill in your FTP credentials.
 * 
 * @type {import('ftpdelta').FtpDeltaConfig}
 */
export default {
	// FTP server hostname
	host: 'ftp.example.com',
	
	// FTP username
	user: 'your_username',
	
	// FTP password
	password: 'your_password',
	
	// Use FTPS (secure FTP) - set to true for encrypted connection
	secure: false,
	
	// Local directory to sync (relative or absolute path)
	localDir: './dist',
	
	// Remote directory on FTP server
	remoteDir: '/public_html'
};
