const osu = require('node-osu');
const oj = require('ojsama');
const Discord = require('discord.js');
const curl = require('curl');
const { Client } = require('../../index');
const { osu_key } = require('../../config.json');

module.exports = {
	name: 'calc',
	description: 'Calculates pp',
	module: 'Osu!',
	args: true,
	usage: '<beatmap> <acc> <combo> <missed> <mods>',
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
				if (args[4]) {
					mods = oj.modbits.from_string(args[4]);
				}

				acc_percent = parseFloat(args[1]);
				combo = parseInt(args[2]);
				miss = parseInt(args[3]);
				const parser = new oj.parser().feed(body);

				const pMap = parser.map;

				const stars = new oj.diff().calc({ map: pMap, mods: mods });

				const pp = oj.ppv2({
					stars: stars,
					combo: combo,
					nmiss: miss,
					acc_percent: acc_percent,
				});

				const maxPP = oj.ppv2({
					map: pMap,
				});

				const max_combo = pMap.max_combo();
				combo = combo || max_combo;

				const ppFix = pp.toString().split(' ');
				const ppNum = parseFloat(ppFix[0]);
				const maxppFix = maxPP.toString().split(' ');
				const maxppNum = parseFloat(maxppFix[0]);

				const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' });
				const [{ value: amonth },, { value: aday },, { value: ayear }] = dateTimeFormat.formatToParts(map.approvedDate);

				// Create the embed
				const osuEmbed = new Discord.MessageEmbed()
					.setColor('#af152a')
					.setURL(`https://osu.ppy.sh/b/${map.id}`)
					.setTitle(`${map.artist} - ${map.title} (${map.version})`)
					.setDescription(`Combo: ${combo}x | Missed: ${miss}x
					Mods: ${oj.modbits.string(mods) || 'NoMod'} | Accuracy: ${acc_percent || '100'}%
					
					Total PP: **${ppNum.toFixed(2)}pp**/${maxppNum.toFixed(2)}PP`)
					.setFooter(`${map.approvalStatus} on ${amonth} ${aday} ${ayear} | Mapped by: ${map.creator}`);

				message.channel.send({ embed: osuEmbed });
			});
		}).catch(e => {
			console.error(e);
			return message.reply('No map was found!');
		});
	},
};