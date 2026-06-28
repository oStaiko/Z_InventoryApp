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


HOST = "localhost"//"18.221.214.171"
PORT = 80


const app = express();

// Apply Helmet security settings
//app.use(helmet());

// Set public directory as staticly available
app.use(express.static('resources'));

// Set-up json for forms
app.use(express.json());
app.use(express.urlencoded({extended: false}))

// Set render engine
app.set('view engine', 'ejs');
app.set('views',path.join(__dirname, 'views'));

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

// Serve Bootstrap
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));

// For development purposes: don't cache site
app.use('/',(req,res,next)=>{
    res.set('Cache-Control','no-store');
    next();
})


// Mount routers
app.use('/', require('./routes/homeRoute')(passport, HOST, PORT));
app.use('/api/users', require('./routes/api/userRoute')(passport));
app.use('/api/items', require('./routes/api/itemRoute')(passport));

// Redirect bad API requests
app.use('/api/*splat',(req,res)=>{
    res.send('<h2>API request not recognized. Please refer to /api for assitiance.</h2>')
});

// For all other requests, show 404 page
app.use('/*splat', (req, res, next)=>{
    writeLog('INFO', `Showing 404 page for path: ${req.originalUrl}`);
    res.render('error', {path:"Error"});
});

writeLog('INFO', `Starting server on ${HOST}:${PORT} ==========================================================`);

// Start listening on port
app.listen(PORT);