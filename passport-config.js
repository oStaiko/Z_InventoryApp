const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('./database');

module.exports = function (passport) {
    // Validate password for user
    passport.use(new LocalStrategy((username, password, done) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
            if (err) // Error with DB
                return done(err);
            if (!user) // User not found
                return done(null, false, { message: 'No user with that username' });

            try {
                const match = await bcrypt.compare(password, user.password_hash);
                if (match) // Success!
                    return done(null, user);
                else // Wrong Password
                    return done(null, false, { message: 'Incorrect password' });
            } catch (e) {
                return done(e); // bcrypt error
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