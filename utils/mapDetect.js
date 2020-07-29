const Discord = require('discord.js');
const curl = require('curl');
const oj = require('ojsama');
const osu = require('node-osu');
const { osu_key } = require('../config.json');

module.exports = (msg) => {
	const osuApi = new osu.Api(osu_key);

	const bMap = msg.content.split('/').pop();
	const client = msg.client;

	osuApi.getBeatmaps({ b: bMap }).then(beatmap => {
		const map = beatmap[0];
		osuApi.getUser({ u: map.creator }).then(u => {
			curl.get(`https://osu.ppy.sh/osu/${map.id}`, function(err, response, body) {

				const parser = new oj.parser().feed(body);
				const pMap = parser.map;
				const maxPP = oj.ppv2({ map: pMap }).toString();
				const ppFix = maxPP.split(' ');
				const stars = new oj.diff().calc({ map: pMap });
				const star = stars.toString().split(' ');
				const s = star[0];

				const emoji = client.emojis.cache;

				let diff;

				if (s < 2) {
					// Easy
					diff = emoji.get('737881216812056636');
				} else if (s < 2.7) {
					// Normal
					diff = emoji.get('737881216467861607');
				} else if (s < 4) {
					// Hard
					diff = emoji.get('737881216832766012');
				} else if (s < 5.3) {
					// Insane
					diff = emoji.get('737881216518193273');
				} else if (s < 6.5) {
					// Expert
					diff = emoji.get('737881216815988738');
				} else {
					// Expert+
					diff = emoji.get('737881216409272425');
				}

				const lenMinutes = Math.floor(map.length.total / 60);
				const lenSeconds = map.length.total - lenMinutes * 60;
				const drainMinutes = Math.floor(map.length.drain / 60);
				const drainSeconds = map.length.drain - drainMinutes * 60;

				const adate = map.approvedDate;
				const dateTimeFormat = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' });
				const [{ value: amonth },, { value: aday },, { value: ayear }] = dateTimeFormat.formatToParts(adate);
				const udate = map.lastUpdate;
				const [{ value: umonth },, { value: uday },, { value: uyear }] = dateTimeFormat.formatToParts(udate);

				// Create the embed
				const osuEmbed = new Discord.MessageEmbed()
					.setColor('0xff69b4')
					.setAuthor(map.creator, `http://a.ppy.sh/${u.id}`)
					.setTitle(`${map.artist} - ${map.title} (${map.version})`)
					.setThumbnail(`https://b.ppy.sh/thumb/${map.beatmapSetId}l.jpg`)
					.setURL(`https://osu.ppy.sh/b/${map.id}`)
					.setDescription(`${diff} ${star[0]}★ | Length: ${lenMinutes}:${lenSeconds} (${drainMinutes}:${drainSeconds})
					BPM: ${map.bpm} | Combo: ${map.maxCombo}x | Max PP: ${ppFix[0]}pp
					Circles: ${map.objects.normal} | Sliders: ${map.objects.slider} | Spinners: ${map.objects.spinner}`)
					.setFooter(`${map.approvalStatus} on ${aday}-${amonth}-${ayear} | Last Updated: ${uday}-${umonth}-${uyear}`);

				msg.channel.send({ embed: osuEmbed });
			});
		}).catch(e => {
			console.error(e);
		});
	}).catch(e => {
		console.error(e);
		return msg.reply('No map was found!');
	});
};