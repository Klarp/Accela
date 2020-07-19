// Special thanks to all those helped me with this such as Stedoss, uyitroa and phil.

const osu = require('ojsama');
const curl = require('curl');

module.exports = {
	name: 'test-osu',
	aliases: 'tosu',
	description: 'Tests my osu! stuff',
	module: 'osu!',
	perms: 'MANAGE_SERVER',
	async execute() {
		curl.get('https://osu.ppy.sh/osu/67079', function(err, response, body) {
			const parser = new osu.parser().feed(body);

			console.log(osu.ppv2({ map: parser.map }).toString());
		});
	},
};