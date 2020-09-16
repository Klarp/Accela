const axios = require('axios');
const osu = require('node-osu');
const getRankRole = require('../../utils/getRankRole');
const { MessageEmbed } = require('discord.js');
const { osu_key, osuv2_key } = require('../../config.json');
const { Users } = require('../../dbObjects');
const { Client } = require('../..');

module.exports = {
	name: 'verify',
	description: 'Verifies your osu! account',
	module: 'osu!',
	owner: true,
	execute(message, args) {
		if (message.channel.type !== 'dm' && args[0]) {
			if (!message.guild.me.hasPermission('MANAGE_MESSAGES')) return message.channel.send('Please use this command inside my DMs!');
			message.delete();
			message.channel.send('Please use this command inside my DMs!');
		}
		const code = args[0];

		if (!code) {
			const verifyEmbed = new MessageEmbed()
				.setTitle('Verify osu! Account')
				.setColor('0xff69b4')
				.setDescription('[Click Here](https://accela.xyz/verify.html) to verify your osu! account');
			return message.channel.send(verifyEmbed);
		}

		const osuApi = new osu.Api(osu_key);

		axios.post(
			'https://osu.ppy.sh/oauth/token',
			{
				'grant_type': 'authorization_code',
				'client_id': 2576,
				'client_secret': osuv2_key,
				'redirect_uri': 'https://accela.xyz/verify.html',
				'code': code,
			},
			{
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
		)
			.then(function(response) {
				const osuToken = response.data.access_token;

				const options = {
					method: 'GET',
					headers:
				{
					'Authorization': `Bearer ${osuToken}`,
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
					data: '',
					url: 'https://osu.ppy.sh/api/v2/me/osu',
				};

				axios(options)
					.then(async function(res) {
						const user = res.data;
						const userStat = user.statistics;

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

						const userEmbed = new MessageEmbed()
							.setTitle(':white_check_mark: Verfication Accepted')
							.setColor('0xff69b4')
							.setDescription(`User: ${user.username} (${user.id})
Rank: ${userStat.pp_rank}`);

						const osuGame = Client.guilds.cache.get('98226572468690944');
						const osuMember = osuGame.members.cache.get(message.author.id);

						try {
							await Users.create({
								user_id: message.author.id,
								osu_name: user.name,
								osu_id: user.id,
								verified_id: user.id,
							});
							if (osuMember) {
								console.log('oink');
								const rankUser = await Users.findOne({ where: { user_id: message.author.id } });
								if (rankUser.get('verified_id')) {
									const id = rankUser.get('verified_id');
									let rank = null;
									const mode = rankUser.get('osu_mode');
									await osuApi.getUser({ u: id }).then(u => {
										rank = u.pp.rank;
									});
									const role = getRankRole(rank, mode);
									await roles.forEach(r => {
										if (osuMember.roles.cache.get(r)) osuMember.roles.remove(r);
									});
									osuMember.roles.add(role);
								}
							}
							return message.channel.send(userEmbed);
						} catch (e) {
							if (e.name === 'SequelizeUniqueConstraintError') {
								try {
									const upUser = await Users.update({
										osu_name: user.name,
										verified_id: user.id,
									},
									{
										where: { user_id: message.author.id },
									});
									if (upUser > 0) {
										if (osuMember) {
											const rankUser = await Users.findOne({ where: { user_id: message.author.id } });
											if (rankUser.get('verified_id')) {
												const id = rankUser.get('verified_id');
												let rank = null;
												const mode = rankUser.get('osu_mode');
												await osuApi.getUser({ u: id }).then(u => {
													rank = u.pp.rank;
												});
												const role = getRankRole(rank, mode);
												await roles.forEach(r => {
													if (osuMember.roles.cache.get(r)) osuMember.roles.remove(r);
												});
												osuMember.roles.add(role);
											}
										}
										return message.channel.send(userEmbed);
									}
								} catch (err) {
									console.error(err);
									return message.reply('Could not verify!');
								}
							}
							console.error(e);
							return message.reply('Error: "Something" wen\'t wrong.');
						}
					})
					.catch(function(error) {
						if (error.response) {
							console.error(error.response.status);
							console.error(error.response.statusName);
							console.error(error.response.data);
						} else if (error.request) {
							console.error(error.request);
						} else {
							console.error('Error:', error.message);
						}
						console.error(error.config);
					});
			})
			.catch(err => console.log(err.response.status));
	},
};
