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
			studios,
			staff,
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
		this.genres = this.formatGenres(genres);
		this.startDate = startDate;
		this.endDate = endDate;
		this.description = this.formatDescription(description);
		this.studios = this.formatStudios(studios.nodes);
		this.staff = this.formatStaff(staff.nodes);
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

	formatGenres(genres) {
		return Array.isArray(genres) && genres.length ? genres.join(' | ') : 'None Available';
	}

	formatStudios(studios) {
		let studioData;
		if (Array.isArray(studios) && studios.length) {
			studioData = studios.map(studio => {
				const name = studio.name || 'Unknown';
				const url = studio.siteUrl || studio.url;
				return url ? `[${name}](${url})` : name;
			})
				.join(', ');
		}
		return studioData || 'None Available';
	}

	formatStaff(staff) {
		let staffData;
		if (Array.isArray(staff) && staff.length) {
			staffData = staff.map(person => {
				const name = person.name.full || person.name || 'Unknown';
				const url = person.siteUrl || person.url;
				return url ? `[${name}](${url})` : name;
			})
				.join(', ');
		}
		return staffData || 'None Available';
	}
}

module.exports = { MediaInfoBase };