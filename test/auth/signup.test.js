describe('POST /auth/signup', () => {
	beforeEach(() => {
		jest.resetModules();

		//mock out bcrypt
		jest.doMock('bcryptjs', () => ({
			genSalt: async amount => {
				expect(amount).toBe(11);
				return 'salt';
			},
			hash: async (password, salt) => {
				expect(password).toBe('password');
				return 'hashed-password';
			}
		}));

		//mock out nodemailer
		jest.doMock('nodemailer', () => ({
			createTransport: jest.fn(config => {
				//TODO: test config?
				return { //return a fake transport object
					sendMail: async email => {
						expect(email.to).toBe('email@example.com');
						return { //return a fake info object
							accepted: [ email.to ]
						}
					}
				};
			}),
		}));

		//mock out the sequelize library
		jest.doMock('sequelize', () => {
			return {
				Op: {
					//
				}
			}
		});

		//mock out the database object
		jest.doMock('../../server/database', () => {
			const mSequelize = {
				authenticate: jest.fn(),
				define: jest.fn(),
			};

			const actualSequelize = jest.requireActual('sequelize');
			return { Sequelize: jest.fn(() => mSequelize), DataTypes: actualSequelize.DataTypes };			
		});

		//mock out the database models
		jest.doMock('../../server/database/models', () => ({
			accounts: {
				findOne: () => null //can't find any (signup state)
			},

			pendingSignups: {
				upsert: jest.fn(async record => {
					expect(record.email).toBe('email@example.com');
					expect(record.username).toBe('username');
					expect(record.hash).toBe('hashed-password');
					expect(record.contact).toBe(true);
					//token is a random UUID
				})
			}
		}));
	});

	test('Basic valid signup attempt', async () => {
		//arguments
		const req = {
			body: {
				email: 'email@example.com',
				username: 'username',
				password: 'password',
				contact: true
			}
		};

		const res = {
			status: code => {
				expect(code).toBe(200);
				return {
					send: msg => expect(msg).toBe('Validation email sent!'),
					end: () => null
				}
			}
		}

		//test
		const route = require('../../server/auth/signup');

		const result = await route(req, res);

		expect(result).toBe(null);
	});
});