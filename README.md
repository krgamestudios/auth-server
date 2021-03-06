# auth-server

An API centric auth server. Uses Sequelize and mariaDB by default.

# Setup

TODO: Dockerize this project

TODO: Write setup instructions, once dockerized

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

//DOCS: Retreives the private account data, results vary
GET /auth/account
Authorization: Bearer accessToken

//DOCS: After this is called, the refresh route will no longer work
DELETE /auth/logout
Authorization: Bearer accessToken

{
	"token": "refreshToken"
}

//Replace an expired authToken pair with these values
POST /auth/token
Content-Type: application/json

{
	"token": "refreshToken"
}

//Result
{
	"accessToken": "abcde",
	"refreshToken": "fghij"
}

//DOCS: Update account data, input varies, but is always JSON
PATCH /auth/update
Content-Type: application/json
Authorization: Bearer accessToken

//DOCS: Sets the timer, account will be deleted after 2 days
DELETE /auth/deletion
Authorization: Bearer accessToken
Content-Type: application/json

{
	"password": "helloworld"
}

```
