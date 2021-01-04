const osu = require('node-osu');
const discord = require('discord.js');
const oj = require('ojsama');
const curl = require('curl');

const { Client } = require('../../index');
const { osu_key } = require('../../config.json');
const { Users, sConfig } = require('../../dbObjects');
const { getShortMods, getRank, timeSince, getDiff } = require('../../utils');
const idGrab = require('../../index.js');

module.exports = {
	name: 'compare',
	aliases: ['cs'],
	description: 'Compares with last score sent',
	module: 'Osu!',
	async execute(message, args) {
		if (!idGrab) return message.reply('No score to compare.');
		if (!idGrab.mapID) return message.reply('No score to compare.');

		/**
		 * The ID of the beatmap
		 * @const {string}
		 */
		const beatmap = idGrab.mapID.toString().split('/').pop();

		// Access the api
		const osuApi = new osu.Api(osu_key, {
			notFoundAsError: true,
			completeScores: true,
			parseNumeric: true,
		});

		/**
		 * Wether the user is in the database
		 * @type {boolean}
		 */
		let findUser;

		/**
		 * The first mentioned user in the message
		 * @type {Object}
		 */
		let menUser = message.mentions.users.first();
		let memberFlag = false;
		if (!menUser && args[0]) {
			memberFlag = true;
			menUser = message.guild.member(args[0]);
		}
		if (!menUser && memberFlag) menUser = message.member;

		/**
		 * The prefix of the server
		 * @type {string}
		 */
		let prefix = '>>';

		if (message.channel.type !== 'dm') {
			const serverConfig = await sConfig.findOne({ where: { guild_id: message.guild.id } });
			if (serverConfig) {
				prefix = serverConfig.get('prefix');
			}
		}

		/**
		 * The guild with the required emotes
		 * @const {Object}
		 */
		const cyberia = Client.guilds.cache.get('687858540425117755');

		/**
		 * The verified emote
		 * @const {Object}
		 */
		const verifiedEmote = cyberia.emojis.cache.find(emoji => emoji.name === 'verified');

		/**
		 * The name of the user
		 * @type {string}
		 */
		let name;

		/**
		 * The ID of the user
		 * @type {string}
		 */
		let id;

		/**
		 * The mods used in the score
		 * @type {string}
		 */
		let mods = oj.modbits.nomod;

		/**
		 * The accuracy percentage of the score
		 * @type {number}
		 */
		let acc_percent;

		/**
		 * The top combo of the score
		 * @type {number}
		 */
		let combo;

		/**
		 * The count of misses in the score
		 * @type {number}
		 */
		let nmiss;

		/**
		 * The verified text for the embed
		 * @type {string}
		 */
		let verified = `:x: Not Verified [use ${prefix}verify]`;

		// Access database
		if (menUser) {
			findUser = await Users.findOne({ where: { user_id: menUser.id } });
		} else {
			findUser = await Users.findOne({ where: { user_id: message.author.id } });
		}

		// Find the user in the database
		if (findUser) {
			if (findUser.get('verified_id')) {
				id = findUser.get('verified_id');
				name = findUser.get('osu_name');
				verified = `${verifiedEmote} Verified`;
			} else {
				id = findUser.get('osu_id');
			}
		} else {
			name = message.author.username;
		}

		if (menUser && !findUser) {
			name = menUser.username;
			verified = '';
		}

		// Use arguments if applicable
		if (!menUser && args[0]) {
			name = args[0];
			verified = '';
		}

		if (!menUser && !findUser && !args[0]) {
			message.channel.send(`No link found: use ${prefix}link [osu user] to link your osu! account!`);
		}

		const search = name || id;

		// Find user through the api
		osuApi.getScores({ u: search, b: beatmap }).then(async r => {
			/**
			 * The most recent score
			 * @const {Object}
			 */
			const recent = r[0];

			/**
			 * The accuracy of the recent score
			 * @type {number}
			 */
			let acc = recent.accuracy;
			acc = acc.toFixed(4);
			// Calculate acc
			if (acc < 100) {
				acc *= 100;
			}
			acc = parseFloat(acc.toFixed(2));

			/**
			 * The score of the recent score
			 * @const {string}
			 */
			const score = recent.score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

			/**
			 * The short version of mods used on the score
			 * @const {string}
			 */
			const shortMods = getShortMods(recent.mods);

			/**
			 * The emoji used for the rank
			 * @const {Object}
			 */
			const rank = getRank(recent.rank);

			// PP calculation starts
			curl.get(`https://osu.ppy.sh/osu/${recent.beatmapId}`, async function(err, response, body) {
				mods = oj.modbits.from_string(shortMods);
				acc_percent = parseFloat(acc);
				combo = parseInt(recent.maxCombo);
				nmiss = parseInt(recent.counts.miss);

				/**
				 * The parsed body of the beatmap
				 * @const {Object}
				 */
				const parser = new oj.parser().feed(body);

				/**
				 * The parsed beatmap
				 * @const {Object}
				 */
				const pMap = parser.map;

				/**
				 * The calculated star difficulty of the beatmap
				 * @const {Object}
				 */
				const stars = new oj.diff().calc({ map: pMap, mods: mods });

				/**
				 * The star difficulty split from the string
				 * @const {string[]}
				 */
				const star = stars.toString().split(' ');

				/**
				 * The emoji used for the star level
				 * @const {Object}
				 */
				const diff = getDiff(star[0]);

				/**
				 * The calculcated pp score of the recent score
				 * @const {string}
				 */
				const pp = oj.ppv2({
					stars: stars,
					combo: combo,
					nmiss: nmiss,
					acc_percent: acc_percent,
				});

				/**
				 * The calculated max pp score of the recent score
				 * @const {string}
				 */
				const maxPP = oj.ppv2({ map: pMap, mods: mods });

				/**
				 * The max combo of the beatmap
				 * @const {string}
				 */
				const max_combo = pMap.max_combo();
				combo = combo || max_combo;

				/**
				 * The pp score split from the string
				 * @const {string}
				 */
				const ppFix = pp.toString().split(' ');

				/**
				 * The max pp score split from the string
				 * @const {string}
				 */
				const maxFix = maxPP.toString().split(' ');

				/**
				 * The pp score parsed to show decimals
				 * @const {number}
				 */
				const ppNum = parseFloat(ppFix[0]);

				/**
				 * The max pp score parsed to show decimals
				 * @const {number}
				 */
				const maxNum = parseFloat(maxFix[0]);

				/**
				 * The time since the recent score was completed
				 * @const {string}
				 */
				const rDate = timeSince(recent.date.getTime());

				if (recent.pp) {
					recent.pp.toFixed(2);
				}

				// Create embed (Need to stlye this better)
				const osuEmbed = new discord.MessageEmbed()
					.setAuthor(recent.user.name || name, `http://a.ppy.sh/${recent.user.id}`, `https://osu.ppy.sh/u/${recent.user.id}`)
					.setColor('#af152a')
					.setTitle(`${recent.beatmap.artist} - ${recent.beatmap.title} [${recent.beatmap.version}]`)
					.setDescription(`${rank} | ${diff} ${star[0]}★ | ${score} | {${recent.counts['300']}/${recent.counts['100']}/${recent.counts['50']}/${recent.counts.miss}}

**${recent.maxCombo}x**/${recent.beatmap.maxCombo}X | **${recent.pp || ppNum.toFixed(2)}pp**/${maxNum.toFixed(2)}PP

${acc}% | ${oj.modbits.string(mods) || 'NoMod'}
					
${verified}`)
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
				console.log(e);
				return message.reply(`No score was found for ${name}!`);
			}
			console.error(e);
			return message.reply('An error has occured!');
		});
	},
};