// Copyright (C) 2021 Brody Jagoe

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
		const manga = args.join(' ');
		aniList.search('manga', manga).then(res => {
			if (res.media[0]) {
				aniList.media.manga(res.media[0].id).then(aniRes => {
					function truncate(str, n) {
						return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
					}

					if (aniRes.isAdult) return message.reply('NSFW searches are not allowed!');

					let descLong = aniRes.description.replace(/<\/?[^>]+(>|$)/g, '').replace(/&lsquo;/g, '').replace(/\n/g, '');

					const status = getStatus(aniRes.status);

					const type = aniRes.format || 'Unknown';

					const avgScore = aniRes.averageScore || '0';

					const volumes = aniRes.volumes || 'Unknown';

					const chapters = aniRes.chapters || 'Unknown';

					const genres = aniRes.genres.join(' | ') || 'Unknown';

					let startDate = `${aniRes.startDate.year}-${aniRes.startDate.month}-${aniRes.startDate.day}`;

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