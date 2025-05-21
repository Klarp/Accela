async function transformData(data, type) {
	const genres = [];
	if (Array.isArray(data.genres)) {
		for (const genre of data.genres) genres.push(genre.name);
	}
	if (Array.isArray(data.themes)) {
		for (const theme of data.themes) genres.push(theme.name);
	}

	 let mediaStart, mediaEnd;
	if (type === 'ANIME') {
		mediaStart = data.aired?.from ? new Date(data.aired.from) : null;
		mediaEnd = data.aired?.to ? new Date(data.aired.to) : null;
	} else {
		mediaStart = data.published?.from ? new Date(data.published.from) : null;
		mediaEnd = data.published?.to ? new Date(data.published.to) : null;
	}
	const startDate = mediaStart
		? {
			year: mediaStart.getUTCFullYear(),
			month: mediaStart.getUTCMonth() + 1,
			day: mediaStart.getUTCDate(),
		}
		: {};

	const endDate = mediaEnd
		? {
			year: mediaEnd.getUTCFullYear(),
			month: mediaEnd.getUTCMonth() + 1,
			day: mediaEnd.getUTCDate(),
		}
		: {};

	const dataObject = {
		coverImage: data.images.jpg.image_url,
		siteUrl: data.url,
		englishTitle: data.title_english,
		romajiTitle: data.title,
		nativeTitle: data.title_japanese,
		status: data.status,
		format: data.type,
		episodes: data.episodes,
		averageScore: data.score,
		genres: genres,
		startDate: startDate,
		endDate: endDate,
		description: data.synopsis,
		id: data.mal_id,
	};

	return dataObject;
}

module.exports = { transformData };