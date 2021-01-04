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

require('./models/Users.js')(sequelize, Sequelize);
require('./models/Muted.js')(seqMute, Sequelize);
require('./models/Config.js')(serverConfig, Sequelize);

const force = process.argv.includes('--force') || process.argv.includes('-f');
const osu = process.argv.includes('--osu') || process.argv.includes('-o');

syncData();

function syncData() {
	sequelize.sync({ force }).then(async () => {
		console.log('osu! users synced');
		sequelize.close();
	}).catch(console.error);

	if (osu) return;

	seqMute.sync({ force }).then(async () => {
		console.log('Muted users synced');
		seqMute.close();
	}).catch(console.error);

	serverConfig.sync({ force }).then(async () => {
		console.log('Server config synced');
		serverConfig.close();
	}).catch(console.error);
}

