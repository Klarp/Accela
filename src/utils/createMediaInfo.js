const { AnimeInfo, MangaInfo } = require('../models/MediaInfo');

function createMediaInfo(data, type) {
	if (type === 'ANIME') return new AnimeInfo(data);
	if (type === 'MANGA') return new MangaInfo(data);
	throw new Error('Unknown media type');
}

module.exports = { createMediaInfo };