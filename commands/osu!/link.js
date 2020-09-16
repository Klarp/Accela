const { Users } = require('../../dbObjects');

module.exports = {
	name: 'link',
	description: 'Links osu! account for use with osu commands.',
	module: 'Osu!',
	usage: '<osu user>',
	args: true,
	async execute(message, args) {
		const user = args.join(' ').replace(/[^\w\s]/gi, '');

		if (user === '') return message.reply('Error: No special characters allowed!');

		try {
			await Users.create({
				user_id: message.author.id,
				user_osu: user,
			});
			return message.channel.send(`Linked ${message.author} to ${args.join(' ')}`);
		} catch(e) {
			if (e.name === 'SequelizeUniqueConstraintError') {
				try {
					const upUser = await Users.update({
						user_osu: args.join(' '),
					},
					{
						where: { user_id: message.author.id },
					});
					if (upUser > 0) {
						return message.reply(`Updated link to ${args.join(' ')}`);
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