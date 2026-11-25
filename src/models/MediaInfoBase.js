import { STATUS_NAMES, FORMAT_NAMES } from '../utils/constants.js';

export class MediaInfoBase {
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
		this.englishTitle = title?.english || '';
		this.romajiTitle = title?.romaji || '';
		this.nativeTitle = title?.native || '';
		this.status = STATUS_NAMES[status] || status || 'Unknown';
		this.format = FORMAT_NAMES[format] || format || 'Unknown';
		this.averageScore = typeof averageScore === 'number' ? averageScore : 'Unknown';
		this.genres = this.formatGenres(genres);
		this.startDate = startDate ?? {};
		this.endDate = endDate ?? {};
		this.description = this.formatDescription(description);
		this.studios = this.formatStudios(studios?.nodes);
		this.staff = this.formatStaff(staff?.nodes);
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

	formatLinks(items, getName) {
		if (!Array.isArray(items) || items.length === 0) {
			return 'None Available';
		}

		return items.map(item => {
			const name = getName(item) || 'Unknown';
			return item?.siteUrl ? `[${name}](${item.siteUrl})` : name;
		}).join(', ');
	}

	formatStudios(studios) {
		return this.formatLinks(studios, studio => studio?.name);
	}

	formatStaff(staff) {
		return this.formatLinks(staff, person => person?.name?.full);
	}
}