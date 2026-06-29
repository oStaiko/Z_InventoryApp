const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('./database');
const { writeLog, userInfo } = require('./logger');

module.exports = function (passport) {
    // Validate password for user
    passport.use(new LocalStrategy((username, password, done) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
            if (err) // Error with DB
            {
                writeLog('ERROR', `DB login error: ${e}`, "server")
                return done(err);
            }
            if (!user) // User not found
            {
                writeLog('WARN', `Login attempt: '${username}' does not exist`, "alerts")
                return done(null, false, { message: 'No user with that username' });
            }

            try {
                const match = await bcrypt.compare(password, user.password_hash);
                if (match) // Success!
                    return done(null, user);
                else // Wrong Password
                {
                    writeLog('WARN', `Login attempt failed: '${username}' : '${password}`, "alerts")
                    return done(null, false, { message: 'Incorrect password' });
                }
            } catch (e) {
                writeLog('ERROR', `Bycrypt error: ${e}`, "server")
                return done(e);
            }
        });
    }));

    // Store user as just id on client
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    // Retrieve user info from id on server
    passport.deserializeUser((id, done) => {
        db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
            done(err, user);
        });
    });
};