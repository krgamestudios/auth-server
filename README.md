# auth-server

An API centric auth server. Uses Sequelize and mariaDB by default.

# Setup

There are multiple ways to run this app - it can run on it's own via `npm start` (for production) or `npm run dev` (for development). it can also run inside docker using `docker-compose up --build` - run `node configure-script.js` to generate docker-compose.yml.

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

//DOCS: Used for validating the email address above
GET /auth/validation?username=example&token=12345678

//DOCS: Login after validation
POST /auth/login
Content-Type: application/json

{
	"email": "example@example.com",
	"password": "helloworld"
}

//Result (access token's value is your authorization key below)
{
	"accessToken": "abcde",
	"refreshToken": "fghij"
}

//Replace an expired authToken pair with these values
POST /auth/token
Content-Type: application/json

{
	"token": "refreshToken"
}

//DOCS: After this is called, the refresh route will no longer work
DELETE /auth/logout
Authorization: Bearer accessToken

{
	"token": "refreshToken"
}

//DOCS: Retreives the private account data, results vary
GET /auth/account
Authorization: Bearer accessToken

//Result
{
	"accessToken": "abcde",
	"refreshToken": "fghij"
}

//DOCS: Update account data, input varies, but is always JSON
PATCH /auth/account
Content-Type: application/json
Authorization: Bearer accessToken

//DOCS: Sets the timer, account will be deleted after 2 days
DELETE /auth/account
Authorization: Bearer accessToken
Content-Type: application/json

{
	"password": "helloworld"
}
```
