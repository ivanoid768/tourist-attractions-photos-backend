// const Db = require('tingodb')().Db;
const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
// const bodyParser = require('body-parser')
const sessions = require("client-sessions")
const corsMiddleware = require('cors')
const getUserViaSession = require('./auth/get_user_via_session')

const cors = corsMiddleware({
	// preflightMaxAge: 5, //Optional
	origin: true,
	// allowHeaders: ['API-Token'],
	// exposeHeaders: ['API-Token-Expiry'],
	credentials: true
})

// const db = new Db(__dirname + '/db', {});
const dbName = 'certification_platform';
const dbClient = new MongoClient('mongodb://localhost:27017/certification_platform')
dbClient.connect().then(() => {
	const db = dbClient.db(dbName)

	server_init(db)

})

const session_opts = { // TODO Confirm that Session ID is signed with SHA3 !
	cookieName: 'mySession', // cookie name dictates the key name added to the request object
	secret: '39ec55a44aba47a2b76270643255483fcldnxdu4', // should be a large unguessable string
	duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
	activeDuration: 1000 * 60 * 5, // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
	cookie: {
		// TODO Store session in DB!
		// path: '/api', // cookie will only be sent to requests under '/api'
		// maxAge: 60000, // duration of the cookie in milliseconds, defaults to duration above
		// ephemeral: false, // when true, cookie expires when the browser closes
		httpOnly: true, // when true, cookie is not accessible from javascript
		secure: false // when true, cookie will only be sent over SSL. use key 'secureProxy' instead if you handle SSL not in your node process
	}
}

app.use(sessions(session_opts))

// app.options('*', cors)
app.use(cors)
app.use(express.json());
app.use(express.urlencoded({
	extended: true
}));

function server_init(db) {
	// require('./auth/token')(server, db);
	require('./middleware/userSession')(app, db)
	require('./middleware/accessByRole')(app, db)

	// require('./controllers/certificates')(server, db);
	require('./controllers')(app, db)
}

const users_sockets = Object.create(null);
app.set('user_socket', users_sockets)

io.on('connection', socket => {
	console.log('new connection: ', socket.request.user)
	let uid = socket.request.user._id;

	let user_socket = app.get('user_socket');
	user_socket[uid] = socket;
	app.set('user_socket', user_socket)

	socket.on('disconnect', function () {
		let user_socket = app.get('user_socket')
		delete user_socket[uid];
		app.set('user_socket', user_socket)
	})

})

io.use(function (socket, next) {
	sessions(session_opts)(socket.request, {}, next)
})

io.use((socket, next) => {
	// console.log('socket.request: ', socket.request.headers.cookie);
	console.log('socket.request.mySession: ', socket.request.mySession);

	getUserViaSession(db, socket.request, next)

})

let server = http.listen(8081, function () {
	console.log('%s listening at %s', app.name, server.address().port);
});