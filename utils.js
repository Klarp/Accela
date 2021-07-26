/* eslint-disable no-case-declarations */
const Discord = require('discord.js');
const curl = require('curl');
const oj = require('ojsama');
const osu = require('node-osu');
const { Client } = require('./index.js');
const { osu_key } = require('./config.json');
const { sConfig } = require('./dbObjects.js');

module.exports = {
	/**
	 * Checks user permissions
	 * @param {Object} user User to check
	 * @param {string} perm Permission to check
	 * @param {Object} message Discord Message
	 * @returns {boolean}
	 */
	checkPerm(user, perm, message) {
		if (message.channel.type === 'dm') return true;
		if (user.hasPermission(perm)) {
			return true;
		} else {
			return false;
		}
	},

	/**
	 * Gets emoji that matches star level
	 * @param {string} star Star level of map
	 * @returns {Object} Discord Emoji
	 */
	getDiff(star) {
		/** @const {Object} emoji Discord Emoji */
		const emoji = Client.emojis.cache;

		let diff;

		if (star < '2') {
			// Easy
			diff = emoji.get('738125708802654322');
		} else if (star < '2.7') {
			// Normal
			diff = emoji.get('738125709180010557');
		} else if (star < '4') {
			// Hard
			diff = emoji.get('738125709113032716');
		} else if (star < '5.3') {
			// Insane
			diff = emoji.get('738125709129547947');
		} else if (star < '6.5') {
			// Expert
			diff = emoji.get('738125708810780744');
		} else {
			// Expert+
			diff = emoji.get('738125708781682719');
		}

		return diff;
	},

	/**
	 * Gets emoji that matches rank
	 * @param {string} rank Rank on osu! score
	 * @returns {Object} Discord Emoji
	 */
	getRank(rank) {
		/** @const {Object} emoji Discord Emoji */
		const emoji = Client.emojis.cache;
		let e;

		switch (rank) {
		case 'XH':
			e = emoji.get('734198887836942357');
			break;
		case 'X':
			e = emoji.get('734198888277213205');
			break;
		case 'SH':
			e = emoji.get('734198887677427784');
			break;
		case 'S':
			e = emoji.get('734198888025555115');
			break;
		case 'A':
			e = emoji.get('734198887568506941');
			break;
		case 'B':
			e = emoji.get('734198887941668995');
			break;
		case 'C':
			e = emoji.get('734198887820034129');
			break;
		case 'D':
			e = emoji.get('734198887858044998');
			break;
		default:
			e = emoji.get('734450801346347018');
			break;
		}

		return e;
	},

	/**
	 * Sets the rank for member
	 * @param {Object} member Discord Member
	 * @param {number} rank osu! rank
	 * @param {number} mode osu! mode
	 */
	async getRankRole(member, rank, mode) {
		let role;
		if (mode === 0) {
			if (rank < 100 && rank !== 0) {
				// 1 - 99
				role = '754085973003993119';
			} else if (rank < 500) {
				// 100 - 499
				role = '754086188025118770';
			} else if (rank < 1000) {
				// 500 - 999
				role = '754086290785304627';
			} else if (rank < 5000) {
				// 1000 - 4999
				role = '754086299681685696';
			} else if (rank < 10000) {
				// 5000 - 9999
				role = '869294796404035675';
			} else if (rank < 25000) {
				// 10000 - 24999
				role = '869295190601531462';
			} else if (rank < 50000) {
				// 25000 - 49999
				role = '869295555489202217';
			} else if (rank < 100000) {
				// 50000 - 99999
				role = '754086107456471062';
			} else if (rank < 500000) {
				// 100000 - 499999
				role = '754089529287245855';
			} else {
				// 500000+
				role = '869295874306605066';
			}
		}

		// Taiko
		if (mode === 1) {
			if (rank < 100 && rank !== 0) {
				// 1 - 99
				role = '754087013904547930';
			} else if (rank < 500) {
				// 100 - 499
				role = '754087748209475595';
			} else if (rank < 1000) {
				// 500 - 999
				role = '754087814106448012';
			} else if (rank < 5000) {
				// 1000 - 4999
				role = '754087911066173460';
			} else if (rank < 10000) {
				// 5000 - 9999
				role = '754087679003721790';
			} else if (rank < 25000) {
				// 10000 - 24999
				role = '754089750717136906';
			} else if (rank < 50000) {
				// 25000 - 49999
				role = '869297047050784870';
			} else if (rank < 100000) {
				// 50000 - 99999
				role = '869297101086011483';
			} else if (rank < 500000) {
				// 100000 - 499999
				role = '869297132958531584';
			} else {
				// 500000+
				role = '869297154253017108';
			}
		}

		// Catch the Beat
		if (mode === 2) {
			if (rank < 100 && rank !== 0) {
				// 1 - 99
				role = '754087989717762080';
			} else if (rank < 500) {
				// 100 - 499
				role = '754088203534729276';
			} else if (rank < 1000) {
				// 500 - 999
				role = '754088281674743858';
			} else if (rank < 5000) {
				// 1000 - 4999
				role = '754088358916915241';
			} else if (rank < 10000) {
				// 5000 - 9999
				role = '754088053101953034';
			} else if (rank < 25000) {
				// 10000 - 24999
				role = '754089875157942435';
			} else if (rank < 50000) {
				// 25000 - 49999
				role = '869299174556987403';
			} else if (rank < 100000) {
				// 50000 - 99999
				role = '869299210883850280';
			} else if (rank < 500000) {
				// 100000 - 499999
				role = '869299235592478770';
			} else {
				// 500000+
				role = '869299254076792892';
			}
		}

		// Mania
		if (mode === 3) {
			if (rank < 100 && rank !== 0) {
				// 1 - 99
				role = '754086656889585714';
			} else if (rank < 500) {
				// 100 - 499
				role = '754086784484376596';
			} else if (rank < 1000) {
				// 500 - 999
				role = '754086852524507246';
			} else if (rank < 5000) {
				// 1000 - 4999
				role = '754086905825460265';
			} else if (rank < 10000) {
				// 5000 - 9999
				role = '754086720638681109';
			} else if (rank < 25000) {
				// 10000 - 24999
				role = '754089662242357289';
			} else if (rank < 50000) {
				// 25000 - 49999
				role = '869296510909689896';
			} else if (rank < 100000) {
				// 50000 - 99999
				role = '869296562881302528';
			} else if (rank < 500000) {
				// 100000 - 499999
				role = '869296602869801070';
			} else {
				// 500000+
				role = '869296657882300446';
			}
		}

		/** @const {string[]} roleList List of osu! Game discord roles */
		const roleList = [
			'754085973003993119',
			'754086188025118770',
			'754086290785304627',
			'754086299681685696',
			'869294796404035675',
			'869295190601531462',
			'869295555489202217',
			'754086107456471062',
			'754089529287245855',
			'869295874306605066',
			'754086656889585714',
			'754086784484376596',
			'754086852524507246',
			'754086905825460265',
			'754086720638681109',
			'754089662242357289',
			'869296510909689896',
			'869296562881302528',
			'869296602869801070',
			'869296657882300446',
			'754087013904547930',
			'754087748209475595',
			'754087814106448012',
			'754087911066173460',
			'754087679003721790',
			'754089750717136906',
			'869297047050784870',
			'869297101086011483',
			'869297132958531584',
			'869297154253017108',
			'754087989717762080',
			'754088203534729276',
			'754088281674743858',
			'754088358916915241',
			'754088053101953034',
			'754089875157942435',
			'869299174556987403',
			'869299210883850280',
			'869299235592478770',
			'869299254076792892',
		];

		roleList.forEach(r => {
			if (member.roles.cache.get(r)) {
				/** @const {number} rankRole Rank role ID */
				const rankRole = member.roles.cache.get(r).id;
				if (rankRole === role) return;
				member.roles.remove(r);
			}
		});
		member.roles.add(role);
	},

	/**
	 * Returns short mods
	 * @param {string[]} mods
	 * @returns {string} Short mods
	 */
	getShortMods(mods) {
		/** @const {string[]} osu_mods osu! long form mods */
		const osu_mods = [
			'None',
			'NoFail',
			'Easy',
			'Hidden',
			'HardRock',
			'SuddenDeath',
			'DoubleTime',
			'HalfTime',
			'Nightcore',
			'Flashlight',
			'Autoplay',
			'SpunOut',
		];

		/** @const {Object} mod_sh osu! mod list */
		const mod_sh = {
			'None': 'NoMod',
			'NoFail': 'NF',
			'Easy': 'EZ',
			'Hidden': 'HD',
			'HardRock': 'HR',
			'SuddenDeath': 'SD',
			'DoubleTime': 'DT',
			'HalfTime': 'HT',
			'Nightcore': 'NC',
			'Flashlight': 'FL',
			'Autoplay': 'Auto',
			'SpunOut': 'SO',
		};

		/** @const {Object} modsOnly Filters mods */
		const modsOnly = mods.filter(mod =>
			osu_mods.includes(mod));

		/** @const {string} shortMods Short form of mods */
		const shortMods = modsOnly.map(mod => mod_sh[mod]).join('');

		return shortMods;
	},

	/**
	 * Detects map in message
	 * @param {Object} msg Message
	 * @returns {Object} Discord Embed
	 */
	mapDetect(msg) {
		const osuApi = new osu.Api(osu_key);

		/** @const {string} bMap The beatmap id from link */
		const bMap = msg.content.split('/').pop();
		/** @const {Object} client The bot client */
		const client = msg.client;

		osuApi.getBeatmaps({ b: bMap }).then(beatmap => {
			/** @const {Object} map osu! beatmap */
			const map = beatmap[0];
			osuApi.getUser({ u: map.creator }).then(u => {
				curl.get(`https://osu.ppy.sh/osu/${map.id}`, function(err, response, body) {
					/** @const {Object} parser Parsed body of beatmap */
					const parser = new oj.parser().feed(body);

					/** @const {Object} pMap Parsed osu! beatmap */
					const pMap = parser.map;

					/** @const {string} maxPP Max pp gainable on beatmap */
					const maxPP = oj.ppv2({ map: pMap }).toString();

					/** @const {string} ppFix Splits maxPP */
					const ppFix = maxPP.split(' ');

					/** @const {string} stars Calculated star level of beatmap*/
					const stars = new oj.diff().calc({ map: pMap });

					/** @const {string[]} star Star level of string split */
					const star = stars.toString().split(' ');

					/** @const {string} s Isolated star level of star */
					const s = star[0];

					/** @const {Object} emoji Discord Emoji */
					const emoji = client.emojis.cache;

					let diff;

					if (s < '2') {
						// Easy
						diff = emoji.get('738125708802654322');
					} else if (s < '2.7') {
						// Normal
						diff = emoji.get('738125709180010557');
					} else if (s < '4') {
						// Hard
						diff = emoji.get('738125709113032716');
					} else if (s < '5.3') {
						// Insane
						diff = emoji.get('738125709129547947');
					} else if (s < '6.5') {
						// Expert
						diff = emoji.get('738125708810780744');
					} else {
						// Expert+
						diff = emoji.get('738125708781682719');
					}

					const lenMinutes = Math.floor(map.length.total / 60);
					const lenSeconds = map.length.total - lenMinutes * 60;
					const drainMinutes = Math.floor(map.length.drain / 60);
					const drainSeconds = map.length.drain - drainMinutes * 60;

					const adate = map.approvedDate;
					const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' });
					const [{ value: amonth },, { value: aday },, { value: ayear }] = dateTimeFormat.formatToParts(adate);
					const udate = map.lastUpdate;
					const [{ value: umonth },, { value: uday },, { value: uyear }] = dateTimeFormat.formatToParts(udate);

					// Create the embed
					const osuEmbed = new Discord.MessageEmbed()
						.setColor('0xff69b4')
						.setAuthor(map.creator, `http://a.ppy.sh/${u.id}`)
						.setTitle(`${map.artist} - ${map.title} (${map.version})`)
						.setThumbnail(`https://b.ppy.sh/thumb/${map.beatmapSetId}l.jpg`)
						.setURL(`https://osu.ppy.sh/b/${map.id}`)
						.setDescription(`${diff} ${star[0]}★ | Length: ${lenMinutes}:${lenSeconds} (${drainMinutes}:${drainSeconds})
BPM: ${map.bpm} | Combo: ${map.maxCombo}x | Max PP: ${ppFix[0]}pp
Circles: ${map.objects.normal} | Sliders: ${map.objects.slider} | Spinners: ${map.objects.spinner}`)
						.setFooter(`${map.approvalStatus} on ${aday}-${amonth}-${ayear} | Last Updated: ${uday}-${umonth}-${uyear}`);

					msg.channel.send({ embed: osuEmbed });
				});
			}).catch(e => {
				console.error(e);
			});
		}).catch(e => {
			console.error(e);
			return msg.reply('No map was found!');
		});
	},

	/**
	 * Returns embed that logs mod actions
	 * @param {Object} mod Moderator
	 * @param {Object} member Target
	 * @param {string} action Moderator action
	 * @param {string} reason Reason for action
	 * @param {number} length Length of action
	 * @returns {promise} Discord Embed
	 */
	async modAction(mod, member, action, reason, length) {
		const serverConfig = await sConfig.findOne({ where: { guild_id: member.guild.id } });
		const modLog = serverConfig.get('mod_logging');
		const modChannel = serverConfig.get('mod_channel');
		const modC = member.guild.channels.cache.get(modChannel);

		if (!modLog) return;

		if (modC) {
			if (!reason) reason = 'No Reason Given';

			switch(action) {
			case 'Kick':
				const kickEmbed = new Discord.MessageEmbed()
					.setAuthor(`${mod.tag} (${mod.id})`, mod.displayAvatarURL())
					.setDescription(`**Action**: Kick
**User**: ${member.user.tag} (${member.user.id})
**Reason**: ${reason}`)
					.setTimestamp();
				modC.send({ embed: kickEmbed });
				break;
			case 'Ban':
				const banEmbed = new Discord.MessageEmbed()
					.setAuthor(`${mod.tag} (${mod.id})`, mod.displayAvatarURL())
					.setDescription(`**Action**: ${action}
**User**: ${member.user.tag} (${member.user.id})
**Reason**: ${reason}`)
					.setTimestamp();
				modC.send({ embed: banEmbed });
				break;
			case 'SoftBan':
				const softBanEmbed = new Discord.MessageEmbed()
					.setAuthor(`${mod.tag} (${mod.id})`, mod.displayAvatarURL())
					.setDescription(`**Action**: ${action}
**User**: ${member.user.tag} (${member.user.id})
**Reason**: ${reason}`)
					.setTimestamp();
				modC.send({ embed: softBanEmbed });
				break;
			case 'Mute':
				const muteEmbed = new Discord.MessageEmbed()
					.setAuthor(`${mod.tag} (${mod.id})`, mod.displayAvatarURL())
					.setDescription(`**Action**: ${action}
**User**: ${member.user.tag} (${member.user.id})
**Reason**: ${reason}`)
					.setTimestamp();
				modC.send({ embed: muteEmbed });
				break;
			case 'TempMute':
				const tempMuteEmbed = new Discord.MessageEmbed()
					.setAuthor(`${mod.tag} (${mod.id})`, mod.displayAvatarURL())
					.setDescription(`**Action**: ${action}
**User**: ${member.user.tag} (${member.user.id})
**Length**: ${length}
**Reason**: ${reason}`)
					.setTimestamp();
				modC.send({ embed: tempMuteEmbed });
				break;
			case 'Unmute':
				const unmuteEmbed = new Discord.MessageEmbed()
					.setAuthor(`${mod.tag} (${mod.id})`, mod.displayAvatarURL())
					.setDescription(`**Action**: ${action}
**User**: ${member.user.tag} (${member.user.id})
**Reason**: ${reason}`)
					.setTimestamp();
				modC.send({ embed: unmuteEmbed });
				break;
			default:
				console.log('[ERROR] Couldn\'t find moderator action.');
			}
		}
	},

	/**
	 * Returns the time since the date
	 * @param {number} date
	 * @returns {string} The time since the date
	 */
	timeSince(date) {
		/** @const {number} seconds Seconds since date has passed */
		const seconds = Math.floor((Date.now() - date) / 1000);

		let interval = Math.floor(seconds / 31536000);

		if (interval > 1) {
			return interval + ' years ago';
		}
		interval = Math.floor(seconds / 2592000);
		if (interval > 1) {
			return interval + ' months ago';
		}
		interval = Math.floor(seconds / 86400);
		if (interval > 1) {
			return interval + ' days ago';
		}
		interval = Math.floor(seconds / 3600);
		if (interval > 1) {
			return interval + ' hours ago';
		}
		interval = Math.floor(seconds / 60);
		if (interval > 1) {
			return interval + ' minutes ago';
		}
		return Math.floor(seconds) + ' seconds ago';
	},

	/**
	 * Sleep function to stop script
	 * @param {number} milliseconds Number of milliseconds to sleep
	 */
	sleep(milliseconds) {
		const date = Date.now();
		let currentDate = null;
		do {
			currentDate = Date.now();
		} while (currentDate - date < milliseconds);
	},
};