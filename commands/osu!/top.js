const osu = require('node-osu');
const discord = require('discord.js');
const oj = require('ojsama');
const curl = require('curl');

const { osu_key } = require('../../config.json');
const { Users } = require('../../dbObjects');
const getShortMods = require('../../utils/getShortMods.js');
const getRank = require('../../utils/getRank.js');
const timeSince = require('../../utils/timeSince');
const getDiff = require('../../utils/getDiff.js');

module.exports = {
	name: 'top',
	aliases: 'osutop',
	description: 'Gets the top score of the user',
	module: 'osu!',
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
			console.log(topNum);
		}

		let findUser;
		const menUser = message.mentions.users.first();

		let name;
		let mods = oj.modbits.none;
		let acc_percent;
		let combo;
		let nmiss;

		// Access database
		if (menUser) {
			findUser = await Users.findOne({ where: { user_id: menUser.id } });
		} else {
			findUser = await Users.findOne({ where: { user_id: message.author.id } });
		}

		// Find the user in the database
		if (findUser) {
			name = findUser.get('user_osu');
		} else {
			name = message.author.username;
		}

		if (menUser && !findUser) {
			name = menUser.username;
		}

		// Use arguments if applicable
		if (!menUser && isNaN(args[0])) {
			name = args[0];
		}

		// Find user through the api
		osuApi.getUserBest({ u: name, limit: 10 }).then(async r => {
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
			acc = parseFloat(acc.toFixed(4));

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

				const rDate = timeSince(recent.date);

				// Create embed (Need to stlye this better)
				const osuEmbed = new discord.MessageEmbed()
					.setAuthor(name, `http://a.ppy.sh/${recent.user.id}`)
					.setColor('0xff69b4')
					.setTitle(`${recent.beatmap.artist} - ${recent.beatmap.title} [${recent.beatmap.version}]`)
					.setURL(`https://osu.ppy.sh/b/${recent.beatmapId}`)
					.setDescription(`${rank} | ${diff} ${star[0]}★ | ${score} | {${recent.counts['300']}/${recent.counts['100']}/${recent.counts['50']}/${recent.counts.miss}}

					**${recent.maxCombo}x**/${recent.beatmap.maxCombo}X | **${ppFix[0]}pp**/${maxFix[0]}PP

					${acc}% | ${oj.modbits.string(mods) || 'NoMod'}
					`)
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
				console.error(e);
				return message.reply('No top play was found!');
			}
			console.error(e);
			return message.reply('An error has occured!');
		});
	},
};