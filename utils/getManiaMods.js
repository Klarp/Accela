module.exports = (mods) => {
	const mania_mods = [
		'None',
		'Easy',
		'NoFail',
		'HalfTime',
		'HardRock',
		'SuddenDeath',
		'DoubleTime',
		'Nightcore',
		'Hidden',
		'Flashlight',
		'FadeIn',
		'Autoplay',
	];

	const mod_sh = {
		None: 'NoMod',
		Easy: 'EZ',
		NoFail: 'NF',
		HalfTime: 'HT',
		HardRock: 'HR',
		SuddenDeath: 'SD',
		DoubleTime: 'DT',
		Halfscore: 'NC',
		Hidden: 'HD',
		Flashlight: 'FL',
		FadeIn: 'FI',
		Autoplay: 'Auto',
	};

	const modsOnly = mods.filter(mod =>
		mania_mods.includes(mod));

	const shortMods = modsOnly.map(mod => mod_sh[mod]).join('');

	return shortMods;
};