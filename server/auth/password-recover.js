//libraries
const nodemailer = require('nodemailer');

const { accounts, recovery } = require('../database/models');

//utilities
const uuid = require('../utilities/uuid');
const validateEmail = require('../utilities/validate-email');

//auth/recover
const route = async (req, res) => {
	//validate details
	const validateErr = await validateDetails(req.body);
	if (validateErr) {
		return res.status(401).end(validateErr);
	}

	//recovery token
	const token = uuid(32);

	//send the recovery email
	const emailErr = await sendRecoveryEmail(req.body.email, token);
	if (emailErr) {
		return res.status(500).send(emailErr);
	}

	//save the token
	await recovery.upsert({
		email: req.body.email,
		token: token
	});

	//finally
	res.status(200).send("Recovery email sent!");
	return null;
};

const validateDetails = async (body) => {
	//basic formatting
	if (!validateEmail(body.email)) {
		return 'Invalid email';
	}

	//check for existing email
	const emailRecord = await accounts.findOne({
		where: {
			email: body.email
		}
	});

	if (!emailRecord) {
		return 'Invalid email';
	}

	//OK
	return null;
};

const sendRecoveryEmail = async (email, token) => {
	const addr = `${process.env.WEB_PROTOCOL}://${process.env.WEB_ADDRESS}/auth/reset?token=${token}`;
	const msg = `Hello,

Please visit the following link to reset your password: ${addr}

If you did not request a password reset, you can safely ignore this message.
`;

	let transporter, info;

	//what exactly is a transport?
	try {
		transporter = nodemailer.createTransport({
			host: process.env.MAIL_SMTP,
			port: 465,
			secure: true,
			auth: {
			  user: process.env.MAIL_USERNAME,
			  pass: process.env.MAIL_PASSWORD
			},
		});
	}
	catch(e) {
		return `failed to create a mail transport: ${e}`;
	}

	// send mail with defined transport object
	try {
		info = await transporter.sendMail({
			from: `recovery@${process.env.WEB_ADDRESS}`, //WARNING: google overwrites this
			to: email,
			subject: 'Password Recovery',
			text: msg
		});
	}
	catch(e) {
		return `failed to send validation mail: ${e}`;
	}

	if (info.accepted[0] != email) {
		return 'recovery email failed to send';
	}

	return null;
};

module.exports = route;