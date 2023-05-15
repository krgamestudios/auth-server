//environment variables
require('dotenv').config();

//create the server
const express = require('express');
const app = express();
const server = require('http').Server(app);
const cors = require('cors');
const cookieParser = require('cookie-parser');

//config
app.use(express.json());

app.use(cors({
	credentials: true,
	origin: [`${process.env.WEB_ORIGIN}`],
	allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Set-Cookie'],
	exposedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Set-Cookie'],
}));

app.use(cookieParser());

//database connection
const database = require('./database');

//ip-based management
app.use(require('./utilities/banned-up-addresses-middleware'));

//access the admin
app.use('/admin', require('./admin'));

//access the auth
app.use('/auth', require('./auth'));

//error on access
app.get('*', (req, res) => {
	res.redirect('https://github.com/krgamestudios/auth-server');
});

//startup
server.listen(process.env.WEB_PORT || 3200, async (err) => {
	await database.sync();
	console.log(`listening to localhost:${process.env.WEB_PORT || 3200}`);
});
