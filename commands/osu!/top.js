const osu = require('node-osu');
const discord = require('discord.js');
const oj = require('ojsama');
const curl = require('curl');
const Sentry = require('../../log');

const { Client } = require('../../index');
const { osu_key } = require('../../config.json');
const { Users, sConfig } = require('../../dbObjects');
const { timeSince, getShortMods, getRank, getDiff } = require('../../utils');

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
		let menUser = message.mentions.users.first();
		let memberFlag = false;
		if (!menUser && args[0]) {
			memberFlag = true;
			if (message.guild.member(args[0])) menUser = message.guild.member(args[0]);
		}
		if (!menUser && !memberFlag) menUser = message.member;

		if (message.channel.type !== 'dm') {
			const serverConfig = await sConfig.findOne({ where: { guild_id: message.guild.id } });
			if (serverConfig) {
				prefix = serverConfig.get('prefix');
			}
		}

		const cyberia = Client.guilds.cache.get('687858540425117755');
		const verifiedEmote = cyberia.emojis.cache.find(emoji => emoji.name === 'verified');

		let name;
		let id;
		let mods = oj.modbits.nomod;
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

		// User look up | No Mention | No Number Arg
		if (!menUser && isNaN(args[0]) && args[0]) {
			name = args.join(' ');
			nameFlag = false;
			verified = '';
		}

		// No Mention | Has Number Arg
		if (!menUser && !isNaN(args[0])) {
			// Check if User Lookup
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
					verified = `${verifiedEmote} Verified`;
				} else {
					id = findUser.get('osu_id');
					name = findUser.get('osu_name');
				}
			} else {
				name = message.author.username;
			}
		}

		// If mentioned a user
		if (menUser && !findUser) {
			name = menUser.username;
			verified = '';
		}

		// Not linked message
		if (!menUser && !findUser && !args[0]) {
			message.channel.send(`No link found: use ${prefix}link [osu user] to link your osu! account!`);
		}

		const search = name || id;

		// Find user through the api
		osuApi.getUserBest({ u: search, limit: 10 }).then(async r => {
			const recent = r[topNum];
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

				const rDate = timeSince(recent.date.getTime());

				// Create embed (Need to stlye this better)
				const osuEmbed = new discord.MessageEmbed()
					.setAuthor(recent.user.name || name, `http://a.ppy.sh/${recent.user.id}`, `https://osu.ppy.sh/u/${recent.user.id}`)
					.setColor('#af152a')
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
			Sentry.captureException(e);
			console.error(e);
			return message.reply('An error has occured!');
		});
	},
};