const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'osuUsers.sqlite',
});

const seqMute = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'mutedUsers.sqlite',
});

const serverConfig = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'serverConfig.sqlite',
});

const Users = require('./models/Users')(sequelize, Sequelize);
const Muted = require('./models/Muted')(seqMute, Sequelize);
const sConfig = require('./models/Config')(serverConfig, Sequelize);

module.exports = { Users, Muted, sConfig };