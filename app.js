const express = require('express')
const axios = require('axios')
const qs = require('qs')

const app = express()
const port = process.env.PORT;

const api_key = 'LF7U6m6DmxNiw3JrNV3Q8PjITsukfXrihnHriEcyQd5nlbJH8VfbHPVI3PEAmHzZ';
const api_secret = 'abLsVWn1oSNXeXmrh7i8x29zt4YhxszoevnwZUqAIvIgmwziZ07EjObiU9UC7NTd';

app.get('/', (req, res) => res.send(JSON.stringify(req)))
app.get('/favicon.ico', (res) => res.send('favicon.ico'))

app.get('/disqus_api/access_token/', (req, res, next) => { // photo/:id
	let code = req.query.code;
	// let photo_id = 1; // req.params.id;

	if (!code) next(new Error('no_code_err'))

	let data = {
		grant_type: 'authorization_code',
		client_id: api_key,
		redirect_uri: 'http://localhost:4000/disqus_api/access_token/',
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
		.then(access_token => res.redirect(`http://localhost:3000/?access_token=${access_token}`))
		.catch(console.log)


})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))