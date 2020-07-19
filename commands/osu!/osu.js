const osu = require('node-osu');
const Discord = require('discord.js');
const { osu_key } = require('../../config.json');
const { Users } = require('../../dbObjects');

/*
To Do:

Honestly, what would be amazing is if the bot
shows a play and has emote reactions with each mod.
Clicking on them changes the bot's
message to show the stats with the new mods.
Reactions are toggle mode when reacted to

*/

module.exports = {
	name: 'osu',
	description: 'Gets the requested osu! user information.',
	module: 'osu!',
	usage: '<user>',
	async execute(message, args) {
		// Access the api
		const osuApi = new osu.Api(osu_key);

		let findUser;
		const menUser = message.mentions.users.first();

		// Access database
		if (menUser) {
			findUser = await Users.findOne({ where: { user_id: menUser.id } });
		} else {
			findUser = await Users.findOne({ where: { user_id: message.author.id } });
		}

		let name;

		if (menUser) {
			name = menUser.username;
		}

		// Find the user in the database
		if (findUser) {
			name = findUser.get('user_osu');
		} else {
			name = message.author.username;
		}

		// Use arguments if applicable
		if (!menUser && args[0]) {
			name = args[0];
		}

		// Find user through the api
		osuApi.getUser({ u: name }).then(user => {
			// Need to change this to use the date grabber
			let d = user.raw_joinDate;
			d = d.split(' ')[0];

			// Create the embed
			const osuEmbed = new Discord.MessageEmbed()
				.setAuthor(user.name, `http://a.ppy.sh/${user.id}`)
				.setColor('0xff69b4')
				.setTitle(`Information On ${user.name}`)
				.setDescription(`https://osu.ppy.sh/u/${user.id}`)
				.addField('Level', Math.floor(user.level), true)
				.addField('Accuracy', user.accuracyFormatted, true)
				.addField('Play Count', user.counts.plays, true)
				.addField('Rank', user.pp.rank, true)
				.addField(`Country Rank (${user.country})`, user.pp.countryRank, true)
				.addField('PP', Math.round(user.pp.raw), true)
				.addField('Join Date', d, true)
				.setFooter('Accela (Made by Karp)');

			message.channel.send({ embed: osuEmbed });
		}).catch(e => {
			console.error(e);
			return message.reply('No user was found!');
		});
	},
};