const osu = require('node-osu');
const discord = require('discord.js');
const oj = require('ojsama');
const curl = require('curl');

const { osu_key } = require('../../config.json');
const { Users } = require('../../dbObjects');
const getShortMods = require('../../utils/getShortMods.js');
const getRank = require('../../utils/getRank.js');
const timeSince = require('../../utils/timeSince');

module.exports = {
	name: 'recent',
	aliases: 'r',
	description: 'Gets the recently completed score on osu!',
	module: 'osu!',
	perms: '',
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

		if (menUser) {
			name = menUser.username;
		}

		// Find the user in the database
		if (findUser) {
			name = findUser.get('user_osu');
		} else {
			name = message.author.username;
		}

		// Use arguments if applicable
		if (!menUser && args[0]) {
			name = args[0];
		}

		// Find user through the api
		osuApi.getUserRecent({ u: name }).then(async r => {
			const recent = r[0];
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

			// Get the short version of mods (HD, HR etc.) and get emojis for score rank
			const shortMods = getShortMods(recent.mods);
			const rank = getRank(recent.rank);

			// PP calculation starts
			curl.get(`https://osu.ppy.sh/osu/${recent.beatmapId}`, async function(err, response, body) {
				mods = oj.modbits.from_string(shortMods);
				acc_percent = parseFloat(acc);
				combo = parseInt(recent.maxCombo);
				nmiss = parseInt(recent.counts.miss);

				const parser = new oj.parser().feed(body);

				const pMap = parser.map;

				if (mods) {
					console.log('+' + oj.modbits.string(mods));
				}

				const stars = new oj.diff().calc({ map: pMap, mods: mods });
				const star = stars.toString().split(' ');

				const pp = oj.ppv2({
					stars: stars,
					combo: combo,
					nmiss: nmiss,
					acc_percent: acc_percent,
				});

				const maxPP = oj.ppv2({ map: pMap });

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
					.setDescription(`${rank} ${star[0]}★ | ${score} | {${recent.counts['300']}/${recent.counts['100']}/${recent.counts['50']}/${recent.counts.miss}}

					**${recent.maxCombo}x**/${recent.beatmap.maxCombo}X | **${recent.pp || ppFix[0]}pp**/${maxFix[0]}PP

					${acc}% | ${oj.modbits.string(mods) || 'NoMod'}
					`)
					.setURL(`https://osu.ppy.sh/b/${recent.beatmapId}`)
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
				return message.reply('No recent play was found!');
			}
			console.error(e);
			return message.reply('An error has occured!');
		});
	},
};