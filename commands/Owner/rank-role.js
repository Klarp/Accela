const osu = require('node-osu');
const { MessageEmbed } = require('discord.js');
const { Users } = require('../../dbObjects');
const { osu_key } = require('../../config.json');
const getRankRole = require('../../utils/getRankRole');

module.exports = {
	name: 'rank-role',
	aliases: ['rankrole', 'rank-mode', 'rankmode', 'setmode'],
	module: 'Owner',
	guildOnly: true,
	owner: true,
	args: true,
	usage: '<mode>',
	async execute(message, args) {
		const osuApi = new osu.Api(osu_key);

		const mode = args[0].toLowerCase();
		if (message.guild.id !== '98226572468690944') return message.reply('This feature is only available in osu! game');

		const modeEmbed = new MessageEmbed()
			.setTitle('No Gamemode Found')
			.setDescription(`Please use one of these modes:

			**mania**
			**taiko**
			**ctb** (Catch the Beat)
			**std** (Standard)`);

		const modes = ['std', 'taiko', 'ctb', 'mania'];

		if (!modes.includes(mode)) return message.channel.send(modeEmbed);

		const osu_mode = {
			std: 0,
			taiko: 1,
			ctb: 2,
			mania: 3,
		};

		const roles = [
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


		const mode_num = osu_mode[mode];

		try {
			const upNum = await Users.update({
				osu_mode: mode_num,
			},
			{
				where: { user_id: message.author.id },
			});
			if (upNum > 0) {
				const user = await Users.findOne({ where: { user_id: message.author.id } });
				if (user.get('verified_id')) {
					const id = user.get('verified_id');
					let rank = null;
					await osuApi.getUser({ u: id }).then(u => {
						rank = u.pp.rank;
					});
					const role = getRankRole(rank, mode_num);
					await roles.forEach(r => {
						if (message.member.roles.cache.get(r)) message.member.roles.remove(r);
					});
					message.member.roles.add(role);
				}
				return message.reply(`Updated gamemode to osu!${mode}`);
			} else {
				return message.reply('No link found!');
			}
		} catch (e) {
			console.error(e);
			return message.reply('Error: "Something" wen\'t wrong.');
		}
	},
};