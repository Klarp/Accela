const osu = require('node-osu');
const Discord = require('discord.js');
const oj = require('ojsama');
const curl = require('curl');

const { osu_key } = require('../../config.json');
const { Users, sConfig } = require('../../dbObjects');
const getManiaMods = require('../../utils/getManiaMods.js');
const getRank = require('../../utils/getRank.js');
const timeSince = require('../../utils/timeSince');
const getDiff = require('../../utils/getDiff.js');

module.exports = {
	name: 'osu-test',
	aliases: ['osutest', 'testosu'],
	description: 'Tests osu! commands',
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
		let mods = oj.modbits.none;
		let acc_percent;
		let combo;
		let nmiss;

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
		osuApi.getUserRecent({ m: 3, u: name }).then(async r => {
			const recent = r[0];
			console.log(recent.mods);
			let acc = recent.accuracy;
			acc = acc.toFixed(4);
			if (acc < 100) {
				acc *= 100;
			}
			acc = parseFloat(acc.toFixed(2));

			const score = recent.score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

			const shortMods = getManiaMods(recent.mods);
			console.log(shortMods);
			const rank = getRank(recent.rank);
			console.log(`https://osu.pp.sh/osu/${recent.beatmapId}`);

			curl.get(`https://osu.ppy.sh/osu/${recent.beatmapId}`, async function(err, response, body) {
				mods = oj.modbits.from_string(shortMods);
				acc_percent = parseFloat(acc);
				combo = parseInt(recent.maxCombo);
				nmiss = parseInt(recent.counts.miss);

				const parser = new oj.parser().feed(body);

				const pMap = parser.map;

				const stars = new oj.diff().calc({ map: pMap, mods: mods });
				const star = stars.toString().split(' ');

				const diff = getDiff(star[0]);

				const pp = oj.ppv2({
					stars: stars,
					combo: combo,
					nmiss: nmiss,
					acc_percent: acc_percent,
				});

				const maxPP = oj.ppv2({ map: pMap, mods: mods });

				const max_combo = pMap.max_combo();
				combo = combo || max_combo();

				const ppFix = pp.toString().split(' ');
				const maxFix = maxPP.toString().split(' ');
				const ppNum = parseFloat(ppFix);
				const maxNum = parseFloat(maxFix);

				const rDate = timeSince(recent.date);

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

					const osuFailEmbed = new Discord.MessageEmbed()
						.setAuthor(name, `http://a.ppy.sh/${recent.user.id}`, `https://osu.ppy.sh/u/${recent.user.id}`)
						.setColor('0xff69b4')
						.setTitle(`${recent.beatmap.artist} - ${recent.beatmap.title} [${recent.beatmap.version}]`)
						.setDescription(`${rank} | ${diff} ${star[0]}★ | ${score} | {${hit300}/${hit100}/${hit50}/${hitmiss}}

**${recent.maxCombo}x**/${recent.beatmap.maxCombo}X | **${recent.pp || ppNum.toFixed(2)}pp**/${maxNum.toFixed(2)}PP

${acc}% | ${oj.modbits.string(mods) || 'NoMod'} | Map Completion: ${failPercent}%`)
						.setURL(`https://osu.ppy.sh/b/${recent.beatmapId}`)
						.setFooter(`Completed ${rDate}`);
					message.channel.send(osuFailEmbed);
					console.timeEnd('Recent');
				} else {
					const osuEmbed = new Discord.MessageEmbed()
						.setAuthor(name, `http://a.ppy.sh/${recent.user.id}`)
						.setColor('0xff69b4')
						.setTitle(`${recent.beatmap.artist} - ${recent.beatmap.title} [${recent.beatmap.version}]`)
						.setDescription(`${rank} | ${diff} ${star[0]}★ | ${score} | {${hit300}/${hit100}/${hit50}/${hitmiss}}

**${recent.maxCombo}x**/${recent.beatmap.maxCombo}X | **${recent.pp || ppNum.toFixed(2)}pp**/${maxNum.toFixed(2)}PP

${acc}% | ${oj.modbits.string(mods) || 'NoMod'}
					`)
						.setURL(`https://osu.ppy.sh/b/${recent.beatmapId}`)
						.setFooter(`Completed ${rDate}`);
					message.channel.send(osuEmbed);
					console.timeEnd('Recent');
				}
			});
		}).catch(e => {
			if (e.name == 'Error') {
				return message.reply('No recent play was found!');
			}
			console.error(e);
			return message.reply('An error has occured!');
		});
	},
};