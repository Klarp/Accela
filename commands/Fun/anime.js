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
		const anime = args.join(' ');

		aniList.search('anime', anime).then(res => {
			aniList.media.anime(res.media[0].id).then(aniRes => {
				function truncate(str, n) {
					return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
				}

				console.log(aniRes.status);

				if (aniRes.isAdult) return message.reply('NSFW searches are not allowed!');

				const status = getStatus(aniRes.status);
				const type = aniRes.format || 'Unknown';
				const episodes = aniRes.episodes || 'Unknown';
				const studio = aniRes.studios[0].name || 'Unknown';
				const avgScore = aniRes.averageScore || '0';
				const genres = aniRes.genres.join(' | ');
				let startDate = `${aniRes.startDate.year}-${aniRes.startDate.month}-${aniRes.startDate.day}`;
				let endDate = `${aniRes.endDate.year}-${aniRes.endDate.month}-${aniRes.endDate.day}`;
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