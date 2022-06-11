describe('Integration Test Suite', () => {
	beforeEach(() => {
		jest.resetModules();

		//mock dotenv
		jest.doMock('dotenv', () => ({
			config: () => null
		}));

		//mock express
		jest.doMock('express', () => {
			const express = () => ({
				identity: 'app',
				use: () => null,
				get: () => null,
			});

			express.Router = () => ({
				identity: 'Router',
				use: () => null,
				get: () => null,
				post: () => null,
				patch: () => null,
				delete: () => null,
			});

			express.json = () => 'json';

			return express;
		});

		//mock http
		jest.doMock('http', () => ({
			Server: app => {
				expect(app.identity).toBe('app');

				return {
					listen: (port, cb) => cb()
				}
			}
		}));

		//mock sequelize
		class Seq {
			sync() {}
			define() {}
			static INTEGER() {}
		};
	
		jest.doMock('sequelize', () => {
			return Seq;
		});

		//mock node-cron
		jest.doMock('node-cron', () => {
			return {
				schedule: () => null
			}
		});
	});

	test('Start The Server', () => {
		const serv = require('../server/server');
	});
});