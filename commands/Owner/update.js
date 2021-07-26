// Copyright (C) 2021 Brody Jagoe
const qrate = require('qrate');
const osu = require('node-osu');
const Sentry = require('../../log');
const util = require('../../utils');
const { osu_key } = require('../../config.json');
const { Users } = require('../../dbObjects');
const { Client } = require('../../index');

module.exports = {
	name: 'update',
	description: 'Updates Accela\'s different features',
	module: 'Owner',
	owner: true,
	async execute() {
		const storedUsers = await Users.findAll();
		const startDate = Date.now();
		const osuApi = new osu.Api(osu_key);
		const osuUsers = await Users.findAll();

		console.log(storedUsers);

		storedUsers
			.filter(user => user.verified_id !== null)
			.filter(user => Client.users.cache.has(user.user_id));

		const osuGame = Client.guilds.cache.get('98226572468690944');
		const logChannel = osuGame.channels.cache.get('776522946872344586');

		logChannel.send(`**Force updating ${osuUsers.length} members**`);

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
			logChannel.send(`**Finished force updating members in ${finishDate.toFixed(2)} minutes**`);
		};

		for (let i = 0; i < osuUsers.length; i++) {
			q.push(osuUsers[i]);
		}

	},
};