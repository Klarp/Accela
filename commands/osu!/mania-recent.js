const osu = require('node-osu');
const discord = require('discord.js');

const { Client } = require('../../index');
const { osu_key } = require('../../config.json');
const { Users, sConfig } = require('../../dbObjects');
const { timeSince, getRank } = require('../../utils');

module.exports = {
	name: 'mania-recent',
	aliases: ['mr', 'maniar', 'maniarecent', 'mrecent', 'mrs'],
	description: 'Gets the recently completed score on mania',
	module: 'Osu!',
	perms: '',
	owner: true,
	usage: '<user>',
	async execute(message, args) {
		// Access the api
		const osuApi = new osu.Api(osu_key, {
			notFoundAsError: true,
			completeScores: true,
			parseNumeric: true,
		});

		/**
		 * The prefix of the server
		 * @type {string}
		 */
		let prefix = '>>';

		/**
		 * Whether the user is in the database
		 * @type {boolean}
		 */
		let findUser;

		/**
		 * The first user mentioned in the message
		 * @type {Object}
		 */
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

		/**
		 * Guild with required emotes
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

		if (menUser) {
			name = menUser.username;
			verified = '';
		}

		// Find the user in the database
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

		// Use arguments if applicable
		if (!menUser && args[0]) {
			name = args[0];
			verified = '';
		}

		if (!menUser && args[1]) {
			name = args.join(' ');
			verified = '';
		}

		if (!menUser && !findUser && !args[0]) {
			message.channel.send(`No link found: use ${prefix}link [osu user] to link your osu! account!`);
		}

		/**
		 * Use either the name or ID of the user
		 * @const {string}
		 */
		const search = name || id;

		// Find user through the api
		osuApi.getUserRecent({ m: 3, u: search }).then(async r => {
			/**
			 * The recent score
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
			 * The time since the recent score was completed
			 * @const {string}
			 */
			const rDate = timeSince(recent.date.getTime());

			/**
			 * The emoji of the rank
			 * @const {Object}
			 */
			const rank = getRank(recent.rank);

			/**
			 * The amount of 300 hits in the recent score
			 * @const {number}
			 */
			const hit300 = recent.counts[300];

			/**
			 * The amount of 100 hits in the recent score
			 * @const {number}
			 */
			const hit100 = recent.counts[100];

			/**
			 * The amount of 50 hits in the recent score
			 * @const {number}
			 */
			const hit50 = recent.counts[50];

			/**
			 * The amount of misses in the recent score
			 * @const {number}
			 */
			const hitmiss = recent.counts.miss;

			// Get the short version of mods (HD, HR etc.)
			const osuEmbed = new discord.MessageEmbed()
				.setAuthor(recent.user.name || name, `http://a.ppy.sh/${recent.user.id}`)
				.setColor('#af152a')
				.setTitle(`${recent.beatmap.artist} - ${recent.beatmap.title} [${recent.beatmap.version}]`)
				.setDescription(`${rank} | ${score} | {${hit300}/${hit100}/${hit50}/${hitmiss}}

**${recent.maxCombo}x** | ${acc}% | PP Coming Soon
				
${verified}`)
				.setURL(`https://osu.ppy.sh/b/${recent.beatmapId}`)
				.setFooter(`Completed ${rDate} • osu!mania`);
			message.channel.send(osuEmbed);
		}).catch(e => {
			if (e.name == 'Error') {
				console.error(e);
				return message.reply(`No recent play was found for ${name}!`);
			}
			console.error(e);
			return message.reply('An error has occured!');
		});
	},
};