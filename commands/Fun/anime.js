const anilist_node = require('anilist-node');
const Discord = require('discord.js');
const aniList = new anilist_node();

module.exports = {
	name: 'anime',
	aliases: 'ani',
	description: 'Displays information about requested anime',
	module: 'Fun',
	cooldown: 5,
	args: true,
	usage: '[anime]',
	execute(message, args) {
		/**
		 * Anime name
		 * @const {string}
		 */
		const anime = args.join(' ');

		aniList.search('anime', anime).then(res => {
			aniList.media.anime(res.media[0].id).then(aniRes => {

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
				 * Status of the anime
				 * @const {string}
				 */
				const status = getStatus(aniRes.status);

				/**
				 * Type of anime
				 * @const {string}
				 */
				const type = aniRes.format || 'Unknown';

				/**
				 * Number of episodes
				 * @const {string}
				 */
				const episodes = aniRes.episodes || 'Unknown';

				/**
				 * Studio that created the anime
				 * @const {string}
				 */
				const studio = aniRes.studios[0].name || 'Unknown';

				/**
				 * Average score of anime
				 * @const {string}
				 */
				const avgScore = aniRes.averageScore || '0';

				/**
				 * Genres of the anime
				 * @const {string}
				 */
				const genres = aniRes.genres.join(' | ');

				/**
				 * Start date of the anime
				 * @type {string}
				 */
				let startDate = `${aniRes.startDate.year}-${aniRes.startDate.month}-${aniRes.startDate.day}`;

				/**
				 * End date of the anime
				 * @type {string}
				 */
				let endDate = `${aniRes.endDate.year}-${aniRes.endDate.month}-${aniRes.endDate.day}`;

				/**
				 * Long description of the anime
				 * @type {string}
				 */
				let longDesc = aniRes.description.replace(/<\/?[^>]+(>|$)/g, '').replace(/&lsquo;/g, '').replace(/\n/g, '');

				if (aniRes.startDate.year === null) {
					startDate = 'Unknown';
				}

				if (aniRes.endDate.year === null) {
					endDate = 'Unknown';
				}

				longDesc = truncate(longDesc, 300);

				const aniEmbed = new Discord.MessageEmbed()
					.setAuthor('AniList [UNOFFICIAL]', 'https://anilist.co/img/icons/android-chrome-512x512.png')
					.setColor('BLUE')
					.setTitle(`${aniRes.title.romaji} [${aniRes.title.native}]`)
					.setURL(aniRes.siteUrl)
					.setThumbnail(aniRes.coverImage.large)
					.setDescription(`**Status** ${status} | **Type** ${type} | **Episodes** ${episodes}
**Studio** ${studio} | **Average Score** ${avgScore}%
**Genres** ${genres}
					
**Start Date** ${startDate}
**End Date** ${endDate}
					
**Description**
${longDesc}`);
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