const fs = require('fs');
const path = require('path');

// Generates consistent user info from req for logging
function userInfo (req)
{
    if (req.isAuthenticated)
    {
        if (Object.hasOwn(req, "session"))
        {  
            if (req.ip == "::1" || req.ip == "::ffff:127.0.0.1")
                return req.ip + ` (Server Request)`
            if (Object.hasOwn(req.session, "passport") && Object.hasOwn(req.session.passport, "user"))
                return req.ip + ` (UID: ${req.session.passport.user})`
            else
                return req.ip + ' (Guest)'
        }
        else
            return req.ip + ' (Unable to grab session)'
    }
    else   
        return req.ip + ' (Guest)'
}

/**
 * Writes a formatted log entry to /logs/log.txt
 * @param {'INFO' | 'WARN' | 'ERROR' | 'DEBUG'} type - The log level
 * @param {string} message - The message to log
 */
function writeLog(type, message) {
    const now = new Date();

    const timestamp = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0'),
    ].join('') + ' ' + [
        String(now.getHours()).padStart(2, '0'),
        String(now.getMinutes()).padStart(2, '0'),
        String(now.getSeconds()).padStart(2, '0'),
    ].join(':');

    const line = `[${timestamp}] ${type}: ${message}\n`;
    const logPath = path.join(`${__dirname}/logs`, 'log.txt');
    
    console.log(line);

    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    fs.appendFileSync(logPath, line, 'utf8');
}

module.exports = { writeLog, userInfo };