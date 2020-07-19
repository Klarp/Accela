const { Users } = require('../../dbObjects');

module.exports = {
	name: 'unlink',
	description: 'Unlinks osu! account',
	module: 'osu!',
	async execute(message) {
		try {
			const unLink = await Users.destroy({ where: { user_id: message.author.id } });
			if (!unLink) return message.reply('No link found!');

			return message.reply('Successfully unlinked!');
		}catch(e) {
			console.error(e);
			return message.reply('An error has occurred');
		}
	},
};