const osu = require('node-osu');
const oj = require('ojsama');
const Discord = require('discord.js');
const curl = require('curl');
const { osu_key } = require('../../config.json');
const Sentry = require('../../log');

module.exports = {
	name: 'calc',
	description: 'Calculates pp from map',
	module: 'Osu!',
	args: true,
	usage: '<beatmap> <acc> <combo> <missed> <mods>',
	execute(message, args) {
		// Access the api
		const osuApi = new osu.Api(osu_key);

		/**
		 * Enum for mod values
		 * @enum {string}
		 */
		let mods = oj.modbits.nomod;

		/**
		 * Percentage of score accuracy
		 * @type {number}
		 */

		let acc_percent;

		/**
		 * Score combo
		 * @type {number}
		 */
		let combo;

		/**
		 * Count of misses in the score
		 * @type {number}
		 */
		let miss;

		/**
		 * ID of osu! beatmap
		 * @const {string}
		 */
		const bMap = args[0].split('/').pop();

		// Find user through the api
		osuApi.getBeatmaps({ b: bMap }).then(beatmap => {
			/**
			 * osu! Beatmap
			 * @const {Object}
			 */
			const map = beatmap[0];

			curl.get(`https://osu.ppy.sh/osu/${map.id}`, function(err, response, body) {
				if (args[4]) {
					mods = oj.modbits.from_string(args[4]);
				}

				acc_percent = parseFloat(args[1]);
				combo = parseInt(args[2]);
				miss = parseInt(args[3]);

				/**
				 * Parsed body of beatmap
				 * @const {Object}
				 */
				const parser = new oj.parser().feed(body);

				/**
				 * The parsed beatmap
				 * @const {Object}
				 */
				const pMap = parser.map;

				/**
				 * The star difficulty of the beatmap
				 * @const {string}
				 */
				const stars = new oj.diff().calc({ map: pMap, mods: mods });

				/**
				 * The calculated pp score of the beatmap
				 * @const {string}
				 */
				const pp = oj.ppv2({
					stars: stars,
					combo: combo,
					nmiss: miss,
					acc_percent: acc_percent,
				});

				/**
				 * The calculated max pp score of the beatmap
				 * @const {string}
				 */
				const maxPP = oj.ppv2({
					map: pMap,
				});

				/**
				 * The max combo of the beatmap
				 * @const {number}
				 */
				const max_combo = pMap.max_combo();
				combo = combo || max_combo;

				/**
				 * The pp score split from the string
				 * @const {string}
				 */
				const ppFix = pp.total.toFixed(2);

				/**
				 * The max pp score split from the string
				 * @const {string}
				 */
				const maxppFix = maxPP.total.toFixed(2);

				/**
				 * Time format for score dates
				 * @const {Date}
				 */
				const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' });

				/**
				 * Score approved date formatted
				 * @const {Date}
				 */
				const [{ value: amonth },, { value: aday },, { value: ayear }] = dateTimeFormat.formatToParts(map.approvedDate);

				// Create the embed
				const osuEmbed = new Discord.MessageEmbed()
					.setColor('#af152a')
					.setURL(`https://osu.ppy.sh/b/${map.id}`)
					.setTitle(`${map.artist} - ${map.title} (${map.version})`)
					.setDescription(`Combo: ${combo}x | Missed: ${miss}x
					Mods: ${oj.modbits.string(mods) || 'NoMod'} | Accuracy: ${acc_percent || '100'}%
					
					Total PP: **${ppFix}pp**/${maxppFix}PP`)
					.setFooter(`${map.approvalStatus} on ${amonth} ${aday} ${ayear} | Mapped by: ${map.creator}`);

				message.channel.send({ embed: osuEmbed });
			});
		}).catch(e => {
			Sentry.captureException(e);
			console.error(e);
			return message.reply('No map was found!');
		});
	},
};