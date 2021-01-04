const { MessageEmbed } = require('discord.js');
const { modAction } = require('../../utils');

module.exports = {
	name: 'soft-ban',
	aliases: ['sban', 'softban'],
	description: 'Kick a member from the server and remove member\'s messages',
	module: 'Admin',
	guildOnly: true,
	perms: 'BAN_MEMBERS',
	args: true,
	modCmd: true,
	usage: '<member> <reason>',
	execute(message, args) {
		/**
		 * Member to be soft banned
		 * @const toSF
		 */
		const toSF = message.mentions.members.first() || message.guild.member(args[0]);

		if (!message.member.hasPermission('BAN_MEMBERS')) return message.channel.send('You do not have permission to perform this command!');
		if (!toSF) return message.channel.send('You must provide a valid member to softban.');
		if (toSF.id == message.author.id) return message.channel.send('You cannot softban yourself!');
		if (toSF.kickable == false) return message.channel.send('I cannot softban that member!');
		if (!message.guild.me.hasPermission('KICK_MEMBERS')) return message.channel.send('I do not have permission to softban members!');
		if (message.member.roles.highest.position <= toSF.roles.highest.position) return message.channel.send('You cannot softban someone with the same role or roles above you!');

		/**
		 * @arg {string} reason The softban reason
		 * @returns {string} The message to send to the log channel, user, and message channel
		 */

		let reason = args.slice(1).join(' ');
		if (!reason) reason = 'No reason given.';

		const sfEmbed = new MessageEmbed()
			.setTitle(`Softbanned from ${message.guild.name}`)
			.setColor('#EA4D4B')
			.setDescription(`Reason: ${reason}`);

		try {
			toSF.send(sfEmbed);
		} catch (err) {
			console.log(err);
			message.channel.send('Could not send a DM to the member.');
		}

		setTimeout(() => {
			toSF.ban({ days: 1, reason: reason }).catch(err => {
				console.log(err);
				message.channel.send('An error occured.');
			});
			message.guild.members.unban(toSF.id, { reason: 'softban' });
		}, 1000);

		modAction(message.author, toSF, 'SoftBan', reason, undefined);

		message.channel.send(`Softbanned ${toSF.user.username} ${reason ? 'with reason: ' + reason : 'with no reason given!'}`);
	},
};