const { modAction } = require('../../utils');

module.exports = {
	name: 'ban',
	description: 'Ban a user from the server.',
	module: 'Admin',
	guildOnly: true,
	perms: 'BAN_MEMBERS',
	args: true,
	modCmd: true,
	usage: '<user> <reason>',
	execute(message, args) {

		const toBan = message.mentions.members.first() || message.guild.member(args[0]);

		if (!message.member.hasPermission('BAN_MEMBERS')) return message.channel.send('You do not have permission to perform this command!');
		if (!toBan) return message.channel.send('You must provide a valid member to ban.');
		if (toBan.id == message.author.id) return message.channel.send('You cannot ban yourself!');
		if (toBan.bannable == false) return message.channel.send('I cannot ban that member!');
		if (!message.guild.me.hasPermission('BAN_MEMBERS')) return message.channel.send('I do not have permission to ban members!');
		if (message.member.roles.highest.position <= toBan.roles.highest.position) return message.channel.send('You cannot ban someone with the same role or roles above you!');

		/**
		 * @arg {string} reason The ban reason
		 * @returns {string} The message to send to the log channel, user, and message channel
		 */

		let reason = args.slice(1).join(' ');
		if (!reason) reason = 'No reason given.';

		try {
			toBan.send(`You have been banned from **${message.guild.name}**! Reason: ${reason}`);
		} catch (err) {
			console.log(err);
			message.channel.send('Could not send a DM to the member.');
		}

		setTimeout(() => {
			toBan.ban({ days: 1, reason: reason }).catch(err => {
				console.log(err);
				message.channel.send('An error occured.');
			});
		}, 1000);

		modAction(message.author, toBan, 'Ban', reason);

		message.channel.send(`Banned ${toBan.user.username} ${reason ? 'with reason: ' + reason : 'with no reason given!'}`);
	},
};

// also gonna redo this