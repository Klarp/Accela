const osu = require('node-osu');
const { Users } = require('../../dbObjects');
const { osu_key } = require('../../config.json');

module.exports = {
	name: 'link',
	description: 'Links osu! account for use with osu commands.',
	module: 'Osu!',
	usage: '<osu user>',
	args: true,
	async execute(message, args) {
		const name = args.join(' ');
		let id = null;
		let osuName = null;

		const osuApi = new osu.Api(osu_key, {
			notFoundAsError: true,
			completeScores: true,
			parseNumeric: true,
		});

		await osuApi.getUser({ u: name }).then(user => {
			id = user.id;
			osuName = user.name;
		});

		try {
			await Users.create({
				user_id: message.author.id,
				osu_name: osuName,
				osu_id: id,
			});
			return message.channel.send(`Linked ${message.author} to ${args.join(' ')}`);
		} catch(e) {
			if (e.name === 'SequelizeUniqueConstraintError') {
				try {
					const upUser = await Users.update({
						osu_name: osuName,
						osu_id: id,
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