const modAction = require('../../utils/modAction.js');

module.exports = {
	name: 'kick',
	description: 'Kick a user from the server.',
	module: 'Admin',
	guildOnly: true,
	perms: 'KICK_MEMBERS',
	args: true,
	modCmd: true,
	usage: '<user>',
	execute(message, args) {
		// >>kick [user] [reason]

		// Stops if no mentions found
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
		// If user is kickable kick the user
		if (tag.kickable) {
			tag.kick(reason);
		} else {
			return message.reply(`Could not kick ${tag}.`);
		}
		// Log the kick
		modAction(message.author, tag, 'Kick', reason);

		message.channel.send(`Kicked: ${tag.user} Reason: ${reason}`);
	},
};