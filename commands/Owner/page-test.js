const osu = require('node-osu');
const discord = require('discord.js');
const oj = require('ojsama');
const curl = require('curl');

const { osu_key } = require('../../config.json');
const { Users, sConfig } = require('../../dbObjects');
const getShortMods = require('../../utils/getShortMods.js');
const getRank = require('../../utils/getRank.js');

module.exports = {
	name: 'osutop-test',
	aliases: 'osu-test',
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
		const r_url = [];
		const r_artist = [];
		const r_mapName = [];
		const r_diff = [];
		const r_count300 = [];
		const r_count100 = [];
		const r_count50 = [];
		const r_miss = [];
		const r_combo = [];
		const r_maxCombo = [];
		const r_pp = [];
		const r_maxpp = [];
		const r_mod = [];

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

			const r_rank = [r1_rank, r2_rank, r3_rank];
			const shortModsArray = [shortMods_r1, shortMods_r2, shortMods_r3];

			function osuStat(callback) {
				for (let i = 0; i < r.length; i++) {
					const recent = r[i];
					curl.get(`https://osu.ppy.sh/osu/${recent.beatmapId}`, async function(err, response, body) {
						mods = oj.modbits.from_string(shortModsArray[i]);
						acc_percent = parseFloat(r_acc[i]);
						combo = parseInt(recent.maxCombo);
						nmiss = parseInt(recent.counts.miss);

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

						r_url.push(`https://osu.ppy.sh/b/${recent.beatmapId}`);
						r_artist.push(recent.beatmap.artist);
						r_mapName.push(recent.beatmap.title);
						r_diff.push(recent.beatmap.version);
						r_count300.push(recent.counts[300]);
						r_count100.push(recent.counts[100]);
						r_count50.push(recent.counts[50]);
						r_miss.push(recent.counts.miss);
						r_combo.push(recent.maxCombo);
						r_maxCombo.push(recent.beatmap.maxCombo);
						r_pp.push(ppNum.toFixed(2));
						r_maxpp.push(maxNum.toFixed(2));
						r_mod.push(oj.modbits.string(mods));

						console.log(`Recent ${i}: ${recent.beatmap.artist}`);
						console.log(`r_artist[${i}]: ${r_artist[i]}`);
					});
				}
				console.log(r_artist);

				callback();
			}

			osuStat(function() {
				console.log(r_artist[0]);
				console.log(r_artist[1]);

				const osuTopEmbed = new discord.MessageEmbed()
					.setTitle(`Top 3 Plays of ${name}`)
					.setDescription(`**1.** ${r_rank[0]} [${r_artist[0]} - ${r_mapName[0]} [${r_diff[0]}]](${r_url[0]} 'Map Link') 
{${r_count300[0]}/${r_count100[0]}/${r_count50[0]}/${r_miss[0]}} | **${r_combo[0]}x**/${r_maxCombo[0]}X | ${r_acc[0]}% | **${r_pp[0]}pp**/${r_maxpp[0]}PP | ${r_mod[0] || 'NoMod'}

**2.** ${r_rank[1]} [${r_artist[1]} - ${r_mapName[1]} [${r_diff[1]}]](${r_url[1]} 'Map Link') 
{${r_count300[1]}/${r_count100[1]}/${r_count50[1]}/${r_miss[1]}} | **${r_combo[1]}x**/${r_maxCombo[1]}X | ${r_acc[1]}% | **${r_pp[1]}pp**/${r_maxpp[1]}PP | ${r_mod[1] || 'NoMod'}

**3.** ${r_rank[2]} [${r_artist[2]} - ${r_mapName[2]} [${r_diff[2]}]](${r_url[2]} 'Map Link') 
{${r_count300[2]}/${r_count100[2]}/${r_count50[2]}/${r_miss[2]}} | **${r_combo[2]}x**/${r_maxCombo[2]}X | ${r_acc[2]}% | **${r_pp[2]}pp**/${r_maxpp[2]}PP | ${r_mod[2] || 'NoMod'}`);

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