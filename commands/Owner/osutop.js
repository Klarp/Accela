const osu = require('node-osu');
const { MessageEmbed } = require('discord.js');
const oj = require('ojsama');
const curl = require('curl');

const { osu_key } = require('../../config.json');
const { Users, sConfig } = require('../../dbObjects');
const getShortMods = require('../../utils/getShortMods.js');
const getRank = require('../../utils/getRank.js');

module.exports = {
	name: 'osutop',
	aliases: ['ot', 'osstop'],
	description: 'Gets the 3 top scores of the user [development]',
	module: 'Owner',
	owner: true,
	usage: '<user>',
	async execute(message, args) {
		// Access the api
		const osuApi = new osu.Api(osu_key, {
			notFoundAsError: true,
			completeScores: true,
			parseNumeric: true,
		});

		let findUser;
		const menUser = message.mentions.users.first();
		const serverConfig = await sConfig.findOne({ where: { guild_id: message.guild.id } });

		let name;

		let prefix = '>>';
		if (serverConfig) {
			prefix = serverConfig.get('prefix');
		}

		// Access database
		if (menUser) {
			findUser = await Users.findOne({ where: { user_id: menUser.id } });
		} else {
			findUser = await Users.findOne({ where: { user_id: message.author.id } });
		}

		if (menUser) {
			name = menUser.username;
		}

		// Find the user in the database
		if (findUser) {
			name = findUser.get('user_osu');
		} else {
			name = message.author.username;
			message.channel.send(`No link found: use ${prefix}link [osu user] to link your osu! account!`);
		}

		// Use arguments if applicable
		if (!menUser && args[0]) {
			name = args[0];
		}

		if (!menUser && args[1]) {
			name = args.join(' ');
		}

		// Find user through the api
		osuApi.getUserBest({ u: name, limit: 3 }).then(async r => {
			const r1 = r[0];
			const r2 = r[1];
			const r3 = r[2];

			const r1_info = {
				rank: getRank(r1.rank),
				artist: r1.beatmap.artist,
				title: r1.beatmap.title,
				diff: r1.beatmap.version,
				count300: r1.counts['300'],
				count100: r1.counts['100'],
				count50: r1.counts['50'],
				miss: r1.counts.miss,
				combo: r1.maxCombo,
				maxCombo: r1.beatmap.maxCombo,
				acc: null,
				pp: null,
				maxPP: null,
				mods: null,
			};

			const r2_info = {
				rank: getRank(r2.rank),
				artist: r2.beatmap.artist,
				title: r2.beatmap.title,
				diff: r2.beatmap.version,
				count300: r2.counts['300'],
				count100: r2.counts['100'],
				count50: r2.counts['50'],
				miss: r2.counts.miss,
				combo: r2.maxCombo,
				maxCombo: r2.beatmap.maxCombo,
				acc: null,
				pp: null,
				maxPP: null,
				mods: null,
			};

			const r3_info = {
				rank: getRank(r3.rank),
				artist: r3.beatmap.artist,
				title: r3.beatmap.title,
				diff: r3.beatmap.version,
				count300: r3.counts['300'],
				count100: r3.counts['100'],
				count50: r3.counts['50'],
				miss: r3.counts.miss,
				combo: r3.maxCombo,
				maxCombo: r3.beatmap.maxCombo,
				acc: null,
				pp: null,
				maxPP: null,
				mods: null,
			};

			// Curl time (kill me)

			curl.get(`https://osu.ppy.sh/osu/${r1.beatmapId}`, function(err, response, body) {
				const r1_mods = oj.modbits.from_string(getShortMods(r1.mods));
				const r1_nmiss = r1.counts.miss;
				const r1_combo = parseInt(r1.maxCombo);
				let r1_acc = parseFloat(r1.accuracy.toFixed(2));

				if (r1_acc < 100) {
					r1_acc *= 100;
				}

				const parser = new oj.parser().feed(body);
				const pMap = parser.map;

				const stars = new oj.diff().calc({ map: pMap, mods: r1_mods });

				const r1_pp = oj.ppv2({
					stars: stars,
					combo: r1_combo,
					nmiss: r1_nmiss,
					acc_percent: r1_acc,
				});

				const r1_maxPP = oj.ppv2({ map: pMap, mods: r1_mods });

				const ppFix = r1_pp.toString().split(' ');
				const maxFix = r1_maxPP.toString().split(' ');

				if (r1.pp) {
					r1.pp.toFixed(2);
				}

				r1_info.acc = r1_acc;
				r1_info.pp = ppFix || r1.pp;
				r1_info.maxPP = maxFix;
				r1_info.mods = r1_mods;
			});

			curl.get(`https://osu.ppy.sh/osu/${r2.beatmapId}`, function(err, response, body) {
				const r2_mods = oj.modbits.from_string(getShortMods(r2.mods));
				const r2_nmiss = r2.counts.miss;
				const r2_combo = parseInt(r2.maxCombo);
				let r2_acc = parseFloat(r2.accuracy.toFixed(2));

				if (r2_acc < 100) {
					r2_acc *= 100;
				}

				const parser = new oj.parser().feed(body);
				const pMap = parser.map;

				const stars = new oj.diff().calc({ map: pMap, mods: r2_mods });

				const r2_pp = oj.ppv2({
					stars: stars,
					combo: r2_combo,
					nmiss: r2_nmiss,
					acc_percent: r2_acc,
				});

				const r2_maxPP = oj.ppv2({ map: pMap, mods: r2_mods });

				const ppFix = r2_pp.toString().split(' ');
				const maxFix = r2_maxPP.toString().split(' ');

				if (r2.pp) {
					r2.pp.toFixed(2);
				}

				r2_info.acc = r2_acc;
				r2_info.pp = ppFix || r2.pp;
				r2_info.maxPP = maxFix;
				r2_info.mods = r2_mods;
			});

			curl.get(`https://osu.ppy.sh/osu/${r3.beatmapId}`, function(err, response, body) {
				const r3_mods = oj.modbits.from_string(getShortMods(r3.mods));
				const r3_nmiss = r3.counts.miss;
				const r3_combo = parseInt(r3.maxCombo);
				let r3_acc = parseFloat(r3.accuracy.toFixed(2));

				if (r3_acc < 100) {
					r3_acc *= 100;
				}

				const parser = new oj.parser().feed(body);
				const pMap = parser.map;

				const stars = new oj.diff().calc({ map: pMap, mods: r3_mods });

				const r3_pp = oj.ppv2({
					stars: stars,
					combo: r3_combo,
					nmiss: r3_nmiss,
					acc_percent: r3_acc,
				});

				const r3_maxPP = oj.ppv2({ map: pMap, mods: r3_mods });

				const ppFix = r3_pp.toString().split(' ');
				const maxFix = r3_maxPP.toString().split(' ');

				if (r3.pp) {
					r3.pp.toFixed(2);
				}

				r3_info.acc = r3_acc;
				r3_info.pp = ppFix || r3.pp;
				r3_info.maxPP = maxFix;
				r3_info.mods = r3_mods;
			});

			/*
				1. RANK ARTIST - TITLE [DIFF NAME]
				{300/100/50/Miss} | combox/maxComboX | Acc | pp/MaxPP | Mods
				2. RANK ARTIST - TITLE [DIFF NAME]
				{300/100/50/Miss} | combox/maxComboX | Acc | pp/MaxPP | Mods
				3. RANK ARTIST - TITLE [DIFF NAME]
				{300/100/50/Miss} | combox/maxComboX | Acc | pp/MaxPP | Mods
			*/

			const topEmbed = new MessageEmbed()
				.setAuthor(name, `http://a.ppy.sh/${r1.user.id}`)
				.setColor('0xff69b4')
				.setTitle(`Top 3 Plays of ${name}`)
				.setDescription(`**1.** ${r1_info.rank} **${r1_info.artist} - ${r1_info.title} [${r1_info.diff}]**

{${r1_info.count300}/${r1_info.count100}/${r1_info.count50}/${r1_info.miss}} | **${r1_info.combo}x**/${r1_info.maxCombo}X | ${r1_info.acc}% | **${r1_info.pp}pp**/${r1_info.maxPP}PP | ${r1_info.mods}

**2.** ${r2_info.rank} **${r2_info.artist} - ${r2_info.title} [${r2_info.diff}]**

{${r2_info.count300}/${r2_info.count100}/${r2_info.count50}/${r2_info.miss}} | **${r2_info.combo}x**/${r2_info.maxCombo}X | ${r2_info.acc}% | **${r2_info.pp}pp**/${r2_info.maxPP}PP | ${r2_info.mods}

**3.** ${r3_info.rank}** ${r3_info.artist} - ${r3_info.title} [${r3_info.diff}]**

{${r3_info.count300}/${r3_info.count100}/${r3_info.count50}/${r3_info.miss}} | **${r3_info.combo}x**/${r3_info.maxCombo}X | ${r3_info.acc}% | **${r3_info.pp}pp**/${r3_info.maxPP}PP | ${r3_info.mods}`);

			message.channel.send(topEmbed);
		}).catch(e => {
			if (e.name == 'Error') {
				return message.reply('No top play was found!');
			}
			console.error(e);
			return message.reply('An error has occured!');
		});
	},
};