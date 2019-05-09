const express = require('express')
const axios = require('axios')
const qs = require('qs')
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');

const app = express()
const port = process.env.PORT || 4000;

// Some fake data
const books = [
	{
		title: "Harry Potter and the Sorcerer's stone",
		author: 'J.K. Rowling',
	},
	{
		title: 'Jurassic Park',
		author: 'Michael Crichton',
	},
];

// The GraphQL schema in string form
const typeDefs = `
	type Query { books: [Book] }
	type Book { title(id: String = "0"): String, author: String }
  `;

// The resolvers
const resolvers = {
	Query: { books: () => books },
	Book: {
		title: function (parent, args) {
			console.log(args)
			return parent.title;
		}
	}
};

// Put together a schema
const schema = makeExecutableSchema({
	typeDefs,
	resolvers,
});

// The GraphQL endpoint
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));

// GraphiQL, a visual editor for queries
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

const api_key = 'LF7U6m6DmxNiw3JrNV3Q8PjITsukfXrihnHriEcyQd5nlbJH8VfbHPVI3PEAmHzZ';
const api_secret = 'abLsVWn1oSNXeXmrh7i8x29zt4YhxszoevnwZUqAIvIgmwziZ07EjObiU9UC7NTd';

app.get('/', (req, res) => res.send(req.url + ' ' + req.baseUrl + ' ' + req.ip + ' ' + req.hostname + ' ' + req.originalUrl))
app.get('/favicon.ico', (res) => res.send('favicon.ico'))

app.get('/disqus_api/access_token/', (req, res, next) => { // photo/:id
	let code = req.query.code;
	// let photo_id = 1; // req.params.id;

	if (!code) next(new Error('no_code_err'))

	let data = {
		grant_type: 'authorization_code',
		client_id: api_key,
		redirect_uri: 'https://' + req.hostname + '/disqus_api/access_token/',
		client_secret: api_secret,
		code: code
	}

	axios.request({
		method: 'post',
		url: 'https://disqus.com/api/oauth/2.0/access_token/',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		data: qs.stringify(data)
	})
		.then(resp => {
			console.log(resp.data.access_token)
			return resp.data.access_token;
		})
		.then(access_token => res.redirect(`https://ivanoid768.github.io/tourist-attractions-photos/?access_token=${access_token}`))
		.catch(console.log)


})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))