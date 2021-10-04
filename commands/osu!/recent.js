// Copyright (C) 2021 Brody Jagoe

const osu = require('node-osu');
const curl = require('curl');

const { modbits, parser, diff, ppv2 } = require('ojsama');
const { MessageEmbed } = require('discord.js');

const Sentry = require('../../log');
const { Client } = require('../../index');
const { osu_key } = require('../../config.json');
const { Users, sConfig } = require('../../dbObjects');
const { timeSince, getShortMods, getRank, getDiff } = require('../../utils');

module.exports = {
	name: 'recent',
	aliases: ['r', 'rs'],
	description: 'Gets the recently completed score on osu!',
	module: 'Osu!',
	disableOsu: true,
	perms: '',
	usage: '<user>',
	async execute(message, args) {
		// Access the api
		const osuApi = new osu.Api(osu_key, {
			notFoundAsError: true,
			completeScores: true,
			parseNumeric: true,
		});

		let prefix = '>>';
		let findUser;
		let menUser = message.mentions.users.first();
		let memberFlag = false;
		if (!menUser && args[0]) {
			memberFlag = true;
			if (message.guild.members.cache.get(args[0])) menUser = message.guild.members.cache.get(args[0]);
		}
		if (!menUser && !memberFlag) menUser = message.member;

		if (message.channel.type !== 'DM') {
			const serverConfig = await sConfig.findOne({ where: { guild_id: message.guild.id } });
			if (serverConfig) {
				prefix = serverConfig.get('prefix');
			}
		}

		const cyberia = Client.guilds.cache.get('687858540425117755');
		const verifiedEmote = cyberia.emojis.cache.find(emoji => emoji.name === 'verified');

		let name;
		let id;
		let mods = modbits.nomod;
		let acc_percent;
		let combo;
		let nmiss;
		let verified = `:x: Not Verified [use ${prefix}verify]`;


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
				verified = `${verifiedEmote} Verified`;
			} else {
				id = findUser.get('osu_id');
				name = findUser.get('osu_name');
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
		osuApi.getUserRecent({ u: search }).then(async r => {
			const recent = r[0];
			let acc = recent.accuracy;
			acc = acc.toFixed(4);
			// Calculate acc
			if (acc < 100) {
				acc *= 100;
			}
			acc = parseFloat(acc.toFixed(2));

			const score = recent.score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

			// Get the short version of mods (HD, HR etc.) and get emojis for score rank
			const shortMods = getShortMods(recent.mods);
			const rank = getRank(recent.rank);

			// PP calculation starts
			curl.get(`https://osu.ppy.sh/osu/${recent.beatmapId}`, async function(err, response, body) {
				mods = modbits.from_string(shortMods);
				acc_percent = parseFloat(acc);
				combo = parseInt(recent.maxCombo);
				nmiss = parseInt(recent.counts.miss);

				const parserBody = new parser().feed(body);

				const pMap = parserBody.map;

				const stars = new diff().calc({ map: pMap, mods: mods });

				const star = stars.toString().split(' ');

				const diffCalc = getDiff(star[0]);

				const pp = ppv2({
					stars: stars,
					combo: combo,
					nmiss: nmiss,
					acc_percent: acc_percent,
				});

				console.log(pp);

				const maxPP = ppv2({ map: pMap, mods: mods });

				const max_combo = pMap.max_combo();
				combo = combo || max_combo;

				const ppFix = pp.total.toFixed(2);
				const maxFix = maxPP.total.toFixed(2);

				const rDate = timeSince(recent.date.getTime());

				const hitobj = [];

				const hit300 = recent.counts[300];
				const hit100 = recent.counts[100];
				const hit50 = recent.counts[50];
				const hitmiss = recent.counts.miss;
				const totalhits = hit300 + hit100 + hit50 + hitmiss;

				const numobj = totalhits - 1;

				const num = pMap.objects.length;

				pMap.objects.forEach(obj => {
					hitobj.push(obj.time);
				});

				const timing = hitobj[num - 1] - hitobj[0];
				const point = hitobj[numobj] - hitobj[0];

				const mapCompletion = (point / timing) * 100;

				if (recent.pp) {
					recent.pp.toFixed(2);
				}

				if (recent.rank == 'F') {
					const failPercent = mapCompletion.toFixed(2);

					const osuFailEmbed = new MessageEmbed()
						.setAuthor(recent.user.name || name, `http://a.ppy.sh/${recent.user.id}`, `https://osu.ppy.sh/u/${recent.user.id}`)
						.setColor('#af152a')
						.setTitle(`${recent.beatmap.artist} - ${recent.beatmap.title} [${recent.beatmap.version}]`)
						.setDescription(`${rank} | ${diffCalc} ${star[0]}★ | ${score} | {${hit300}/${hit100}/${hit50}/${hitmiss}}

**${recent.maxCombo}x**/${recent.beatmap.maxCombo}X | **${ppFix || recent.pp}pp**/${maxFix}PP

${acc}% | ${modbits.string(mods) || 'NoMod'} | Map Completion: ${failPercent}%

${verified}`)
						.setURL(`https://osu.ppy.sh/b/${recent.beatmapId}`)
						.setThumbnail(`http://a.ppy.sh/${recent.user.id}`)
						.setFooter(`Completed ${rDate}`);
					message.channel.send({ embeds: [osuFailEmbed] });
				} else {
					const osuEmbed = new MessageEmbed()
						.setAuthor(recent.user.name || name, `http://a.ppy.sh/${recent.user.id}`)
						.setColor('#af152a')
						.setTitle(`${recent.beatmap.artist} - ${recent.beatmap.title} [${recent.beatmap.version}]`)
						.setDescription(`${rank} | ${diffCalc} ${star[0]}★ | ${score} | {${hit300}/${hit100}/${hit50}/${hitmiss}}

**${recent.maxCombo}x**/${recent.beatmap.maxCombo}X | **${ppFix || recent.pp}pp**/${maxFix}PP

${acc}% | ${modbits.string(mods) || 'NoMod'}
					
${verified}`)
						.setURL(`https://osu.ppy.sh/b/${recent.beatmapId}`)
						.setThumbnail(`http://a.ppy.sh/${recent.user.id}`)
						.setFooter(`Completed ${rDate}`);
					message.channel.send({ embeds: [osuEmbed] });
				}
			});
		}).catch(e => {
			if (e.name == 'Error') {
				Sentry.captureException(e);
				console.error(e);
				return message.reply(`No recent play was found for ${name}!`);
			}
			Sentry.captureException(e);
			console.error(e);
			return message.reply('An error has occured!');
		});
	},
};