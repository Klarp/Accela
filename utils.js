/* eslint-disable no-case-declarations */
const Discord = require('discord.js');
const curl = require('curl');
const oj = require('ojsama');
const osu = require('node-osu');
const { Client } = require('./index.js');
const { osu_key } = require('./config.json');
const { sConfig } = require('./dbObjects.js');

module.exports = {
	checkPerm(user, perm, message) {
		if (message.channel.type === 'dm') return true;
		if (user.hasPermission(perm)) {
			return true;
		} else {
			return false;
		}
	},

	getDiff(star) {
		const emoji = Client.emojis.cache;
		let diff;

		if (star < 2) {
			// Easy
			diff = emoji.get('738125708802654322');
		} else if (star < 2.7) {
			// Normal
			diff = emoji.get('738125709180010557');
		} else if (star < 4) {
			// Hard
			diff = emoji.get('738125709113032716');
		} else if (star < 5.3) {
			// Insane
			diff = emoji.get('738125709129547947');
		} else if (star < 6.5) {
			// Expert
			diff = emoji.get('738125708810780744');
		} else {
			// Expert+
			diff = emoji.get('738125708781682719');
		}

		return diff;
	},

	getRank(rank) {
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

	async getRankRole(member, rank, mode) {
		let role;

		if (mode === 0) {
			if (rank < 100 && rank !== 0) {
				// 1 - 99
				role = '754085973003993119';
			} else if (rank < 500) {
				// 100 - 499
				role = '754086188025118770';
			} else if (rank < 10000) {
				// 500 - 9999
				role = '754086290785304627';
			} else if (rank < 50000) {
				// 10000 - 49999
				role = '754086299681685696';
			} else if (rank < 100000) {
				// 50000 - 99999
				role = '754086107456471062';
			} else {
				// 100000+
				role = '754089529287245855';
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
			} else if (rank < 10000) {
				// 500 - 9999
				role = '754087814106448012';
			} else if (rank < 50000) {
				// 10000 - 49999
				role = '754087911066173460';
			} else if (rank < 100000) {
				// 50000 - 99999
				role = '754087679003721790';
			} else {
				// 100000+
				role = '754089750717136906';
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
			} else if (rank < 10000) {
				// 500 - 9999
				role = '754088281674743858';
			} else if (rank < 50000) {
				// 10000 - 49999
				role = '754088358916915241';
			} else if (rank < 100000) {
				// 50000 - 99999
				role = '754088053101953034';
			} else {
				// 100000+
				role = '754089875157942435';
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
			} else if (rank < 10000) {
				// 500 - 9999
				role = '754086852524507246';
			} else if (rank < 50000) {
				// 10000 - 49999
				role = '754086905825460265';
			} else if (rank < 100000) {
				// 50000 - 99999
				role = '754086720638681109';
			} else {
				// 100000+
				role = '754089662242357289';
			}
		}

		const roleList = [
			'754085973003993119',
			'754086188025118770',
			'754086290785304627',
			'754086299681685696',
			'754086107456471062',
			'754089529287245855',
			'754086656889585714',
			'754086784484376596',
			'754086852524507246',
			'754086905825460265',
			'754086720638681109',
			'754089662242357289',
			'754087013904547930',
			'754087748209475595',
			'754087814106448012',
			'754087911066173460',
			'754087679003721790',
			'754089750717136906',
			'754087989717762080',
			'754088203534729276',
			'754088281674743858',
			'754088358916915241',
			'754088053101953034',
			'754089875157942435',
		];

		roleList.forEach(r => {
			if (member.roles.cache.get(r)) {
				const rankRole = member.roles.cache.get(r).id;
				if (rankRole === role) return;
				member.roles.remove(r);
			}
		});
		member.roles.add(role);
	},

	getShortMods(mods) {
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


		const modsOnly = mods.filter(mod =>
			osu_mods.includes(mod));

		const shortMods = modsOnly.map(mod => mod_sh[mod]).join('');

		return shortMods;
	},

	mapDetect(msg) {
		const osuApi = new osu.Api(osu_key);

		const bMap = msg.content.split('/').pop();
		const client = msg.client;

		osuApi.getBeatmaps({ b: bMap }).then(beatmap => {
			const map = beatmap[0];
			osuApi.getUser({ u: map.creator }).then(u => {
				curl.get(`https://osu.ppy.sh/osu/${map.id}`, function(err, response, body) {

					const parser = new oj.parser().feed(body);
					const pMap = parser.map;
					const maxPP = oj.ppv2({ map: pMap }).toString();
					const ppFix = maxPP.split(' ');
					const stars = new oj.diff().calc({ map: pMap });
					const star = stars.toString().split(' ');
					const s = star[0];

					const emoji = client.emojis.cache;

					let diff;

					if (s < 2) {
						// Easy
						diff = emoji.get('738125708802654322');
					} else if (s < 2.7) {
						// Normal
						diff = emoji.get('738125709180010557');
					} else if (s < 4) {
						// Hard
						diff = emoji.get('738125709113032716');
					} else if (s < 5.3) {
						// Insane
						diff = emoji.get('738125709129547947');
					} else if (s < 6.5) {
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

	timeSince(date) {
		const seconds = Math.floor((new Date() - date) / 1000);

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

	sleep(milliseconds) {
		const date = Date.now();
		let currentDate = null;
		do {
			currentDate = Date.now();
		} while (currentDate - date < milliseconds);
	},
};