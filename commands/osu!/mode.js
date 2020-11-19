const osu = require('node-osu');
const { MessageEmbed } = require('discord.js');
const { Client } = require('../../index');
const { Users } = require('../../dbObjects');
const { osu_key } = require('../../config.json');
const getRankRole = require('../../utils/getRankRole');

module.exports = {
	name: 'mode',
	description: 'Changes mode for rank role system',
	module: 'Osu!',
	guildOnly: true,
	usage: '[mode]',
	async execute(message, args) {
		const osuApi = new osu.Api(osu_key);

		const osuGame = Client.guilds.cache.get('98226572468690944');
		const osuMember = osuGame.members.cache.get(message.author.id);

		const modeNums = {
			'std': 0,
			'taiko': 1,
			'ctb': 2,
			'mania': 3,
		};

		const modes = ['std', 'taiko', 'ctb', 'mania'];

		const noVerifyEmbed = new MessageEmbed()
			.setTitle('Please Verify Your osu! Account!')
			.setDescription('https://accela.xyz/verify.html')
			.setColor('#af152a');

		const user = await Users.findOne({ where: { user_id: message.author.id } });

		if (!user) return message.channel.send(noVerifyEmbed);
		if (!user.get('verified_id')) return message.channel.send(noVerifyEmbed);
		if (!osuMember) return message.reply('You cannot do that yet.');

		if (!args[0]) {
			let mode = 0;

			const filter = m => m.author === message.author;

			const modeEmbed = new MessageEmbed()
				.setTitle('Which mode would you like?')
				.setColor('#af152a')
				.setDescription(`**std (Standard)**
**mania**
**taiko**
**ctb (Catch The Beat)**`);

			await message.channel.send(modeEmbed).then(() => {
				message.channel.awaitMessages(filter, { max: 1, time: 10000, errors: ['time'] })
					.then(async collected => {
						mode = collected.first().content;

						if (!modes.includes(mode)) return message.channel.send('Invalid Mode! Please try again.');

						const userMode = modeNums[mode];
						const id = user.get('verified_id');
						let rank = null;

						await osuApi.getUser({ u: id, m: userMode }).then(async u => {
							rank = u.pp.rank;
							if (rank === '0') rank = 'null';
							try {
								// Standard
								if (mode === 0) {
									const upNum = await Users.update({
										osu_mode: userMode,
										std_rank: rank,
									},
									{
										where: { user_id: message.author.id },
									});
									if (upNum > 0) {
										getRankRole(message.member, rank, userMode);
										return message.reply(`Updated gamemode to osu!${mode}`);
									} else {
										return message.reply('No linked account found!');
									}
								}
								// Taiko
								if (mode === 1) {
									const upNum = await Users.update({
										osu_mode: userMode,
										taiko_rank: rank,
									},
									{
										where: { user_id: message.author.id },
									});
									if (upNum > 0) {
										getRankRole(message.member, rank, userMode);
										return message.reply(`Updated gamemode to osu!${mode}`);
									} else {
										return message.reply('No linked account found!');
									}
								}
								// ctb
								if (userMode === 2) {
									const upNum = await Users.update({
										osu_mode: userMode,
										ctb_rank: rank,
									},
									{
										where: { user_id: message.author.id },
									});
									if (upNum > 0) {
										getRankRole(message.member, rank, userMode);
										return message.reply(`Updated gamemode to osu!${mode}`);
									} else {
										return message.reply('No linked account found!');
									}
								}
								// Mania
								if (userMode === 3) {
									const upNum = await Users.update({
										osu_mode: userMode,
										mania_rank: rank,
									},
									{
										where: { user_id: message.author.id },
									});
									if (upNum > 0) {
										getRankRole(message.member, rank, userMode);
										return message.reply(`Updated gamemode to osu!${mode}`);
									} else {
										return message.reply('No linked account found!');
									}
								}
							} catch(e) {
								console.error(e);
								return message.reply('Error: "Something" wen\'t wrong.');
							}
						});
					})
					.catch(collected => {
						if (collected.size === 0) {
							return message.reply('you did not answer in time!');
						} else {
							console.log(collected.size);
						}
					});
			});
		} else {
			const mode = args[0].toLowerCase();

			if (!modes.includes(mode)) return message.channel.send('Invalid Mode! Please try again.');

			const userMode = modeNums[mode];
			const id = user.get('verified_id');
			let rank = null;
			await osuApi.getUser({ u: id, m: userMode }).then(async u => {
				rank = u.pp.rank;
				if (rank === '0') rank = null;
				try {
					// Standard
					if (userMode === 0) {
						const upNum = await Users.update({
							osu_mode: userMode,
							std_rank: rank,
						},
						{
							where: { user_id: message.author.id },
						});
						if (upNum > 0) {
							return message.reply(`Updated gamemode to osu!${mode}`);
						} else {
							return message.reply('No linked account found!');
						}
					}
					// Taiko
					if (userMode === 1) {
						const upNum = await Users.update({
							osu_mode: userMode,
							taiko_rank: rank,
						},
						{
							where: { user_id: message.author.id },
						});
						if (upNum > 0) {
							return message.reply(`Updated gamemode to osu!${mode}`);
						} else {
							return message.reply('No linked account found!');
						}
					}
					// ctb
					if (userMode === 2) {
						const upNum = await Users.update({
							osu_mode: userMode,
							ctb_rank: rank,
						},
						{
							where: { user_id: message.author.id },
						});
						if (upNum > 0) {
							console.log('oink');
							return message.reply(`Updated gamemode to osu!${mode}`);
						} else {
							return message.reply('No linked account found!');
						}
					}
					// Mania
					if (userMode === 3) {
						const upNum = await Users.update({
							osu_mode: userMode,
							mania_rank: rank,
						},
						{
							where: { user_id: message.author.id },
						});
						if (upNum > 0) {
							return message.reply(`Updated gamemode to osu!${mode}`);
						} else {
							return message.reply('No linked account found!');
						}
					}
				} catch(e) {
					console.error(e);
					return message.reply('Error: "Something" wen\'t wrong.');
				}
			});
			getRankRole(message.member, rank, userMode);
		}
	},
};