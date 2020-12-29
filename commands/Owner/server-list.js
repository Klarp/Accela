const { Client } = require('../../index');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'server-list',
	aliases: ['serverlist', 'slist'],
	description: 'DM list of servers the bot is in',
	module: 'Owner',
	owner: true,
	async execute(message) {
		const guildCache = Client.guilds.cache;
		const guildSort = guildCache.sort((a, b) => b.memberCount - a.memberCount);
		const g = guildSort.map(guild => `${guild.name} | Members: ${guild.memberCount} | Owner: ${guild.owner.user.tag}`).join('\n');
		console.log(g);
		message.author.send(new MessageEmbed().addField('Servers', g.substring(0, 1000) + (g.length > 1000 ? '...' : '')));
	},
};

