// Copyright (C) 2021 Brody Jagoe
const qrate = require('qrate');
const osu = require('node-osu');

const { MessageEmbed } = require('discord.js');

const Sentry = require('../../log');
const util = require('../../utils');
const { osu_key, owners } = require('../../config.json');
const { Users, sConfig } = require('../../dbObjects');
const { Client } = require('../../index');


module.exports = {
	name: 'update',
	description: 'Updates Accela\'s verification',
	cooldown: 30,
	module: 'Osu!',
	async execute(message, args) {
		const option = args[0];
		const osuApi = new osu.Api(osu_key);
		const storedUsers = await Users.findAll();
		const startDate = Date.now();
		let prefix = '>>';
		let serverConfig;
		if (message.channel.type !== 'DM') {
			serverConfig = await sConfig.findOne({ where: { guild_id: message.guild.id } });
		}

		if (serverConfig) {
			prefix = serverConfig.get('prefix');
		}

		storedUsers
			.filter(user => user.verified_id !== null)
			.filter(user => Client.users.cache.has(user.user_id));

		const osuGame = Client.guilds.cache.get('98226572468690944');
		const logChannel = osuGame.channels.cache.get('776522946872344586');

		if (!option) {
			const user = await Users.findOne({ where: { user_id: message.author.id } });

			if (!user) return message.reply(`User is not verified! Use \`${prefix}verify\` to verify!`);
			if (user.verified_id && Client.users.cache.has(user.user_id)) {
				console.log(user);
				const osuID = user.get('verified_id');
				const userID = user.get('user_id');
				const mode = user.get('osu_mode');

				let std_rank = null;
				let taiko_rank = null;
				let ctb_rank = null;
				let mania_rank = null;

				// std
				await osuApi.getUser({ u: osuID, m: 0 }).then(osuUser => {
					std_rank = osuUser.pp.rank;
					if (std_rank === '0') std_rank = null;
				});
				// Taiko
				await osuApi.getUser({ u: osuID, m: 1 }).then(osuUser => {
					taiko_rank = osuUser.pp.rank;
					if (taiko_rank === '0') taiko_rank = null;
				});
				// ctb
				await osuApi.getUser({ u: osuID, m: 2 }).then(osuUser => {
					ctb_rank = osuUser.pp.rank;
					if (ctb_rank === '0') ctb_rank = null;
				});
				// Mania
				await osuApi.getUser({ u: osuID, m: 3 }).then(osuUser => {
					mania_rank = osuUser.pp.rank;
					if (mania_rank === '0') mania_rank = null;
				});

				try {
					const upUser = await Users.update({
						std_rank: std_rank,
						taiko_rank: taiko_rank,
						ctb_rank: ctb_rank,
						mania_rank: mania_rank,
					},
					{
						where: { user_id: userID },
					});
					if (upUser > 0) {
						let rank;
						if (mode === 0 && std_rank !== null) rank = std_rank;
						if (mode === 1 && taiko_rank !== null) rank = taiko_rank;
						if (mode === 2 && ctb_rank !== null) rank = ctb_rank;
						if (mode === 3 && mania_rank !== null) rank = mania_rank;
						const osuMember = osuGame.members.cache.get(userID);
						if (osuMember) {
							util.getRankRole(osuMember, rank, mode);
							logChannel.send(`**Updating ${message.author}**`);
						}
					}

					const modeNums = {
						0: 'osu!std',
						1: 'osu!taiko',
						2: 'osu!ctb',
						3: 'osu!mania',
					};

					const osuMode = modeNums[user.get('osu_mode')];

					const updateEmbed = new MessageEmbed()
						.setTitle('Verification Update')
						.setAuthor(message.author.tag)
						.setColor('#af152a')
						.setDescription(`Mode: ${osuMode}
osu!std: ${std_rank}
osu!taiko: ${taiko_rank}
osu!ctb: ${ctb_rank}
osu!mania: ${mania_rank}`);

					message.channel.send({ embeds: [updateEmbed] });
				} catch (err) {
					Sentry.captureException(err);
					console.error(err);
				}
			}
		} else if (option === 'all') {
			let ownerCheck;
			owners.forEach(owner => {
				if (owner === message.author.id) ownerCheck = true;
			});
			if (!ownerCheck) return;

			logChannel.send(`**Started processing of ${storedUsers.length} members**`);

			const worker = async (u) => {
				const osuID = u.get('verified_id');
				const userID = u.get('user_id');
				const mode = u.get('osu_mode');
				let std_rank = null;
				let taiko_rank = null;
				let ctb_rank = null;
				let mania_rank = null;

				// std
				await osuApi.getUser({ u: osuID, m: 0 }).then(osuUser => {
					std_rank = osuUser.pp.rank;
					if (std_rank === '0') std_rank = null;
				});
				// Taiko
				await osuApi.getUser({ u: osuID, m: 1 }).then(osuUser => {
					taiko_rank = osuUser.pp.rank;
					if (taiko_rank === '0') taiko_rank = null;
				});
				// ctb
				await osuApi.getUser({ u: osuID, m: 2 }).then(osuUser => {
					ctb_rank = osuUser.pp.rank;
					if (ctb_rank === '0') ctb_rank = null;
				});
				// Mania
				await osuApi.getUser({ u: osuID, m: 3 }).then(osuUser => {
					mania_rank = osuUser.pp.rank;
					if (mania_rank === '0') mania_rank = null;
				});

				try {
					const upUser = await Users.update({
						std_rank: std_rank,
						taiko_rank: taiko_rank,
						ctb_rank: ctb_rank,
						mania_rank: mania_rank,
					},
					{
						where: { user_id: userID },
					});
					if (upUser > 0) {
						let rank;
						if (mode === 0 && std_rank !== null) rank = std_rank;
						if (mode === 1 && taiko_rank !== null) rank = taiko_rank;
						if (mode === 2 && ctb_rank !== null) rank = ctb_rank;
						if (mode === 3 && mania_rank !== null) rank = mania_rank;
						const osuMember = osuGame.members.cache.get(userID);
						if (osuMember) {
							util.getRankRole(osuMember, rank, mode);
						}
					}
				} catch (err) {
					Sentry.captureException(err);
					console.error(err);
				}
			};

			const q = qrate(worker, 1, 0.5);

			q.drain = () => {
				const lbDate = Date.now();
				let finishDate = lbDate - startDate;
				finishDate = finishDate / 60000;
				logChannel.send(`**Finished force updating ${storedUsers.length} members in ${finishDate.toFixed(2)} minutes**`);
			};

			for (let i = 0; i < storedUsers.length; i++) {
				q.push(storedUsers[i]);
			}
		} else {
			return;
		}
	},
};