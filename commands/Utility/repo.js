// Copyright (C) 2021 Brody Jagoe

const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'repo',
	description: 'Posts the github repository',
	module: 'Utility',
	execute(message) {
		const repoEmbed = new MessageEmbed().setTitle('GitHub Repository').addField('repo', 'https://github.com/Klarp/Accela').setColor('#2F3136');
		message.channel.send({ embeds: [repoEmbed] });
	},
};