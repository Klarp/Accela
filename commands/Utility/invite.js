// Copyright (C) 2021 Brody Jagoe

const { MessageEmbed } = require('discord.js');
const { Client } = require('../../index');

module.exports = {
	name: 'invite',
	aliases: 'inv',
	description: 'Get the invite link for Accela',
	module: 'Utility',
	execute(message) {
		const bot = Client.user;
		const invEmbed = new MessageEmbed()
			.setAuthor(bot.username, bot.displayAvatarURL())
			.setTitle('Invite Accela to your server')
			.setURL('https://discordapp.com/oauth2/authorize?client_id=687856844848234502&scope=bot&permissions=805383190');

		message.channel.send({ embeds: [invEmbed] });
	},
};