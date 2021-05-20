// Copyright (C) 2021 Brody Jagoe

const Discord = require('discord.js');
const { Client } = require('../../index');

module.exports = {
	name: 'shutdown',
	aliases: 'sd',
	description: 'Emergancy shutdown for the bot',
	module: 'Owner',
	owner: true,
	async execute(message) {
		const sdEmbed = new Discord.MessageEmbed()
			.setTitle('EMERGANCY SHUTDOWN COMMENCED')
			.setDescription('Shutting down...');
		await message.channel.send(sdEmbed);
		Client.destroy();
	},
};