const { Users } = require('../../dbObjects');
const Sentry = require('../../log');

module.exports = {
	name: 'unlink',
	description: 'Unlinks osu! account',
	module: 'Osu!',
	async execute(message) {
		try {
			const unLink = await Users.destroy({ where: { user_id: message.author.id } });
			if (!unLink) return message.reply('No link found!');

			roleList.forEach(r => {
				if (message.member.roles.cache.get(r)) {
					message.member.roles.remove(r);
				}
			});

			return message.reply('Successfully unlinked!');
		}catch(e) {
			Sentry.captureException(e);
			console.error(e);
			return message.reply('An error has occurred');
		}
	},
};

const roleList = [
	'754085973003993119',
	'754086188025118770',
	'754086290785304627',
	'754086299681685696',
	'754086107456471062',
	'754089529287245855',
	'754086656889585714',
	'754086784484376596',
	'754086852524507246',
	'754086905825460265',
	'754086720638681109',
	'754089662242357289',
	'754087013904547930',
	'754087748209475595',
	'754087814106448012',
	'754087911066173460',
	'754087679003721790',
	'754089750717136906',
	'754087989717762080',
	'754088203534729276',
	'754088281674743858',
	'754088358916915241',
	'754088053101953034',
	'754089875157942435',
];