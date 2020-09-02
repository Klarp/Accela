const modAction = require('../../utils/modAction.js');
const { Muted } = require('../../dbObjects');

module.exports = {
	name: 'unmute',
	aliases: ['unsilence', 'umute'],
	description: 'Unmute a member',
	module: 'Admin',
	guildOnly: true,
	perms: 'MANAGE_ROLES',
	args: true,
	modCmd: true,
	usage: '<user>',
	async execute(message, args) {
		// >>unmute [user] [reason]

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
		// If no reason is found defaul to this
		if (!reason) reason = 'No Reason Given';
		// Find the muted role in the server
		const muteRole = message.guild.roles.cache.find(r => r.name === 'muted');

		// Error if no muted role is found
		if (!muteRole) {
			message.reply('[ERROR] No muted role found');
		}

		// Check if user has the muted role
		if(tag.roles.cache.find(r => r.name === 'muted')) {
			// Remove the muted role from the user
			tag.roles.remove(muteRole.id).then(() => {
				tag.send(`You have been unmuted in ${message.guild.name}! Reason: ${reason}`);
			});
			message.channel.send(`Unmuted: ${tag.user}`);
			// Log the unmute
			modAction(message.author, tag, 'Unmute', reason);
			// Remove the user from the muted database
			try {
				const unMuted = await Muted.destroy({ where: { user_id: tag.id } });
				if (!unMuted) return console.log(`Failed to unmute ${tag.username}`);
			}catch(e) {
				console.error(e);
				return message.reply('An error has occurred');
			}
		} else {
			message.reply('Member is not muted.');
		}
	},
};