// Copyright (C) 2021 Brody Jagoe

const { MessageEmbed } = require('discord.js');

const anilist_node = require('anilist-node');
const aniList = new anilist_node();

module.exports = {
	name: 'manga',
	description: 'Displays information about requested manga',
	module: 'Fun',
	cooldown: 5,
	args: true,
	usage: '[manga]',
	execute(message, args) {
		const manga = args.join(' ');
		aniList.search('manga', manga).then(res => {
			if (res.media[0]) {
				aniList.media.manga(res.media[0].id).then(aniRes => {
					function truncate(str, n) {
						return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
					}

					if (aniRes.isAdult) return message.reply('NSFW searches are not allowed!');

					const status = getStatus(aniRes.status);
					const type = aniRes.format || 'Unknown';
					const avgScore = aniRes.averageScore || '0';
					const volumes = aniRes.volumes || 'Unknown';
					const chapters = aniRes.chapters || 'Unknown';
					const genres = aniRes.genres.join(' | ') || 'Unknown';

					let longDesc = 'No description found';

					if (aniRes.description) {
						longDesc = aniRes.description.replace(/<\/?[^>]+(>|$)/g, '').replace(/&lsquo;/g, '').replace(/\n/g, '');
					}


					let startDate = `${aniRes.startDate.year}-${aniRes.startDate.month}-${aniRes.startDate.day}`;
					let endDate = `${aniRes.endDate.year}-${aniRes.endDate.month}-${aniRes.endDate.day}`;

					if (aniRes.startDate.year === null) {
						startDate = 'Unknown';
					}

					if (aniRes.startDate.year & !aniRes.startDate.day || !aniRes.startDate.month) {
						startDate = aniRes.startDate.year;
					}

					if (aniRes.endDate.year === null) {
						endDate = 'Unknown';
					}

					longDesc = truncate(longDesc, 300);

					const aniEmbed = new MessageEmbed()
						.setAuthor('AniList [UNOFFICIAL]', 'https://anilist.co/img/icons/android-chrome-512x512.png')
						.setColor('BLUE')
						.setTitle(`${aniRes.title.romaji} [${aniRes.title.native}]`)
						.setURL(aniRes.siteUrl)
						.setThumbnail(aniRes.coverImage.large)
						.setDescription(`${aniRes.title.english ? aniRes.title.english : ''}

**Status** ${status} | **Type** ${type} | **Average Score** ${avgScore}%
**Volumes** ${volumes} **Chapters** ${chapters}
**Genres** ${genres}
					
**Start Date** ${startDate}
**End Date** ${endDate}
					
**Description**
${longDesc}`);
					message.channel.send({ embeds: [aniEmbed] });
				});
			} else {
				message.reply(`No manga was found with name ${manga}`);
			}
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