// Copyright (C) 2021 Brody Jagoe

const { MessageEmbed, Permissions } = require('discord.js');

const { modAction } = require('../../utils');
const Sentry = require('../../log');

module.exports = {
	name: 'ban',
	description: 'Ban a member from the guild',
	module: 'Admin',
	guildOnly: true,
	perms: 'BAN_MEMBERS',
	args: true,
	modCmd: true,
	usage: '<member> <reason>',
	execute(message, args) {
		const toBan = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

		if (!message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return message.channel.send('You do not have permission to perform this command!');
		if (!toBan) return message.channel.send('You must provide a valid member to ban.');
		if (toBan.id == message.author.id) return message.channel.send('You cannot ban yourself!');
		if (toBan.bannable == false) return message.channel.send('I cannot ban that member!');
		if (!message.guild.me.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return message.channel.send('I do not have permission to ban members!');
		if (message.member.roles.highest.position <= toBan.roles.highest.position) return message.channel.send('You cannot ban someone with the same role or roles above you!');

		/**
		 * @arg {string} reason The ban reason
		 * @returns {string} The message to send to the log channel, user, and message channel
		*/

		let reason = args.slice(1).join(' ');
		if (!reason) reason = 'No reason given.';

		const banEmbed = new MessageEmbed()
			.setTitle(`Banned from ${message.guild.name}`)
			.setColor('#EA4D4B')
			.setDescription(`Reason: ${reason}`);

		try {
			toBan.send({ embeds: [banEmbed] });
		} catch (err) {
			console.log(err);
			Sentry.captureException(err);
			message.channel.send('Could not send a DM to the member.');
		}

		setTimeout(() => {
			toBan.ban({ days: 1, reason: reason }).catch(err => {
				Sentry.captureException(err);
				console.log(err);
				message.channel.send('An error occured.');
			});
		}, 1000);

		modAction(message.author, toBan, 'Ban', reason, undefined);

		message.channel.send(`Banned ${toBan.user.username} ${reason ? 'with reason: ' + reason : 'with no reason given!'}`);
	},
};