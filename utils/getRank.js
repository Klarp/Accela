const { Client } = require('../index.js');

module.exports = (rank) => {
	const emoji = Client.emojis.cache;
	let e;

	switch (rank) {
	case 'XH':
		e = emoji.get('734198887836942357');
		break;
	case 'X':
		e = emoji.get('734198888277213205');
		break;
	case 'SH':
		e = emoji.get('734198887677427784');
		break;
	case 'S':
		e = emoji.get('734198888025555115');
		break;
	case 'A':
		e = emoji.get('734198887568506941');
		break;
	case 'B':
		e = emoji.get('734198887941668995');
		break;
	case 'C':
		e = emoji.get('734198887820034129');
		break;
	case 'D':
		e = emoji.get('734198887858044998');
		break;
	default:
		e = 'F';
		break;
	}

	return e;
};