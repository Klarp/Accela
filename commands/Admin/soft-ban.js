const modAction = require('../../utils/modAction.js');

module.exports = {
	name: 'soft-ban',
	aliases: ['sban', 'softban'],
	description: 'Kick a member and remove messages',
	module: 'Admin',
	guildOnly: true,
	perms: 'BAN_MEMBERS',
	args: true,
	modCmd: true,
	usage: '<user>',
	execute(message, args) {
		// >>soft-ban [user] [reason]

		// Stop if no mentions found
		if (!message.mentions.members.first()) return message.reply('Please mention a user.');
		// Grab the first mention in the message
		const tag = message.mentions.members.first();
		// Stop if the mention is the message author
		if (message.member === tag) return message.reply('You can not use this on yourself');
		// Remove the mention from the arguments
		args.shift();
		// Join the arguments to make the reason
		let reason = args.join(' ');
		// If no reason is found default to this
		if (!reason) reason = 'No Reason Given';
		// If the user is bannable ban the user
		if (tag.bannable) {
			tag.send(`You have been soft banned from ${message.guild.name}! This is not permanent and you are free to rejoin. Reason: ${reason}`);
			// Ban the user
			tag.ban({ days: 1, reason: reason });
			// Unban the user
			message.guild.members.unban(tag.id, { reason: 'softban' });
		} else {
			return message.reply(`Could not soft ban ${tag}.`);
		}
		// Log the softban
		modAction(message.author, tag, 'SoftBan', reason);

		message.channel.send(`Soft Banned: ${tag.user}`);
	},
};