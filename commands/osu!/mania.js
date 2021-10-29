// Copyright (C) 2021 Brody Jagoe

// Shows wrong user (Might need to test on Gavin)
// Add kiss, hug, slap commands maybe? (this is pretty meta)

const osu = require('node-osu');

const { MessageEmbed } = require('discord.js');

const Sentry = require('../../log');
const { Client } = require('../../index');
const { osu_key } = require('../../config.json');
const { Users, sConfig } = require('../../dbObjects');

module.exports = {
	name: 'mania',
	aliases: ['piano'],
	description: 'Gets the requested osu! user information for mania',
	module: 'Osu!',
	disableOsu: true,
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

		if (menUser) {
			if (message.type === 'REPLY') menUser = null;
		}

		console.log(menUser);

		if (args[0] && !menUser && !memberFlag) {
			memberFlag = true;
			if (message.guild.members.cache.get(args[0])) findUser = message.guild.members.cache.get(args[0]);
		}

		if (!menUser && !memberFlag) findUser = message.member;

		let prefix = '>>';
		let name;
		let id;
		let verified = `:x: Not Verified [use ${prefix}verify]`;

		if (message.channel.type !== 'DM') {
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
		} else if (!memberFlag) {
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
			menUser ? name = menUser.username : name = message.author.username;
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
			let rank;
			let crank;
			let playCount;
			let acc;
			d = d.split(' ')[0];

			if (user.pp.rank) {
				rank = user.pp.rank.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			} else {
				rank = '0';
			}

			if (user.pp.countryRank) {
				crank = user.pp.countryRank.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			} else {
				crank = '0';
			}

			if (user.accuracyFormatted === 'NaN%') {
				acc = '0%';
			} else {
				acc = user.accuracyFormatted;
			}

			if (user.counts.plays) {
				playCount = user.counts.plays;
			} else {
				playCount = '0';
			}

			const country = user.country.toLowerCase();

			const countryEmote = `:flag_${country}:`;

			// Create the embed
			const osuEmbed = new MessageEmbed()
				.setAuthor(`${user.name || name}`, `http://a.ppy.sh/${user.id}`, `https://osu.ppy.sh/u/${user.id}`)
				.setColor('#af152a')
				.setTitle(`Information On ${user.name}`)
				.setURL(`https://osu.ppy.sh/u/${user.id}`)
				.setThumbnail(`http://a.ppy.sh/${user.id}`)
				.setDescription(`**Level** ${Math.floor(user.level)} | **Global Rank** ${rank} | **[${countryEmote}](https://osu.ppy.sh/rankings/mania/performance?country=${user.country} 'Country Rankings') Rank** ${crank}
				
**PP** ${Math.round(user.pp.raw)} | **Accuracy** ${acc} | **Play Count** ${playCount}

${verified}`)
				.setFooter(`osu!mania • Joined ${d}`);
				/*
				.addField('Accuracy', user.accuracyFormatted, true)
				.addField('Play Count', user.counts.plays, true)
				.addField('Rank', rank, true)
				.addField(`Country Rank (${user.country})`, crank, true)
				.addField('PP', Math.round(user.pp.raw), true)
				*/


			message.channel.send({ embeds: [osuEmbed] });
		}).catch(e => {
			if (e.name == 'Error') {
				return message.reply('No user was found with name/id ${name}!');
			}
			Sentry.captureException(e);
			console.error(e);
			return message.reply('An error has occured!');
		});
	},
};