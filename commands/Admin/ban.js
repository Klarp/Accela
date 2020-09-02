const modAction = require('../../utils/modAction.js');

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
		// >>ban [user] [reason]

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
			tag.send(`You have been banned from ${message.guild.name}! Reason: ${reason}`).then (() => {
				// Ban the user
				tag.ban({ days: 1, reason: reason }).catch(err => console.log(err));
			});
		} else {
			return message.reply(`Could not ban ${tag}.`);
		}
		// Log the ban
		modAction(message.author, tag, 'Ban', reason);

		message.channel.send(`Banned: ${tag.user}`);
	},
};