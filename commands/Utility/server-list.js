const { Client } = require('../../index');

module.exports = {
	name: 'server-list',
	aliases: ['serverlist', 'slist'],
	description: 'Get list of servers the bot is in [owner only]',
	module: 'Utility',
	owner: true,
	async execute() {
		Client.guilds.cache.forEach(g => {
			console.log(`${g.name} | Members: ${g.memberCount}`);
		});
	},
};