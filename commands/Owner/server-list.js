const { Client } = require('../../index');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'server-list',
	aliases: ['serverlist', 'slist'],
	description: 'Get list of servers the bot is in [owner only]',
	module: 'Owner',
	owner: true,
	async execute(message) {
		const g = Client.guilds.cache.map(guild => `${guild.name} | Members: ${guild.memberCount} | Owner: ${guild.owner.user.tag}`).join('\n');
		console.log(g);
		message.author.send(new MessageEmbed().addField('Servers', g.substring(0, 1000) + (g.length > 1000 ? '...' : '')));
	},
};

