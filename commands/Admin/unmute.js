// Copyright (C) 2021 Brody Jagoe

const { MessageEmbed } = require('discord.js');
const { modAction } = require('../../utils');
const { Muted } = require('../../dbObjects');
const Sentry = require('../../log');

module.exports = {
	name: 'unmute',
	aliases: ['unsilence', 'umute'],
	description: 'Unmute a member in the server',
	module: 'Admin',
	guildOnly: true,
	perms: 'MANAGE_ROLES',
	args: true,
	modCmd: true,
	usage: '<member>',
	async execute(message, args) {
		if (!message.mentions.members.first()) return message.reply('Please mention a user.');

		const tag = message.mentions.members.first() || message.guild.member(args[0]);

		// Stop if the mention is the message author
		if (message.member === tag) return message.reply('You can not use this on yourself');

		// Remove the mention from the arguments
		args.shift();

		let reason = args.join(' ');

		// If no reason is found defaul to this
		if (!reason) reason = 'No Reason Given';

		const muteRole = message.guild.roles.cache.find(r => r.name === 'muted');

		// Error if no muted role is found
		if (!muteRole) {
			message.reply('[ERROR] No muted role found');
		}

		// Check if user has the muted role
		if(tag.roles.cache.find(r => r.name === 'muted')) {
			// Remove the muted role from the user
			tag.roles.remove(muteRole.id).then(() => {
				const unMuteEmbed = new MessageEmbed()
					.setTitle(`Unmuted in ${message.guild.name}`)
					.setColor('#4BB580')
					.setDescription(`Reason: ${reason}`);
				tag.send(unMuteEmbed);
			});
			message.channel.send(`Unmuted: ${tag.user}`);
			// Log the unmute
			modAction(message.author, tag, 'Unmute', reason, undefined);
			// Remove the user from the muted database
			try {
				const unMuted = await Muted.destroy({ where: { user_id: tag.id } });
				if (!unMuted) return console.log(`Failed to unmute ${tag.username}`);
			}catch(e) {
				Sentry.captureException(e);
				console.error(e);
				return message.reply('An error has occurred');
			}
		} else {
			message.reply('Member is not muted.');
		}
	},
};