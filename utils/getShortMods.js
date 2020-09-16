const osu_mods = [
	'None',
	'NoFail',
	'Easy',
	'Hidden',
	'HardRock',
	'SuddenDeath',
	'DoubleTime',
	'HalfTime',
	'Nightcore',
	'Flashlight',
	'Autoplay',
	'SpunOut',
];

const mod_sh = {
	'None': 'NoMod',
	'NoFail': 'NF',
	'Easy': 'EZ',
	'Hidden': 'HD',
	'HardRock': 'HR',
	'SuddenDeath': 'SD',
	'DoubleTime': 'DT',
	'HalfTime': 'HT',
	'Nightcore': 'NC',
	'Flashlight': 'FL',
	'Autoplay': 'Auto',
	'SpunOut': 'SO',
};

module.exports = (mods) => {
	const modsOnly = mods.filter(mod =>
		osu_mods.includes(mod));

	const shortMods = modsOnly.map(mod => mod_sh[mod]).join('');

	return shortMods;
};