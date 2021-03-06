// Copyright (C) 2021 Brody Jagoe

const osu = require('node-osu');
const Discord = require('discord.js');
const Sentry = require('../../log');

const { Client } = require('../../index');
const { osu_key } = require('../../config.json');
const { Users, sConfig } = require('../../dbObjects');

module.exports = {
	name: 'mania',
	aliases: ['piano'],
	description: 'Gets the requested osu! user information for mania',
	module: 'Osu!',
	usage: '<user>',
	async execute(message, args) {
		// Access the api
		const osuApi = new osu.Api(osu_key, {
			notFoundAsError: true,
			completeScores: true,
			parseNumeric: true,
		});

		let findUser;

		let menUser = message.mentions.users.first();
		let memberFlag = false;
		if (!menUser && args[0]) {
			memberFlag = true;
			if (message.guild.member(args[0])) menUser = message.guild.member(args[0]);
		}
		if (!menUser && !memberFlag) menUser = message.member;

		let prefix = '>>';

		let name;

		let id;

		let verified = `:x: Not Verified [use ${prefix}verify]`;

		if (message.channel.type !== 'dm') {
			const serverConfig = await sConfig.findOne({ where: { guild_id: message.guild.id } });
			if (serverConfig) {
				prefix = serverConfig.get('prefix');
			}
		}

		const cyberia = Client.guilds.cache.get('687858540425117755');

		const verifiedEmbed = cyberia.emojis.cache.find(emoji => emoji.name === 'verified');

		// Access database
		if (menUser) {
			findUser = await Users.findOne({ where: { user_id: menUser.id } });
		} else {
			findUser = await Users.findOne({ where: { user_id: message.author.id } });
		}

		if (menUser) {
			name = menUser.username;
			verified = '';
		}

		// Find the user in the database
		if (findUser) {
			if (findUser.get('verified_id')) {
				id = findUser.get('verified_id');
				name = findUser.get('osu_name');
				verified = `${verifiedEmbed} Verified`;
			} else {
				id = findUser.get('osu_id');
			}
		} else {
			name = message.author.username;
		}

		// Use arguments if applicable
		if (!menUser && args[0]) {
			name = args[0];
			verified = '';
		}

		if (!menUser && args[1]) {
			name = args.join(' ');
			verified = '';
		}

		if (!menUser && !findUser && !args[0]) {
			message.channel.send(`No link found: use ${prefix}link [osu user] to link your osu! account!`);
		}

		const search = name || id;

		// Find user through the api
		osuApi.getUser({ m: 3, u: search }).then(async user => {
			let d = user.raw_joinDate;
			d = d.split(' ')[0];

			const rank = user.pp.rank.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

			const crank = user.pp.countryRank.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

			const country = user.country.toLowerCase();

			const countryEmote = `:flag_${country}:`;

			// Create the embed
			const osuEmbed = new Discord.MessageEmbed()
				.setAuthor(`${user.name || name}`, `http://a.ppy.sh/${user.id}`, `https://osu.ppy.sh/u/${user.id}`)
				.setColor('#af152a')
				.setTitle(`Information On ${user.name}`)
				.setURL(`https://osu.ppy.sh/u/${user.id}`)
				.setDescription(`**Level** ${Math.floor(user.level)} | **Global Rank** ${rank} | **[${countryEmote}](https://osu.ppy.sh/rankings/mania/performance?country=${user.country} 'Country Rankings') Rank** ${crank}
				
**PP** ${Math.round(user.pp.raw)} | **Accuracy** ${user.accuracyFormatted} | **Play Count** ${user.counts.plays}

${verified}`)
				.setFooter(`osu!mania • Joined ${d}`);
				/*
				.addField('Accuracy', user.accuracyFormatted, true)
				.addField('Play Count', user.counts.plays, true)
				.addField('Rank', rank, true)
				.addField(`Country Rank (${user.country})`, crank, true)
				.addField('PP', Math.round(user.pp.raw), true)
				*/


			message.channel.send({ embed: osuEmbed });
		}).catch(e => {
			if (e.name == 'Error') {
				return message.reply('No recent play was found!');
			}
			Sentry.captureException(e);
			console.error(e);
			return message.reply('An error has occured!');
		});
	},
};