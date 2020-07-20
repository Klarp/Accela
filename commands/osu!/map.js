const osu = require('node-osu');
const oj = require('ojsama');
const Discord = require('discord.js');
const curl = require('curl');
const { osu_key } = require('../../config.json');

module.exports = {
	name: 'beatmap',
	aliases: ['map', 'bmap'],
	description: 'Gets the requested beatmap information.',
	module: 'osu!',
	args: true,
	usage: '<beatmap>',
	async execute(message, args) {
		// Access the api
		const osuApi = new osu.Api(osu_key);

		// Use arguments if applicable
		const bMap = args[0].split('/').pop();

		// Find user through the api
		osuApi.getBeatmaps({ b: bMap }).then(beatmap => {
			const map = beatmap[0];
			curl.get(`https://osu.ppy.sh/osu/${map.id}`, function(err, response, body) {
				const parser = new oj.parser().feed(body);

				const maxPP = oj.ppv2({ map: parser.map }).toString();

				const ppFix = maxPP.split(' ');

				// Create the embed
				const osuEmbed = new Discord.MessageEmbed()
					.setColor('0xff69b4')
					.setTitle(`${map.title} (${map.version})`)
					.setDescription(`https://osu.ppy.sh/b/${map.id}`)
					.addField('Max PP', ppFix[0])
					.setFooter(map.approvalStatus);

				message.channel.send({ embed: osuEmbed });
			});
		}).catch(e => {
			console.error(e);
			return message.reply('No map was found!');
		});
	},
};