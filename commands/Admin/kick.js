const { MessageEmbed } = require('discord.js');
const { modAction } = require('../../utils');
const Sentry = require('../../log');

module.exports = {
	name: 'kick',
	description: 'Kick a member from the server.',
	module: 'Admin',
	guildOnly: true,
	perms: 'KICK_MEMBERS',
	args: true,
	modCmd: true,
	usage: '<member> <reason>',
	execute(message, args) {
		/**
		 * Member to be kicked
		 * @const {Object}
		 */
		const toKick = message.mentions.members.first() || message.guild.member(args[0]);

		if (!message.member.hasPermission('KICK_MEMBERS')) return message.channel.send('You do not have permission to perform this command!');
		if (!toKick) return message.channel.send('You must provide a valid member to kick.');
		if (toKick.id == message.author.id) return message.channel.send('You cannot kick yourself!');
		if (toKick.kickable == false) return message.channel.send('I cannot kick that member!');
		if (!message.guild.me.hasPermission('KICK_MEMBERS')) return message.channel.send('I do not have permission to ban members!');
		if (message.member.roles.highest.position <= toKick.roles.highest.position) return message.channel.send('You cannot kick someone with the same role or roles above you!');

		/**
		 * @arg {string} reason The kick reason
		 * @returns {string} The message to send to the log channel, user, and message channel
		 */

		let reason = args.slice(1).join(' ');
		if (!reason) reason = 'No reason given.';

		const kickEmbed = new MessageEmbed()
			.setTitle(`You've been kicked from ${message.guild.name}`)
			.setColor('#F5E44D')
			.setDescription(`Reason: ${reason}`);

		try {
			toKick.send(kickEmbed);
		} catch (err) {
			Sentry.captureException(err);
			console.log(err);
			message.channel.send('Could not send a DM to the member.');
		}

		setTimeout(() => {
			toKick.kick({ reason: reason }).catch(err => {
				Sentry.captureException(err);
				console.log(err);
				message.channel.send('An error occured.');
			});
		}, 1000);

		modAction(message.author, toKick, 'Kick', reason, undefined);

		message.channel.send(`Kicked ${toKick.user.username} ${reason ? 'with reason: ' + reason : 'with no reason given!'}`);
	},
};