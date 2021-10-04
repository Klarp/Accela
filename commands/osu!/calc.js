// Copyright (C) 2021 Brody Jagoe

const osu = require('node-osu');
const curl = require('curl');

const { modbits, parser, diff, ppv2 } = require('ojsama');
const { MessageEmbed } = require('discord.js');

const Sentry = require('../../log');
const { osu_key } = require('../../config.json');

module.exports = {
	name: 'calc',
	description: 'Calculates pp from map',
	module: 'Osu!',
	args: true,
	disableOsu: true,
	usage: '<beatmap> <acc> <combo> <missed> <mods>',
	execute(message, args) {
		// Access the api
		const osuApi = new osu.Api(osu_key);

		let mods = modbits.nomod;
		let acc_percent;
		let combo;
		let miss;

		const bMap = args[0].split('/').pop();

		// Find user through the api
		osuApi.getBeatmaps({ b: bMap }).then(beatmap => {
			const map = beatmap[0];

			curl.get(`https://osu.ppy.sh/osu/${map.id}`, function(err, response, body) {
				if (args[4]) {
					mods = modbits.from_string(args[4]);
				}

				acc_percent = parseFloat(args[1]);
				combo = parseInt(args[2]);
				miss = parseInt(args[3]);

				const parserBody = new parser().feed(body);

				const pMap = parserBody.map;

				const stars = new diff().calc({ map: pMap, mods: mods });

				const pp = ppv2({
					stars: stars,
					combo: combo,
					nmiss: miss,
					acc_percent: acc_percent,
				});

				const maxPP = ppv2({
					map: pMap,
				});

				const max_combo = pMap.max_combo();
				combo = combo || max_combo;

				const ppFix = pp.total.toFixed(2);

				const maxppFix = maxPP.total.toFixed(2);

				const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' });

				const [{ value: amonth },, { value: aday },, { value: ayear }] = dateTimeFormat.formatToParts(map.approvedDate);

				// Create the embed
				const osuEmbed = new MessageEmbed()
					.setColor('#af152a')
					.setURL(`https://osu.ppy.sh/b/${map.id}`)
					.setTitle(`${map.artist} - ${map.title} (${map.version})`)
					.setDescription(`Combo: ${combo}x | Missed: ${miss}x
					Mods: ${modbits.string(mods) || 'NoMod'} | Accuracy: ${acc_percent || '100'}%
					
					Total PP: **${ppFix}pp**/${maxppFix}PP`)
					.setFooter(`${map.approvalStatus} on ${amonth} ${aday} ${ayear} | Mapped by: ${map.creator}`);

				message.channel.send({ embeds: [osuEmbed] });
			});
		}).catch(e => {
			Sentry.captureException(e);
			console.error(e);
			return message.reply('No map was found!');
		});
	},
};