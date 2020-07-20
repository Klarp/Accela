const modAction = require('../../utils/modAction.js');

module.exports = {
	name: 'ban',
	description: 'Ban a user from the server.',
	module: 'Admin',
	guildOnly: true,
	perms: 'BAN_MEMBERS',
	args: true,
	usage: '<user>',
	execute(message, args) {
		if (!message.mentions.members.first()) return message.reply('Please mention a user.');
		const tag = message.mentions.members.first();
		if (message.member === tag) return message.reply('You can not use this on yourself');
		args.shift();
		let reason = args.join(' ');
		if (!reason) reason = 'No Reason Given';
		if (tag.bannable) {
			tag.send(`You have been banned from ${message.guild.name}! Reason: ${reason}`).then (() => {
				tag.ban({ days: 1, reason: reason }).catch(err => console.log(err));
			});
		} else {
			return message.reply(`Could not ban ${tag}.`);
		}
		modAction(message.author, tag, 'Ban', reason);

		message.channel.send(`Banned: ${tag.user}`);
	},
};