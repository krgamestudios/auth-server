const { Op } = require("sequelize");
const { bannedIPAddresses } = require('../database/models');

//middleware to manage banned IP addresses
module.exports = async (req, res, next) => {
	const address = req.header('x-forwarded-for') || req.socket.remoteAddress;

	const record = await bannedIPAddresses.findOne({
		where: {
			content: address,

			expiry: {
				[Op.or]: {
					//future or forever
					[Op.gt]: Date.now(),
					[Op.eq]: null,
				}
			}
		}
	});

	//log the access timestamp
	const date = new Date();

	if (!!record) {
		console.log(`IP blocked\t${address}\t\t\t${date.toTimeString()}`);
		return res.status(403).send("IP address banned");
	}

	// console.log(`IP allowed\t${address}\t\t\t${date.toTimeString()}`);

	return next();
};