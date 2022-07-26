const tokenDestroy = require('../utilities/token-destroy');

//auth/logout
const route = (req, res) => {
	//stored in the cookie
	tokenDestroy(req.cookies.refreshToken);

	res.clearCookie('refreshToken');

	return res.status(200).end();
};

module.exports = route;