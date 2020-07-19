const { osu_mods, mod_sh } = require('../config.json');

module.exports = (mods) => {
	const modsOnly = mods.filter(mod =>
		osu_mods.includes(mod));

	const shortMods = modsOnly.map(mod => mod_sh[mod]).join('');

	return shortMods;
};