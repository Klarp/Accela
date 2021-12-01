// Copyright (C) 2021 Brody Jagoe

const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { nextPage, prevPage } = require('../../utils');

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
		let page = 0;

		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('prev')
					.setLabel('Prev')
					.setStyle('DANGER'),
				new MessageButton()
					.setCustomId('next')
					.setLabel('Next')
					.setStyle('SUCCESS'),
			);

		aniList.search('manga', manga).then(res => {
			const maxPage = res.media.length;
			if (res.media[0]) {

				let status;
				let type;
				let avgScore;
				let volumes;
				let chapters;
				let genres;
				let longDesc;
				let startDate;
				let endDate;
				let change;

				aniList.media.manga(res.media[0].id).then(aniRes => {
					function truncate(str, n) {
						return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
					}

					if (aniRes.isAdult) return message.reply('NSFW searches are not allowed!');

					status = getStatus(aniRes.status);
					type = aniRes.format || 'Unknown';
					avgScore = aniRes.averageScore || '0';
					volumes = aniRes.volumes || 'Unknown';
					chapters = aniRes.chapters || 'Unknown';
					genres = aniRes.genres.join(' | ') || 'Unknown';

					longDesc = 'No description found';

					if (aniRes.description) {
						longDesc = aniRes.description.replace(/<\/?[^>]+(>|$)/g, '').replace(/&lsquo;/g, '').replace(/\n/g, '');
					}


					startDate = `${aniRes.startDate.year}-${aniRes.startDate.month}-${aniRes.startDate.day}`;
					endDate = `${aniRes.endDate.year}-${aniRes.endDate.month}-${aniRes.endDate.day}`;

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
${longDesc}`)
						.setFooter(`Page: ${page + 1}/${maxPage}`);
					message.channel.send({ embeds: [aniEmbed], components: [row] }).then(msg => {
						const collector = msg.createMessageComponentCollector({ componentType: 'BUTTON' });

						collector.on('collect', button => {
							if (button.user.id === message.author.id) {
								if (button.customId === 'next') {
									change = 'next';
									page = nextPage(page, maxPage);
								} else {
									change = 'prev';
									page = prevPage(page, maxPage);
								}

								pageSwitch();
							}
						});
						function pageSwitch() {
							aniList.media.manga(res.media[page].id).then(aniResEdit => {
								if (aniResEdit.isAdult === true) {
									if (change === 'next') {
										page = nextPage(page, maxPage);
										return pageSwitch();
									}
									if (change === 'prev') {
										page = prevPage(page, maxPage);
										return pageSwitch();
									}
								}

								status = getStatus(aniResEdit.status);
								type = aniResEdit.format || 'Unknown';
								avgScore = aniResEdit.averageScore || '0';
								volumes = aniResEdit.volumes || 'Unknown';
								chapters = aniResEdit.chapters || 'Unknown';
								genres = aniResEdit.genres.join(' | ') || 'Unknown';

								longDesc = 'No description found';

								if (aniResEdit.description) {
									longDesc = aniResEdit.description.replace(/<\/?[^>]+(>|$)/g, '').replace(/&lsquo;/g, '').replace(/\n/g, '');
								}


								startDate = `${aniResEdit.startDate.year}-${aniResEdit.startDate.month}-${aniResEdit.startDate.day}`;
								endDate = `${aniResEdit.endDate.year}-${aniResEdit.endDate.month}-${aniResEdit.endDate.day}`;

								if (aniResEdit.startDate.year === null) {
									startDate = 'Unknown';
								}

								if (aniResEdit.startDate.year & !aniResEdit.startDate.day || !aniResEdit.startDate.month) {
									startDate = aniResEdit.startDate.year;
								}

								if (aniResEdit.endDate.year === null) {
									endDate = 'Unknown';
								}

								longDesc = truncate(longDesc, 300);

								const aniEmbedEdit = new MessageEmbed()
									.setAuthor('AniList [UNOFFICIAL]', 'https://anilist.co/img/icons/android-chrome-512x512.png')
									.setColor('BLUE')
									.setTitle(`${aniResEdit.title.romaji} [${aniResEdit.title.native}]`)
									.setURL(aniResEdit.siteUrl)
									.setThumbnail(aniResEdit.coverImage.large)
									.setDescription(`${aniResEdit.title.english ? aniResEdit.title.english : ''}

**Status** ${status} | **Type** ${type} | **Average Score** ${avgScore}%
**Volumes** ${volumes} **Chapters** ${chapters}
**Genres** ${genres}
					
**Start Date** ${startDate}
**End Date** ${endDate}
					
**Description**
${longDesc}`)
									.setFooter(`Page: ${page + 1}/${maxPage}`);

								msg.edit({ embeds: [aniEmbedEdit], components: [row] });
							});
						}
					});
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