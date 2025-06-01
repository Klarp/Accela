const { anilist } = require('anilist');

const STATUS_NAMES = {
	'FINISHED': 'Finished',
	'RELEASING': 'Releasing',
	'NOT_YET_RELEASED': 'Not Yet Released',
	'CANCELLED': 'Cancelled',
	'HIATUS': 'Hiatus',
};

const FORMAT_NAMES = {
	'TV_SHORT': 'TV Short',
	'MOVIE': 'Movie',
	'SPECIAL': 'Special',
	'MUSIC': 'Music',
	'MANGA': 'Manga',
	'NOVEL': 'Novel',
	'ONE_SHOT': 'One Shot',
	'TV_SPECIAL': 'TV Special',
};

const DEFAULT_QUERY = anilist.query.media()
	.withCoverImage()
	.withSiteUrl()
	.withTitles('romaji', 'native', 'english')
	.withStatus()
	.withFormat()
	.withEpisodes()
	.withVolumes()
	.withChapters()
	.withAverageScore()
	.withGenres()
	.withStartDate()
	.withEndDate()
	.withDescription()
	.withMalId()
	.withId()
	.withStudios({
		nodes: (node) => node
			.withName()
			.withSiteUrl(),
	})
	.withStaff({
		nodes: (node) => node
			.withName()
			.withSiteUrl(),
	})
	.isAdult();

module.exports = {
	STATUS_NAMES,
	FORMAT_NAMES,
	DEFAULT_QUERY,
};