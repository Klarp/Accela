const { Users } = require('../../dbObjects');

module.exports = {
	name: 'link',
	description: 'Links osu! account for use with osu commands.',
	module: 'osu!',
	usage: '<osu user>',
	args: true,
	async execute(message, args) {
		try {
			await Users.create({
				user_id: message.author.id,
				user_osu: args[0],
			});
			return message.channel.send(`Linked ${message.author} to ${args[0]}!`);
		} catch(e) {
			if (e.name === 'SequelizeUniqueConstraintError') {
				try {
					const upUser = await Users.update({
						user_osu: args[0],
					},
					{
						where: { user_id: message.author.id },
					});
					if (upUser > 0) {
						return message.reply(`Updated link to ${args[0]}!`);
					}
				} catch(err) {
					console.error(err);
					return message.reply('Could not find a link!');
				}
			}
			console.error(e);
			return message.reply('Error: "Something" wen\'t wrong.');
		}
	},
};