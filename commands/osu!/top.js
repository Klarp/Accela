const osu = require('node-osu');
const discord = require('discord.js');
const oj = require('ojsama');
const curl = require('curl');

const { osu_key } = require('../../config.json');
const { Users, sConfig } = require('../../dbObjects');
const getShortMods = require('../../utils/getShortMods.js');
const getRank = require('../../utils/getRank.js');
const timeSince = require('../../utils/timeSince');
const getDiff = require('../../utils/getDiff.js');

module.exports = {
	name: 'top',
	aliases: 't',
	description: 'Gets the top score of the user',
	module: 'Osu!',
	usage: '<user>',
	async execute(message, args) {
		// Access the api
		const osuApi = new osu.Api(osu_key, {
			notFoundAsError: true,
			completeScores: true,
			parseNumeric: true,
		});

		let topNum = 0;

		if (!isNaN(args[0])) {
			topNum = parseInt(args[0]);
			if (topNum > 10) return message.reply('Only max of 10 scores can be searched');
			topNum -= 1;
		}

		let prefix = '>>';
		let findUser;
		const menUser = message.mentions.users.first();

		if (message.channel.type !== 'dm') {
			const serverConfig = await sConfig.findOne({ where: { guild_id: message.guild.id } });
			if (serverConfig) {
				prefix = serverConfig.get('prefix');
			}
		}

		let name;
		let id;
		let mods = oj.modbits.none;
		let acc_percent;
		let combo;
		let nmiss;
		let nameFlag = true;
		let verified = `:x: Not Verified [use ${prefix}verify]`;

		// Access database
		if (menUser) {
			findUser = await Users.findOne({ where: { user_id: menUser.id } });
		} else {
			findUser = await Users.findOne({ where: { user_id: message.author.id } });
		}

		if (!menUser && isNaN(args[0]) && args[0]) {
			name = args.join(' ');
			nameFlag = false;
			verified = '';
		}

		if (!menUser && !isNaN(args[0])) {
			if (args[1]) {
				nameFlag = false;
				args.shift();
				name = args.join(' ');
			} else {
				nameFlag = true;
			}
			verified = '';
		}

		// Find the user in the database
		if (nameFlag) {
			if (findUser) {
				if (findUser.get('verified_id')) {
					id = findUser.get('verified_id');
					name = findUser.get('osu_name');
					verified = ':white_check_mark: Verified';
				} else {
					id = findUser.get('osu_id');
				}
			} else {
				name = message.author.username;
				verified = '';
				console.log(name);
			}
		}

		if (menUser && !findUser) {
			name = menUser.username;
			verified = '';
			console.log('test3');
		}

		if (!menUser && !findUser && !args[0]) {
			message.channel.send(`No link found: use ${prefix}link [osu user] to link your osu! account!`);
			console.log('test4');
		}

		const search = name || id;

		// Find user through the api
		osuApi.getUserBest({ u: search, limit: 10 }).then(async r => {
			const recent = r[topNum];
			Number.prototype.toFixedDown = function(digits) {
				const re = new RegExp('(\\d+\\.\\d{' + digits + '})(\\d)'),
					m = this.toString().match(re);
				return m ? parseFloat(m[1]) : this.valueOf();
			};
			let acc = recent.accuracy;
			acc = acc.toFixed(4);
			// Calculate acc
			if (acc < 100) {
				acc *= 100;
			}
			acc = parseFloat(acc.toFixed(2));

			const score = recent.score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

			// Get the short version of mods (HD, HR etc.)
			const shortMods = getShortMods(recent.mods);
			const rank = getRank(recent.rank);

			// PP calculation starts
			curl.get(`https://osu.ppy.sh/osu/${recent.beatmapId}`, function(err, response, body) {
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
				combo = combo || max_combo;

				const ppFix = pp.toString().split(' ');
				const maxFix = maxPP.toString().split(' ');

				const ppNum = parseFloat(ppFix[0]);
				const maxNum = parseFloat(maxFix[0]);

				const rDate = timeSince(recent.date);

				// Create embed (Need to stlye this better)
				const osuEmbed = new discord.MessageEmbed()
					.setAuthor(recent.user.name, `http://a.ppy.sh/${recent.user.id}`, `https://osu.ppy.sh/u/${recent.user.id}`)
					.setColor('0xff69b4')
					.setTitle(`${recent.beatmap.artist} - ${recent.beatmap.title} [${recent.beatmap.version}]`)
					.setURL(`https://osu.ppy.sh/b/${recent.beatmapId}`)
					.setDescription(`${rank} | ${diff} ${star[0]}★ | ${score} | {${recent.counts['300']}/${recent.counts['100']}/${recent.counts['50']}/${recent.counts.miss}}

**${recent.maxCombo}x**/${recent.beatmap.maxCombo}X | **${ppNum.toFixed(2)}pp**/${maxNum.toFixed(2)}PP

${acc}% | ${oj.modbits.string(mods) || 'NoMod'}
					
${verified}`)
					.setFooter(`Completed ${rDate}`);

				/*
					.addField('300', recent.counts['300'], true)
					.addField('100', recent.counts['100'], true)
					.addField('50', recent.counts['50'], true)
					.addField('Miss', recent.counts.miss, true)
					.addField('Combo', `**${recent.maxCombo}x**${recent.beatmap.maxCombo}X`, true)
					.addField('PP Gained', `**${recent.pp || ppFix[0]}**${maxFix[0]}`, true)
					.addField('Accuracy', `${acc}%`, true)
					.addField('Mods', oj.modbits.string(mods) || 'NoMod', true)
				*/

				message.channel.send({ embed: osuEmbed });
			});
		}).catch(e => {
			if (e.name == 'Error') {
				return message.reply(`No top play was found for ${name}!`);
			}
			console.error(e);
			return message.reply('An error has occured!');
		});
	},
};