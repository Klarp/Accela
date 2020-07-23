// Special thanks to all those helped me with this such as Stedoss, uyitroa and phil.
const idGrab = require('../../index.js');

module.exports = {
	name: 'test-osu',
	aliases: 'tosu',
	description: 'Tests my osu! stuff',
	module: 'osu!',
	perms: 'MANAGE_SERVER',
	async execute() {
		if (idGrab.mapID) {
			console.log(idGrab.mapID);
		} else {
			console.log('Nope');
		}
	},
};