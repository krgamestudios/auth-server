const destroy = require('../utilities/token-destroy');

//auth/logout
const route = (req, res) => {
	destroy(req.body.token);

	return res.status(200).end();
};

module.exports = route;