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
		if (!message.mentions.members.first()) return message.reply('Please mention a user.');
		const tag = message.mentions.members.first();
		if (message.member === tag) return message.reply('You can not use this on yourself');
		args.shift();
		const reason = args.join(' ');
		if (tag.kickable) {
			tag.kick(reason);
		} else {
			return message.reply(`Could not kick ${tag}.`);
		}
		modAction(message.author, tag, 'Kick', reason);

		message.channel.send(`Kicked: ${tag.user} Reason: ${reason}`);
	},
};