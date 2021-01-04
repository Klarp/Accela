const anilist_node = require('anilist-node');
const Discord = require('discord.js');
const aniList = new anilist_node();

module.exports = {
	name: 'manga',
	description: 'Displays information about requested manga',
	module: 'Fun',
	cooldown: 5,
	args: true,
	usage: '[manga]',
	execute(message, args) {
		/**
		 * The manga name
		 * @const {string}
		 */
		const manga = args.join(' ');
		aniList.search('manga', manga).then(res => {
			aniList.media.manga(res.media[0].id).then(aniRes => {

				/**
				 * Adds truncate to end of string if it passes character limit
				 * @param {string} str The string to truncate
				 * @param {number} n The number of characters before truncate
				 */
				function truncate(str, n) {
					return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
				}

				if (aniRes.isAdult) return message.reply('NSFW searches are not allowed!');

				/**
				 * Long description of the manga
				 * @type {string}
				 */
				let descLong = aniRes.description.replace(/<\/?[^>]+(>|$)/g, '').replace(/&lsquo;/g, '').replace(/\n/g, '');

				/**
				 * Status of the manga
				 * @const {string}
				 */
				const status = getStatus(aniRes.status);

				/**
				 * Type of manga
				 * @const {string}
				 */
				const type = aniRes.format || 'Unknown';

				/**
				 * Average score of the manga
				 * @const {string}
				 */
				const avgScore = aniRes.averageScore || '0';

				/**
				 * Volumes in the manga
				 * @const {string}
				 */
				const volumes = aniRes.volumes || 'Unknown';

				/**
				 * Chapters in the manga
				 * @const {string}
				 */
				const chapters = aniRes.chapters || 'Unknown';

				/**
				 * Genres of the manga
				 * @const {string}
				 */
				const genres = aniRes.genres.join(' | ') || 'Unknown';

				/**
				 * Start date of the manga
				 * @type {string}
				 */
				let startDate = `${aniRes.startDate.year}-${aniRes.startDate.month}-${aniRes.startDate.day}`;

				/**
				 * End date of the manga
				 * @type {string}
				 */
				let endDate = `${aniRes.endDate.year}-${aniRes.endDate.month}-${aniRes.endDate.day}`;

				if (aniRes.startDate.year === null) {
					startDate = 'Unknown';
				}

				if (aniRes.endDate.year === null) {
					endDate = 'Unknown';
				}

				descLong = truncate(descLong, 300);

				const aniEmbed = new Discord.MessageEmbed()
					.setAuthor('AniList [UNOFFICIAL]', 'https://anilist.co/img/icons/android-chrome-512x512.png')
					.setColor('BLUE')
					.setTitle(`${aniRes.title.romaji} [${aniRes.title.native}]`)
					.setURL(aniRes.siteUrl)
					.setThumbnail(aniRes.coverImage.large)
					.setDescription(`**Status** ${status} | **Type** ${type} | **Average Score** ${avgScore}%
**Volumes** ${volumes} **Chapters** ${chapters}
**Genres** ${genres}
					
**Start Date** ${startDate}
**End Date** ${endDate}
					
**Description**
${descLong}`);
				message.channel.send(aniEmbed);
			});
		});

		/**
		 * Returns status as cleaner strings
		 * @param {string} status Default status
		 * @returns {string}
		 */
		function getStatus(status) {
			const statusRaw = {
				'FINISHED': 'Finished',
				'RELEASING': 'Ongoing',
				'NOT_YET_RELEASED': 'Not Released',
				'CANCELLED': 'Cancelled',
				'UNKNOWN': 'Unknown',
			};

			return statusRaw[status] || statusRaw['UNKNOWN'];
		}
	},
};