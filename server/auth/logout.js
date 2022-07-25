const tokenDestroy = require('../utilities/token-destroy');

//auth/logout
const route = (req, res) => {
	//stored in the cookie
	console.log(req.cookies.refreshToken)
	tokenDestroy(req.cookies.refreshToken);

	return res.status(200).end();
};

module.exports = route;