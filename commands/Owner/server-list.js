// Copyright (C) 2021 Brody Jagoe

const { MessageEmbed } = require('discord.js');
const { Client } = require('../../index');

module.exports = {
	name: 'server-list',
	aliases: ['serverlist', 'slist'],
	description: 'DM list of servers the bot is in',
	module: 'Owner',
	owner: true,
	async execute(message) {
		const guildCache = Client.guilds.cache;
		const guildSort = guildCache.sort((a, b) => b.memberCount - a.memberCount);
		const g = await guildSort.map(guild => `${guild.name} | Members: ${guild.memberCount}`).join('\n');
		console.log(g);
		const serverEmbed = new MessageEmbed().addField('Servers', g.substring(0, 1000) + (g.length > 1000 ? '...' : ''));
		message.author.send({ embeds: [serverEmbed] });
	},
};

