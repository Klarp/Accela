const osu = require('node-osu');
const Discord = require('discord.js');
const { osu_key } = require('../../config.json');
const { Users, sConfig } = require('../../dbObjects');
const prom_client = require('prom-client');

const counter = new prom_client.Counter({
	name: 'command_osu_total',
	help: 'command_osu_help',
});

module.exports = {
	name: 'osu',
	aliases: 'oss',
	description: 'Gets the requested osu! user information.',
	module: 'Osu!',
	usage: '<user>',
	async execute(message, args) {
		counter.inc();
		// Access the api
		const osuApi = new osu.Api(osu_key);

		let findUser;
		const menUser = message.mentions.users.first();

		let prefix = '>>';

		if (message.channel.type !== 'dm') {
			const serverConfig = await sConfig.findOne({ where: { guild_id: message.guild.id } });
			if (serverConfig) {
				prefix = serverConfig.get('prefix');
			}
		}

		// Access database
		if (menUser) {
			findUser = await Users.findOne({ where: { user_id: menUser.id } });
		} else {
			findUser = await Users.findOne({ where: { user_id: message.author.id } });
		}

		let name;

		// Find the user in the database
		if (findUser) {
			try {
				name = findUser.get('verified_id');
			} catch {
				name = findUser.get('osu_id');
			}
		} else {
			name = message.author.username;
			message.channel.send(`No link found: use ${prefix}link [osu user] to link your osu! account!`);
		}

		if (menUser && !findUser) {
			name = menUser.username;
		}

		// Use arguments if applicable
		if (!menUser && args[0]) {
			name = args.join(' ');
		}

		// Find user through the api
		osuApi.getUser({ u: name }).then(user => {
			// Need to change this to use the date grabber
			let d = user.raw_joinDate;
			d = d.split(' ')[0];

			const rank = user.pp.rank.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
			const crank = user.pp.countryRank.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

			const country = user.country.toLowerCase();
			const countryEmote = `:flag_${country}:`;

			// Create the embed
			const osuEmbed = new Discord.MessageEmbed()
				.setAuthor(user.name, `http://a.ppy.sh/${user.id}`, `https://osu.ppy.sh/u/${user.id}`)
				.setColor('0xff69b4')
				.setTitle(`Information On ${user.name}`)
				.setURL(`https://osu.ppy.sh/u/${user.id}`)
				.setDescription(`**Level** ${Math.floor(user.level)} | **Global Rank** ${rank} | **[${countryEmote}](https://osu.ppy.sh/rankings/osu/performance?country=${user.country} 'Country Rankings') Rank** ${crank}
				
**PP** ${Math.round(user.pp.raw)} | **Accuracy** ${user.accuracyFormatted} | **Play Count** ${user.counts.plays}`)
				.setFooter(`Joined ${d} • osu!std`);
				/*
				.addField('Accuracy', user.accuracyFormatted, true)
				.addField('Play Count', user.counts.plays, true)
				.addField('Rank', rank, true)
				.addField(`Country Rank (${user.country})`, crank, true)
				.addField('PP', Math.round(user.pp.raw), true)
				*/


			message.channel.send({ embed: osuEmbed });
		}).catch(e => {
			console.error(e);
			return message.reply(`No user was found named ${name}!`);
		});
	},
};