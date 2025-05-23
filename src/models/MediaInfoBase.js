const { STATUS_NAMES, FORMAT_NAMES } = require('../utils/constants');

class MediaInfoBase {
	constructor(media = {}) {
		const {
			coverImage,
			siteUrl,
			title = {},
			status,
			format,
			averageScore,
			genres,
			startDate = {},
			endDate = {},
			description,
			id,
		} = media;

		this.coverImage = coverImage || null;
		this.siteUrl = siteUrl || null;
		this.englishTitle = title.english || '';
		this.romajiTitle = title.romaji || '';
		this.nativeTitle = title.native || '';
		this.status = STATUS_NAMES[status] || status || 'Unknown';
		this.format = FORMAT_NAMES[format] || format || 'Unknown';
		this.averageScore = typeof averageScore === 'number' ? averageScore : 'Unknown';
		this.genres = this.formatGenres(media, genres);
		this.startDate = startDate;
		this.endDate = endDate;
		this.description = this.formatDescription(description);
		this.id = id;
	}

	formatDescription(description) {
		if (!description) return 'No description available';
		return description
			.replace(/<[^>]*>/g, '')
			.replace(/\n/g, ' ')
			.replace(/\s+/g, ' ')
			.substring(0, 300) + '...';
	}

	formatGenres(media, genres) {
		if (Array.isArray(media.genres) && genres.length > 0) {
			return genres.join(' | ');
		}
		return 'None Available';
	}
}

module.exports = { MediaInfoBase };