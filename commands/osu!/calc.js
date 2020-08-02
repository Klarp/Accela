const osu = require('node-osu');
const oj = require('ojsama');
const Discord = require('discord.js');
const curl = require('curl');
const { osu_key } = require('../../config.json');

module.exports = {
	name: 'calc',
	description: 'Calculates pp',
	module: 'osu!',
	args: true,
	usage: '<beatmap> <mods> <acc> <combo> <missed>',
	execute(message, args) {
		// Access the api
		const osuApi = new osu.Api(osu_key);

		let mods = oj.modbits.none;
		let acc_percent;
		let combo;
		let miss;

		const bMap = args[0].split('/').pop();

		// Find user through the api
		osuApi.getBeatmaps({ b: bMap }).then(beatmap => {
			const map = beatmap[0];
			curl.get(`https://osu.ppy.sh/osu/${map.id}`, function(err, response, body) {
				mods = oj.modbits.from_string(args[1]);
				if (!mods) {
					mods = oj.modbits.none;
				}
				acc_percent = parseFloat(args[2]);
				combo = parseInt(args[3]);
				miss = parseInt(args[4]);
				const parser = new oj.parser().feed(body);

				const pMap = parser.map;

				const stars = new oj.diff().calc({ map: pMap, mods: mods });

				const pp = oj.ppv2({
					stars: stars,
					combo: combo,
					nmiss: miss,
					acc_percent: acc_percent,
				});

				const max_combo = pMap.max_combo();
				combo = combo || max_combo;

				const ppFix = pp.toString().split(' ');

				const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' });
				const [{ value: amonth },, { value: aday },, { value: ayear }] = dateTimeFormat.formatToParts(map.approvedDate);

				// Create the embed
				const osuEmbed = new Discord.MessageEmbed()
					.setColor('0xff69b4')
					.setURL(`https://osu.ppy.sh/b/${map.id}`)
					.setTitle(`${map.artist} - ${map.title} (${map.version})`)
					.setDescription(`Mapped by ${map.creator}`)
					.addField('Mods', oj.modbits.string(mods) || 'NoMod')
					.addField('Accuracy', `${acc_percent}%` || '100%')
					.addField('Missed', miss)
					.addField('Combo', `**${combo}x**/${map.maxCombo}`)
					.addField('PP', ppFix[0])
					.setFooter(`${map.approvalStatus} on ${amonth} ${aday} ${ayear}`);

				message.channel.send({ embed: osuEmbed });
			});
		}).catch(e => {
			console.error(e);
			return message.reply('No map was found!');
		});
	},
};