const { Client } = require('../index.js');

module.exports = (star) => {
	const emoji = Client.emojis.cache;

	let diff;

	if (star < 2) {
		// Easy
		diff = emoji.get('738125708802654322');
	} else if (star < 2.7) {
		// Normal
		diff = emoji.get('738125709180010557');
	} else if (star < 4) {
		// Hard
		diff = emoji.get('738125709113032716');
	} else if (star < 5.3) {
		// Insane
		diff = emoji.get('738125709129547947');
	} else if (star < 6.5) {
		// Expert
		diff = emoji.get('738125708810780744');
	} else {
		// Expert+
		diff = emoji.get('738125708781682719');
	}

	return diff;
};