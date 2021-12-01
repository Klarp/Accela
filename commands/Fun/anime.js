// Copyright (C) 2021 Brody Jagoe

const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { nextPage, prevPage } = require('../../utils');

const anilist_node = require('anilist-node');
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
		let page = 0;

		aniList.search('anime', anime).then(res => {
			const maxPage = res.media.length;
			if (res.media[0]) {
				// Create Buttons
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

				let status;
				let type;
				let episodes;
				let studio;
				let avgScore;
				let genres;
				let startDate;
				let endDate;
				let longDesc;
				let change;

				aniList.media.anime(res.media[0].id).then(aniRes => {
					function truncate(str, n) {
						return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
					}

					if (page === 0) {
						if (aniRes.isAdult) return message.reply('NSFW searches are not allowed!');
					}

					status = getStatus(aniRes.status);
					type = aniRes.format || 'Unknown';
					episodes = aniRes.episodes || 'Unknown';
					if (aniRes.studios[0]) {
						studio = aniRes.studios[0].name || 'Unknown';
					} else {
						studio = 'Unknown';
					}
					avgScore = aniRes.averageScore || '0';
					genres = aniRes.genres.join(' | ');

					startDate = `${aniRes.startDate.year}-${aniRes.startDate.month}-${aniRes.startDate.day}`;
					endDate = `${aniRes.endDate.year}-${aniRes.endDate.month}-${aniRes.endDate.day}`;

					longDesc = 'No description found';

					if (aniRes.description) {
						longDesc = aniRes.description.replace(/<\/?[^>]+(>|$)/g, '').replace(/&lsquo;/g, '').replace(/\n/g, '');
					}

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

**Status** ${status} | **Type** ${type} | **Episodes** ${episodes}
**Studio** ${studio} | **Average Score** ${avgScore}%
**Genres** ${genres}
					
**Start Date** ${startDate}
**End Date** ${endDate}
					
**Description**
${longDesc}`)
						.setFooter(`Page: ${page + 1}/${maxPage}`);

					message.channel.send({ embeds: [aniEmbed], components: [row] }).then(msg => {
						// Collect buttons for 5 minutes
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
							} else {
								button.reply({ content: 'Only the message author can switch pages!', ephemeral: true });
							}
						});
						function pageSwitch() {
							aniList.media.anime(res.media[page].id).then(aniResEdit => {

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
								episodes = aniResEdit.episodes || 'Unknown';

								if (aniResEdit.studios[0]) {
									studio = aniResEdit.studios[0].name || 'Unknown';
								} else {
									studio = 'Unknown';
								}

								avgScore = aniResEdit.averageScore || '0';
								genres = aniResEdit.genres.join(' | ');

								startDate = `${aniResEdit.startDate.year}-${aniResEdit.startDate.month}-${aniResEdit.startDate.day}`;
								endDate = `${aniResEdit.endDate.year}-${aniResEdit.endDate.month}-${aniResEdit.endDate.day}`;

								longDesc = 'No description found';

								if (aniResEdit.description) {
									longDesc = aniResEdit.description.replace(/<\/?[^>]+(>|$)/g, '').replace(/&lsquo;/g, '').replace(/\n/g, '');
								}

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
			
			**Status** ${status} | **Type** ${type} | **Episodes** ${episodes}
			**Studio** ${studio} | **Average Score** ${avgScore}%
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
				message.reply(`No anime was found with name ${anime}`);
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
