import { AnimeInfo, MangaInfo } from '../models/MediaInfo.js';

export function createMediaInfo(data, type) {
	if (type === 'ANIME') return new AnimeInfo(data);
	if (type === 'MANGA') return new MangaInfo(data);
	throw new Error('Unknown media type');
}