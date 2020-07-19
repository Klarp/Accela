const modAction = require('../../utils/modAction.js');

module.exports = {
	name: 'soft-ban',
	aliases: ['sban', 'softban'],
	description: 'Kick a member and remove messages',
	module: 'Admin',
	guildOnly: true,
	perms: 'BAN_MEMBERS',
	args: true,
	usage: '<user>',
	execute(message, args) {
		if (!message.mentions.members.first()) return message.reply('Please mention a user.');
		const tag = message.mentions.members.first();
		args.shift();
		let reason = args.join(' ');
		if (!reason) reason = 'No Reason Given';
		if (tag.bannable) {
			tag.send(`You have been soft banned from ${message.guild.name}! This is not permanent and you are free to rejoin. Reason: ${reason}`);
			tag.ban({ days: 1, reason: reason });
			message.guild.members.unban(tag.id, { reason: 'softban' });
		} else {
			return message.reply(`Could not soft ban ${tag}.`);
		}
		modAction(message.author, tag, 'SoftBan', reason);

		message.channel.send(`Soft Banned: ${tag.user}`);
	},
};