module.exports = ({ map: file, mods: mods }) => {
	const opened_file = file;
	let beatmap_data = {
		od: 0,
		stars_ht: 0,
		stars_nt: 0,
		stars_dt: 0,
		note_count: 0,
	};

	let values_changed = true;

	// Returns an osu!mania note from note entry
	function parse_note(line, keys) {
		// Line format:
		//	x,y,time,type,hitSound,endTime:extras...
		// where all numbers are integers
		
};