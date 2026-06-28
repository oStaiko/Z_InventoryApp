# Z_InventoryApp

This website was made for a programming test, and should not be used in any official means.

It features a public & independently callable API, found at /api
The server runs on ExpressJS for backend, uses SQLite3 for DB, and EJS/Bootstrap for most front-end content.
Everything is hosted from a single server for simplicity.
Some security is in place, you could probably break in to the database if you tried hard enough.

Steps to start server:

Edit nodeServer.js to match your desired HOST and PORT values (or leave as default)
Ensure npm is installed on your system
Open terminal and navigate to Z_InventoryApp folder
Run 'npm install'
Run 'npm run prod'

Using your brower, navigate to http://HOST:PORT (Put your previous values here)
Success!