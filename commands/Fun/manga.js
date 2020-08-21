const jikan = require('jikanjs');
const Discord = require('discord.js');

module.exports = {
	name: 'manga',
	description: 'Displays information about requested manga',
	module: 'Fun',
	cooldown: 5,
	args: true,
	usage: '[name] or [name] -2',
	execute(message, args) {
		const manga = args.join(' ');
		if (manga.length < 3) return message.reply('The given query must be of minimum 3 letters');

		jikan.search('manga', manga).then((res) => {
			const mangaResult = res.results[0];

			let ed;

			if (mangaResult.enddate) {
				ed = mangaResult.end_date.split('T')[0];
			} else {
				ed = 'Unknown';
			}

			const sd = mangaResult.start_date.split('T')[0];

			if (manga.includes('-')) {
				const numArg = manga.split('-');
				const num = numArg[1];
				if (isNaN(num)) return;
				console.log(num);
				const newResult = res.results[num];
				console.log(newResult);

				const newSd = newResult.start_date.split('T')[0];
				const newEd = newResult.end_date.split('T')[0];

				let status;

				if(newResult.publishing) {
					status = 'Publishing';
				} else {
					status = 'Completed';
				}

				const aniEmbed = new Discord.MessageEmbed()
					.setAuthor('MAL Search', 'https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png')
					.setColor('BLUE')
					.setTitle(newResult.title)
					.setThumbnail(newResult.image_url, 500, 500)
					.setURL(newResult.url)
					.setDescription(`**Status** ${status} | **Type** ${newResult.type} | **Score** ${newResult.score}
**Volumes** ${newResult.episodes || 'Unknown'} | **Chapters** ${newResult.chapters || 'Unknown'}

**Start Date** ${newSd}
**End Date** ${newEd}
`)
					.setFooter('Click on the title for full synopsis');
				return message.channel.send(aniEmbed);
			}

			let status;


			if(mangaResult.publishing) {
				status = 'Publishing';
			} else {
				status = 'Completed';
			}

			const aniEmbed = new Discord.MessageEmbed()
				.setAuthor('MAL Search', 'https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png')
				.setColor('BLUE')
				.setTitle(mangaResult.title)
				.setThumbnail(mangaResult.image_url, 500, 500)
				.setURL(mangaResult.url)
				.setDescription(`**Status** ${status} | **Type** ${mangaResult.type} | **Score** ${mangaResult.score}
**Volumes** ${mangaResult.volumes || 'Unknown'} | **Chapters** ${mangaResult.chapters || 'Unknown'}

**Start Date** ${sd}
**End Date** ${ed}
`)
				.setFooter('Click on the title for full synopsis [You can use -2 to search for the next result]');
			message.channel.send(aniEmbed);
		}).catch((e) => {
			if (e.name === 'null') {
				console.log('ping');
			}
			console.error(e);
		});
	},
};