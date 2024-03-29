// Copyright (C) 2021 Brody Jagoe

const axios = require('axios');
const osu = require('node-osu');

const { MessageEmbed, Permissions } = require('discord.js');

const Sentry = require('../../log');
const { getRankRole } = require('../../utils');
const { osu_key, osu_key_v2 } = require('../../config.json');
const { Users } = require('../../dbObjects');
const { Client } = require('../../index');

module.exports = {
	name: 'verify',
	aliases: 'v',
	description: 'Verifies your osu! account',
	module: 'Osu!',
	usage: '[code]',
	execute(message, args) {
		const osuApi = new osu.Api(osu_key);

		// NO VERIFICATION CODE GIVEN
		if (!args[0]) {
			const noVerifyEmbed = new MessageEmbed()
				.setTitle('Please Verify Your osu! Account!')
				.setDescription('https://accela.xyz/verify.html')
				.setColor('#af152a');

			message.channel.send({ embeds: [noVerifyEmbed] });
		}

		// VERIFICATION CODE GIVEN
		if (args[0]) {

			// DELETES MESSAGE IF USED IN GUILD
			if (message.channel.type !== 'DM') {
				if (!message.guild.me.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return message.channel.send('Please use this command inside my DMs! (codes are private and one time use)');
				message.delete();
				return message.reply('Please use another code inside my DMs');
			}
			// START VERIFICATION
			const code = args[0];

			// const osuApi = new osu.Api(osu_key);

			axios.post(
				'https://osu.ppy.sh/oauth/token',
				{
					'grant_type': 'authorization_code',
					'client_id': 2576,
					'client_secret': osu_key_v2,
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

					// GET VERIFICATION THROUGH OSU (ADD getRankRole.js TO FIX)
					axios(options)
						.then(async function(res) {
							const user = res.data;
							const userStat = user.statistics;

							// RANK SYSTEM STARTS
							const osuGame = Client.guilds.cache.get('98226572468690944');
							const logChannel = osuGame.channels.cache.get('776522946872344586');
							const osuMember = osuGame.members.cache.get(message.author.id);

							const userEmbed = new MessageEmbed()
								.setTitle(':white_check_mark: Verfication Accepted!')
								.setColor('#af152a')
								.setDescription(`User: ${user.username}
Rank (osu!std): ${userStat.global_rank}`)
								.setFooter(`ID: ${user.id} | Use >>mode to change game modes`);

							const std_rank = userStat.global_rank;
							let taiko_rank;
							let ctb_rank;
							let mania_rank;

							console.log(`Standard: ${std_rank}`);

							await osuApi.getUser({ u: user.id, m: 1 }).then(osuUser => {
								taiko_rank = osuUser.pp.rank;
								if (taiko_rank === '0') taiko_rank = null;
								console.log(`Taiko: ${taiko_rank}`);
							});

							await osuApi.getUser({ u: user.id, m: 2 }).then(osuUser => {
								ctb_rank = osuUser.pp.rank;
								if (ctb_rank === '0') ctb_rank = null;
								console.log(`ctb: ${ctb_rank}`);
							});

							await osuApi.getUser({ u: user.id, m: 3 }).then(osuUser => {
								mania_rank = osuUser.pp.rank;
								if (mania_rank === '0') mania_rank = null;
								console.log(`Mania: ${mania_rank}`);
							});

							try {
								await Users.create({
									user_id: message.author.id,
									osu_name: user.username,
									osu_id: user.id,
									verified_id: user.id,
									std_rank: std_rank,
									taiko_rank: taiko_rank,
									ctb_rank: ctb_rank,
									mania_rank: mania_rank,
								});

								if (osuMember) {
									const rankUser = await Users.findOne({ where: { user_id: message.author.id } });
									if (rankUser.get('verified_id')) {
										const mode = rankUser.get('osu_mode');
										let rank;
										if (mode === 0 && std_rank !== null) rank = std_rank;
										if (mode === 1 && taiko_rank !== null) rank = taiko_rank;
										if (mode === 2 && ctb_rank !== null) rank = ctb_rank;
										if (mode === 3 && mania_rank !== null) rank = mania_rank;
										getRankRole(osuMember, rank, mode);
										logChannel.send(`:white_check_mark: ${message.author} verified with ${user.username}`);
									}
								}

								return message.channel.send({ embeds: [userEmbed] });
							} catch (e) {
								if (e.name === 'SequelizeUniqueConstraintError') {
									try {
										const u = await Users.findOne({ where: { user_id: message.author.id } });
										const mode = u.get('osu_mode');

										const upUser = await Users.update({
											osu_name: user.username,
											verified_id: user.id,
											std_rank: std_rank,
											taiko_rank: taiko_rank,
											ctb_rank: ctb_rank,
											mania_rank: mania_rank,
										},
										{
											where: { user_id: message.author.id },
										});
										if (upUser > 0) {
											if (osuMember) {
												const rankUser = await Users.findOne({ where: { user_id: message.author.id } });
												if (rankUser.get('verified_id')) {
													let rank;
													if (mode === 0 && std_rank !== null) rank = std_rank;
													if (mode === 1 && taiko_rank !== null) rank = taiko_rank;
													if (mode === 2 && ctb_rank !== null) rank = ctb_rank;
													if (mode === 3 && mania_rank !== null) rank = mania_rank;
													getRankRole(osuMember, rank, mode);
													logChannel.send(`:white_check_mark: ${message.author} verified with ${user.username}`);
												}
											}
											return message.channel.send({ embeds: [userEmbed] });
										}
									} catch (err) {
										Sentry.captureException(err);
										console.error(err);
										return message.reply('**ERROR**: Unable to verify!');
									}
								}
								Sentry.captureException(e);
								console.error(e);
								return message.reply('**Error**: "Something" wen\'t wrong.');
							}
						})


						.catch(function(err) {
							if (err.response) {
								console.error(err.response.status);
								console.error(err.response.statusName);
								console.error(err.response.data);
							} else if (err.request) {
								console.error(err.request);
							} else {
								console.error('Error:', err.message);
							}
							Sentry.captureException(err);
							console.error(err.config);
						});
				})
				.catch(err => {
					const osuGame = Client.guilds.cache.get('98226572468690944');
					const logChannel = osuGame.channels.cache.get('776522946872344586');
					const errorEmbed = new MessageEmbed()
						.setTitle(':x: Error: Could Not Verify!')
						.setColor('RED')
						.setDescription('Please try again with a new code.');
					message.channel.send({ embeds: [errorEmbed] });
					logChannel.send(`:x: ${message.author} failed to verify`);
					Sentry.captureException(err);
					console.log(err.response.status);
				});
		}
	},
};