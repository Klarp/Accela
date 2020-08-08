const osu = require('node-osu');
const discord = require('discord.js');
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
	module: 'osu!',
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
		let mods = oj.modbits.none;
		let acc_percent;
		let combo;
		let nmiss;

		// Info Recent One
		// r1_rank
		let r1_url;
		let r1_artist;
		let r1_mapName;
		let r1_diff;
		let r1_count300;
		let r1_count100;
		let r1_count50;
		let r1_miss;
		let r1_combo;
		let r1_maxCombo;
		// r1_acc
		let r1_pp;
		let r1_maxpp;
		let r1_mod;

		// Info Recent Two
		// r2_rank
		let r2_url;
		let r2_artist;
		let r2_mapName;
		let r2_diff;
		let r2_count300;
		let r2_count100;
		let r2_count50;
		let r2_miss;
		let r2_combo;
		let r2_maxCombo;
		// r2_acc
		let r2_pp;
		let r2_maxpp;
		let r2_mod;

		// Info Recent Two
		// r3_rank
		let r3_url;
		let r3_artist;
		let r3_mapName;
		let r3_diff;
		let r3_count300;
		let r3_count100;
		let r3_count50;
		let r3_miss;
		let r3_combo;
		let r3_maxCombo;
		// r3_acc
		let r3_pp;
		let r3_maxpp;
		let r3_mod;

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
			message.channel.send(`No link found: use ${prefix}link to link your osu! account!`);
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

			const r1_acc = r1.accuracy;
			const r2_acc = r2.accuracy;
			const r3_acc = r3.accuracy;

			const r_acc = [r1_acc, r2_acc, r3_acc];

			for (let i = 0; i < r_acc.length; i++) {
				let e = r_acc[i];

				if (e < 100) {
					e *= 100;
				}

				e = parseFloat(e.toFixed(2));

				r_acc[i] = e;
			}

			const r1_rank = getRank(r1.rank);
			const r2_rank = getRank(r2.rank);
			const r3_rank = getRank(r3.rank);

			// Get the short version of mods (HD, HR etc.)
			const shortMods_r1 = getShortMods(r1.mods);
			const shortMods_r2 = getShortMods(r2.mods);
			const shortMods_r3 = getShortMods(r3.mods);

			function osuStat(callback) {
			// PP calculation starts
				curl.get(`https://osu.ppy.sh/osu/${r1.beatmapId}`, function(err, response, body) {
					mods = oj.modbits.from_string(shortMods_r1);
					acc_percent = parseFloat(r_acc[0]);
					combo = parseInt(r1.maxCombo);
					nmiss = parseInt(r1.counts.miss);

					const parser = new oj.parser().feed(body);

					const pMap = parser.map;

					const stars = new oj.diff().calc({ map: pMap, mods: mods });

					const pp = oj.ppv2({
						stars: stars,
						combo: combo,
						nmiss: nmiss,
						acc_percent: acc_percent,
					});

					const maxPP = oj.ppv2({ map: pMap, mods: mods });

					const max_combo = pMap.max_combo();
					combo = combo || max_combo;

					const ppFix = pp.toString().split(' ');
					const maxFix = maxPP.toString().split(' ');

					const ppNum = parseFloat(ppFix[0]);
					const maxNum = parseFloat(maxFix[0]);

					r1_url = `https://osu.ppy.sh/b/${r1.beatmapId}`;
					r1_artist = r1.beatmap.artist;
					r1_mapName = r1.beatmap.title;
					r1_diff = r1.beatmap.version;
					r1_count300 = r1.counts[300];
					r1_count100 = r1.counts[100];
					r1_count50 = r1.counts[50];
					r1_miss = r1.counts.miss;
					r1_combo = r1.maxCombo;
					r1_maxCombo = r1.beatmap.maxCombo;
					r1_pp = ppNum.toFixed(2);
					r1_maxpp = maxNum.toFixed(2);
					r1_mod = oj.modbits.string(mods);
				});

				// PP calculation starts
				curl.get(`https://osu.ppy.sh/osu/${r2.beatmapId}`, function(err, response, body) {
					mods = oj.modbits.from_string(shortMods_r2);
					acc_percent = parseFloat(r_acc[1]);
					combo = parseInt(r2.maxCombo);
					nmiss = parseInt(r2.counts.miss);

					const parser = new oj.parser().feed(body);

					const pMap = parser.map;

					const stars = new oj.diff().calc({ map: pMap, mods: mods });

					const pp = oj.ppv2({
						stars: stars,
						combo: combo,
						nmiss: nmiss,
						acc_percent: acc_percent,
					});

					const maxPP = oj.ppv2({ map: pMap, mods: mods });

					const max_combo = pMap.max_combo();
					combo = combo || max_combo;

					const ppFix = pp.toString().split(' ');
					const maxFix = maxPP.toString().split(' ');

					const ppNum = parseFloat(ppFix[0]);
					const maxNum = parseFloat(maxFix[0]);

					r2_url = `https://osu.ppy.sh/b/${r2.beatmapId}`;
					r2_artist = r2.beatmap.artist;
					r2_mapName = r2.beatmap.title;
					r2_diff = r2.beatmap.version;
					r2_count300 = r2.counts[300];
					r2_count100 = r2.counts[100];
					r2_count50 = r2.counts[50];
					r2_miss = r2.counts.miss;
					r2_combo = r2.maxCombo;
					r2_maxCombo = r2.beatmap.maxCombo;
					r2_pp = ppNum.toFixed(2);
					r2_maxpp = maxNum.toFixed(2);
					r2_mod = oj.modbits.string(mods);
				});

				// PP calculation starts
				curl.get(`https://osu.ppy.sh/osu/${r3.beatmapId}`, function(err, response, body) {
					mods = oj.modbits.from_string(shortMods_r3);
					acc_percent = parseFloat(r_acc[2]);
					combo = parseInt(r3.maxCombo);
					nmiss = parseInt(r3.counts.miss);

					const parser = new oj.parser().feed(body);

					const pMap = parser.map;

					const stars = new oj.diff().calc({ map: pMap, mods: mods });

					const pp = oj.ppv2({
						stars: stars,
						combo: combo,
						nmiss: nmiss,
						acc_percent: acc_percent,
					});

					const maxPP = oj.ppv2({ map: pMap, mods: mods });

					const max_combo = pMap.max_combo();
					combo = combo || max_combo;

					const ppFix = pp.toString().split(' ');
					const maxFix = maxPP.toString().split(' ');

					const ppNum = parseFloat(ppFix[0]);
					const maxNum = parseFloat(maxFix[0]);

					r3_url = `https://osu.ppy.sh/b/${r3.beatmapId}`;
					r3_artist = r3.beatmap.artist;
					r3_mapName = r3.beatmap.title;
					r3_diff = r3.beatmap.version;
					r3_count300 = r3.counts[300];
					r3_count100 = r3.counts[100];
					r3_count50 = r3.counts[50];
					r3_miss = r3.counts.miss;
					r3_combo = r3.maxCombo;
					r3_maxCombo = r3.beatmap.maxCombo;
					r3_pp = ppNum.toFixed(2);
					r3_maxpp = maxNum.toFixed(2);
					r3_mod = oj.modbits.string(mods);

					console.log(r3_artist);

					callback();
				});
			}

			osuStat(function() {
				console.log(r1_artist);
				console.log(r3_artist);

				const osuTopEmbed = new discord.MessageEmbed()
					.setTitle(`Top 3 Plays of ${name}`)
					.setDescription(`**1.** ${r1_rank} [${r1_artist} - ${r1_mapName} [${r1_diff}]](${r1_url} 'Map Link') 
{${r1_count300}/${r1_count100}/${r1_count50}/${r1_miss}} | **${r1_combo}x**/${r1_maxCombo}X | ${r_acc[0]} | **${r1_pp}pp**/${r1_maxpp}PP | ${r1_mod || 'NoMod'}

**2.** ${r2_rank} [${r2_artist} - ${r2_mapName} [${r2_diff}]](${r2_url} 'Map Link') 
{${r2_count300}/${r2_count100}/${r2_count50}/${r2_miss}} | **${r2_combo}x**/${r2_maxCombo}X | ${r_acc[1]} | **${r2_pp}pp**/${r2_maxpp}PP | ${r2_mod || 'NoMod'}

**3.** ${r3_rank} [${r3_artist} - ${r3_mapName} [${r3_diff}]](${r3_url} 'Map Link') 
{${r3_count300}/${r3_count100}/${r3_count50}/${r3_miss}} | **${r3_combo}x**/${r3_maxCombo}X | ${r_acc[2]} | **${r3_pp}pp**/${r3_maxpp}PP | ${r3_mod || 'NoMod'}`);

				message.channel.send(osuTopEmbed);
			});


		}).catch(e => {
			if (e.name == 'Error') {
				return message.reply('No top play was found!');
			}
			console.error(e);
			return message.reply('An error has occured!');
		});
	},
};