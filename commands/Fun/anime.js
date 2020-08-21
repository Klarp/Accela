const jikan = require('jikanjs');
const Discord = require('discord.js');

module.exports = {
	name: 'anime',
	aliases: 'ani',
	description: 'Displays information about requested anime',
	module: 'Fun',
	cooldown: 5,
	args: true,
	usage: '[name] or [name] -2',
	execute(message, args) {
		const anime = args.join(' ');
		console.log(anime.length);
		if (anime.length < 3) return message.reply('The given query must be of minimum 3 letters');

		jikan.search('anime', anime).then((res) => {
			const aniResult = res.results[0];

			if (aniResult.rated === 'Rx') return message.reply('Requested anime was NSFW and has been denied');
			if (!aniResult.rated) return message.reply('An error has occured and we cannot determine if the anime is NSFW. Please try again later.');

			const sd = aniResult.start_date.split('T')[0];
			const ed = aniResult.end_date.split('T')[0];

			if (anime.includes('-')) {
				const numArg = anime.split('-');
				const num = numArg[1];
				if (isNaN(num)) return;
				console.log(num);
				const newResult = res.results[num];

				if (newResult.rated === 'Rx') return message.reply('Requested anime was NSFW and has been denied');
				if (!aniResult.rated) return message.reply('An error has occured and we cannot determine if the anime is NSFW. Please try again later.');

				const newSd = newResult.start_date.split('T')[0];
				const newEd = newResult.end_date.split('T')[0];

				const aniEmbed = new Discord.MessageEmbed()
					.setAuthor('MAL Search', 'https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png')
					.setColor('BLUE')
					.setTitle(newResult.title)
					.setThumbnail(newResult.image_url, 500, 500)
					.setURL(newResult.url)
					.setDescription(`**Airing** ${newResult.airing} 
**Episodes** ${newResult.episodes || 'Unknown'} **Type** ${newResult.type}
**Score** ${newResult.score} **Rating** ${newResult.rated}

**Start Date** ${newSd}
**End Date** ${newEd}
`)
					.setFooter('Click on the title for full synopsis');
				return message.channel.send(aniEmbed);
			}

			const aniEmbed = new Discord.MessageEmbed()
				.setAuthor('MAL Search', 'https://cdn.myanimelist.net/img/sp/icon/apple-touch-icon-256.png')
				.setColor('BLUE')
				.setTitle(aniResult.title)
				.setThumbnail(aniResult.image_url, 500, 500)
				.setURL(aniResult.url)
				.setDescription(`**Airing** ${aniResult.airing} 
**Episodes** ${aniResult.episodes || 'Unknown'} **Type** ${aniResult.type}
**Score** ${aniResult.score} **Rating** ${aniResult.rated}

**Start Date** ${sd}
**End Date** ${ed}`)
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