describe('POST /auth/login', () => {
	beforeEach(() => {
		jest.resetModules();

		//fix util with jest (used by bcrypt's compare)
		jest.doMock('util', () => ({
			promisify: f => async () => f()
		}));

		//mock out bcrypt
		jest.doMock('bcryptjs', () => ({
			genSalt: async amount => {
				expect(amount).toBe(11);
				return 'salt';
			},
			hash: async (password, salt) => {
				expect(password).toBe('password');
				return 'hashed-password';
			},
			compare: (lhs, rhs) => {
				return lhs === rhs;
			}
		}));

		//mock out jsonwebtoken
		jest.doMock('jsonwebtoken', () => ({
			sign: (content, secretAccess, opts) => {
				return JSON.stringify(content);
			},

			verify: (token, secretAccess, callback) => {
				return callback(null, JSON.parse(token));
			},
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
				findOne: async (config) => { //can't find any (signup state)
					expect(config?.where?.email).toBe('email@example.com');
					return {
						index: 0,
						email: config?.where?.email,
						username: 'username',
						type: 'alpha',
						admin: false,
						mod: false,
					};
				},

				update: async (values, config) => {
					//Do nothing
				}
			},

			tokens: {
				create: async (record) => {
					//Do nothing
				}
			}
		}));
	});

	test('Basic valid login attempt', async () => {
		//arguments
		const req = {
			body: {
				email: 'email@example.com',
				password: 'password',
			}
		};

		const res = {
			status: code => {
				expect(code).toBe(200);
				return {
					json: tokens => {
						//decode and analyze the JWT payload
						const accessToken = JSON.parse(tokens.accessToken);

						expect(accessToken.email).toBe('email@example.com');
						expect(accessToken.username).toBe('username');
					},
					send: msg => { throw msg; },
					end: () => null
				}
			}
		}

		//test
		const route = require('../../server/auth/login');

		const result = await route(req, res);

		expect(result).toBe(null);
	});
});