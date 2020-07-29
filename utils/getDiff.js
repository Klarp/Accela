const { Client } = require('../index.js');

module.exports = (star) => {
	console.log(star);
	const emoji = Client.emojis.cache;

	let diff;

	if (star < 2) {
		// Easy
		diff = emoji.get('737881216812056636');
	} else if (star < 2.7) {
		// Normal
		diff = emoji.get('737881216467861607');
	} else if (star < 4) {
		// Hard
		diff = emoji.get('737881216832766012');
	} else if (star < 5.3) {
		// Insane
		diff = emoji.get('737881216518193273');
	} else if (star < 6.5) {
		// Expert
		diff = emoji.get('737881216815988738');
	} else {
		// Expert+
		diff = emoji.get('737881216409272425');
	}

	return diff;
};