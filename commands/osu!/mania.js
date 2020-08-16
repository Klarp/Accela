const osu = require('node-osu');
const Discord = require('discord.js');

const { osu_key } = require('../../config.json');
const { Users, sConfig } = require('../../dbObjects');

module.exports = {
	name: 'mania',
	aliases: ['piano'],
	description: 'Gets the requested osu! user information for mania.',
	module: 'Owner',
	owner: true,
	usage: '<user>',
	async execute(message, args) {
		// Access the api
		const osuApi = new osu.Api(osu_key, {
			notFoundAsError: true,
			completeScores: true,
			parseNumeric: true,
		});

		let findUser;
		const menUser = message.mentions.users.first();
		const serverConfig = await sConfig.findOne({ where: { guild_id: message.guild.id } });

		let name;

		let prefix = '>>';
		if (serverConfig) {
			prefix = serverConfig.get('prefix');
		}

		// Access database
		if (menUser) {
			findUser = await Users.findOne({ where: { user_id: menUser.id } });
		} else {
			findUser = await Users.findOne({ where: { user_id: message.author.id } });
		}

		if (menUser) {
			name = menUser.username;
		}

		// Find the user in the database
		if (findUser) {
			name = findUser.get('user_osu');
		} else {
			name = message.author.username;
			message.channel.send(`No link found: use ${prefix}link [osu user] to link your osu! account!`);
		}

		// Use arguments if applicable
		if (!menUser && args[0]) {
			name = args[0];
		}

		if (!menUser && args[1]) {
			name = args.join(' ');
		}

		// Find user through the api
		osuApi.getUser({ m: 3, u: name }).then(async user => {
			console.log(user);
			// Need to change this to use the date grabber
			let d = user.raw_joinDate;
			d = d.split(' ')[0];

			const rank = user.pp.rank.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			const crank = user.pp.countryRank.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

			const country = user.country.toLowerCase();
			const countryEmote = `:flag_${country}:`;

			// Create the embed
			const osuEmbed = new Discord.MessageEmbed()
				.setAuthor(user.name, `http://a.ppy.sh/${user.id}`, `https://osu.ppy.sh/u/${user.id}`)
				.setColor('0xff69b4')
				.setTitle(`[Mania] Information On ${user.name}`)
				.setURL(`https://osu.ppy.sh/u/${user.id}`)
				.setDescription(`**Level** ${Math.floor(user.level)} | **Global Rank** ${rank} | **[${countryEmote}](https://osu.ppy.sh/rankings/osu/performance?country=${user.country} 'Country Rankings') Rank** ${crank}
				
**PP** ${Math.round(user.pp.raw)} | **Accuracy** ${user.accuracyFormatted} | **Play Count** ${user.counts.plays}`)
				.setFooter(`Joined ${d}`);
				/*
				.addField('Accuracy', user.accuracyFormatted, true)
				.addField('Play Count', user.counts.plays, true)
				.addField('Rank', rank, true)
				.addField(`Country Rank (${user.country})`, crank, true)
				.addField('PP', Math.round(user.pp.raw), true)
				*/


			message.channel.send({ embed: osuEmbed });
		}).catch(e => {
			if (e.name == 'Error') {
				return message.reply('No recent play was found!');
			}
			console.error(e);
			return message.reply('An error has occured!');
		});
	},
};