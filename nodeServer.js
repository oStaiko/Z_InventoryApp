const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const fs = require('fs');
const https = require('https');
const helmet = require('helmet');
const bcrypt = require('bcrypt');
const { writeLog, userInfo } = require('./logger');
require('./passport-config')(passport);

const HOST = "localhost"
const PORT = 80
const app = express();



///// SECURITY 

// Apply Helmet security settings
app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        scriptSrcAttr: ["'unsafe-inline'"],
      },
    },
  })
);

// Drop connection for banned IPs
app.use((req, res, next) => {
    try {
        const content = fs.readFileSync(path.join(`${__dirname}/logs`, 'bannedIPs.log'), 'utf-8');
        const lines = content.split(/\r?\n/);
        if (lines.includes(req.ip))
            writeLog(req.method, `<DROPPED> ${req.originalUrl}   → ${userInfo(req)}`, "traffic");
        else
            next();
    } catch (err) {
        writeLog('ERROR', `Error reading bannedIPs file: ${err.message}`); }
})

// Check for exploit attempts and ban them before they can do any damage
app.use(async (req, res, next) =>
{
    try {
        const content = fs.readFileSync(path.join(`${__dirname}`, 'bannedPaths.txt'), 'utf-8');
        const lines = content.split(/\r?\n/);
        if (lines.includes(req.originalUrl))
        {
            writeLog("WARNING", `Bad actor detected! IP '${req.ip}' attempted to access '${req.originalUrl}'`, "alerts")
            await fs.appendFile(path.join(`${__dirname}/logs`, 'bannedIPs.log'), `${req.ip}\n`, (err) => {
                if (err)
                    writeLog('ERROR', `Error writing to bannedIPs file: ${err}`);
                else if (req.ip == "::1" || req.ip == "::ffff:127.0.0.1")
                    writeLog("WARNING", "Attempted to ban self...", "alerts")
                else
                    writeLog("WARNING", `IP '${req.ip}' has been banned sucessfully`, "alerts")
            });
        }
        else
            next();
    } catch (err) {
        writeLog('ERROR', `Error reading bannedPaths file: ${err.message}`); }
});



///// PUBLIC RESOURCES

// Set public directory as staticly available
app.use(express.static('resources'));

// Set-up json for forms
app.use(express.json());
app.use(express.urlencoded({extended: false}))

// Serve Bootstrap
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));



///// SESSIONS

// Set-up session authentication
app.use(session({
    secret: 'my-super-secret-develoment-string',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // Dev environment only
        maxAge: 3600000 * 24 // 24 hours
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});



///// CONTENT

// Set render engine
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname, 'views'));


// Mount API routers
app.use('/api/users', require('./routes/api/userRoute')(passport));
app.use('/api/items', require('./routes/api/itemRoute')(passport));

// Log non-API traffic
app.use('/', (req, res, next) => {
    writeLog(req.method.toUpperCase(),`${req.originalUrl}   → ${userInfo(req)}`, "traffic"); next();})

// Mount Web traffic router
app.use('/', require('./routes/homeRoute')(passport, HOST, PORT));

// Redirect bad API requests
app.use('/api/*splat',(req,res)=>{
    res.send('<h2>API request not recognized. Please refer to /api for assitiance.</h2>')
});

// For all other requests, show 404 page
app.use('/*splat', (req, res, next)=>{
    writeLog('INFO', `Showing 404 page for path: ${req.originalUrl}   by ${userInfo(req)}`);
    res.render('error', {path:"Error"});
});



///// START SERVER

writeLog('INFO', `Starting server on ${HOST}:${PORT} ==========================================================`);

// Start listening on port
app.listen(PORT);