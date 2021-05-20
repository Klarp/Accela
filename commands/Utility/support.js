// Copyright (C) 2021 Brody Jagoe

const { MessageEmbed } = require('discord.js');
const { Client } = require('../../index');

module.exports = {
	name: 'support',
	description: 'Get the link to the support server',
	module: 'Utility',
	execute(message) {
		const bot = Client.user;
		const invEmbed = new MessageEmbed()
			.setAuthor(bot.username, bot.displayAvatarURL())
			.setTitle('Join Accela\'s Support Server')
			.setColor('#2F3136')
			.setURL('https://discord.gg/jgzXHkU');

		message.channel.send(invEmbed);
	},
};