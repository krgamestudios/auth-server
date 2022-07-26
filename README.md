# auth-server

An API centric auth server. Uses Sequelize and mariaDB by default.

This server is available via docker hub at krgamestudios/auth-server.

# Setup

There are multiple ways to run this app - it can run on it's own via `npm start` (for production) or `npm run dev` (for development). it can also run inside docker using `docker-compose up --build` - run `node configure-script.js` to generate docker-compose.yml and startup.sql.

# API

```
//DOCS: Will send a validation email to the given email address
POST /auth/signup
Content-Type: application/json

{
	"email": "example@example.com",
	"username": "example",
	"password": "helloworld"
}


###


//DOCS: Used for validating the email address specified above
GET /auth/validation?username=example&token=12345678

//DOCS: If the environment variable HOOK_POST_VALIDATION_ARRAY is set to a JSON array of valid URLs, then the server will send a GET message to each URL with the newly created account's index
//DOCS: The GET requests will have a JWT authorization header
HOOK_POST_VALIDATION_ARRAY=["http://example.com", "http://example2.com"]
GET {HOOK_POST_VALIDATION_ARRAY[i]}?accountIndex={index}

###


//DOCS: Login after validation
POST /auth/login
Content-Type: application/json

{
	"email": "example@example.com",
	"password": "helloworld"
}

//DOCS: Result (access token's value is your authorization key below)
Set-Cookie: refreshToken

{
	"accessToken": "abcde"
}


###


//DOCS: Replace an expired accessToken with a new value
POST /auth/token
Cookie: refreshToken

//DOCS: Result
Set-Cookie: refreshToken

{
	"accessToken": "abcde"
}


###


//DOCS: After this is called, the /auth/token route will no longer work
DELETE /auth/logout
Authorization: Bearer accessToken
Cookie: refreshToken

###


//DOCS: Retreives the private account data, results vary
GET /auth/account
Authorization: Bearer accessToken


###


//DOCS: Update account data
PATCH /auth/account
Content-Type: application/json
Authorization: Bearer accessToken

{
	"password": "helloworld",
	"contact": true
}


###


//DOCS: Sets the timer, account will be deleted after 2 days
DELETE /auth/account
Authorization: Bearer accessToken
Content-Type: application/json

{
	"password": "helloworld"
}


###


//DOCS: Send the link to recover a forgotten password
POST /auth/recover
Content-Type: application/json

{
	"email": "example@example.com"
}


###


//DOCS: Redirect the link to recover a password to the front-end
GET /auth/reset?token=<token>

//DOCS: Result
301 -> ${WEB_RESET_ADDRESS}?email=<email>&token=<token>


###


//DOCS: Resets a password for the given email, correct token is required
PATCH /auth/reset?email=<email>&token=<token>

{
	"password": "password"
}


###
```
