const { EmbedBuilder } = require('discord.js');
const { MediaInfoBase } = require('./MediaInfoBase');
const { formatDate } = require('../utils/formatters');

class AnimeInfo extends MediaInfoBase {
	constructor(anime) {
		super(anime);
		this.episodes = anime.episodes || 'Unknown';
	}

	buildAniEmbed() {
		return new EmbedBuilder()
			.setAuthor({
				name: 'AniList [Unoffical]',
				url: 'https://anilist.co',
				iconURL: 'https://anilist.co/img/icons/android-chrome-512x512.png',
			})
			.setColor(this.coverImage.color)
			.setTitle(`${this.romajiTitle} [${this.nativeTitle}]`)
			.setURL(this.siteUrl)
			.setThumbnail(this.coverImage.large)
			.setDescription(`${this.englishTitle}

			**Status:** ${this.status} | **Format:** ${this.format} | **Episodes:** ${this.episodes}
			**Average Score:** ${this.averageScore}%
			
			**Genres:** ${this.genres}

			**Start Date:** ${formatDate(this.startDate.year, this.startDate.month, this.startDate.day)}
			**End Date:** ${formatDate(this.endDate.year, this.endDate.month, this.endDate.day)}

			**Description**
			${this.description}`
				.replace(/\t/g, ''))
			.setFooter({ text: `AniList ID: ${this.id}` });
	}

	buildMalEmbed() {
		return new EmbedBuilder()
			.setAuthor({
				name: 'MyAnimeList [Unoffical]',
				url: 'https://myanimelist.net',
				iconURL: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/MyAnimeList_Logo.png',
			})
			.setColor('#2e51a2')
			.setTitle(`${this.romajiTitle} [${this.nativeTitle}]`)
			.setURL(this.siteUrl)
			.setThumbnail(this.coverImage)
			.setDescription(`${this.englishTitle}
				
			**Status:** ${this.status} | **Format:** ${this.format} | **Episodes:** ${this.episodes}
			**Average Score:** ${this.averageScore}/10
			
			**Genres:** ${this.genres}
			
			**Start Date:** ${formatDate(this.startDate.year, this.startDate.month, this.startDate.day)}
			**End Date:** ${formatDate(this.endDate.year, this.endDate.month, this.endDate.day)}

			**Description**
			${this.description}`
				.replace(/\t/g, ''))
			.setFooter({ text: `MAL ID: ${this.id}` });
	}
}

class MangaInfo extends MediaInfoBase {
	constructor(manga) {
		super(manga);
		this.volumes = manga.volumes || 'Unknown';
		this.chapters = manga.chapters || 'Unknown';
	}

	buildAniEmbed() {
		return new EmbedBuilder()
			.setAuthor({
				name: 'AniList [Unoffical]',
				url: 'https://anilist.co',
				iconURL: 'https://anilist.co/img/icons/android-chrome-512x512.png',
			 })
			.setColor(this.coverImage.color)
			.setTitle(`${this.romajiTitle} [${this.nativeTitle}]`)
			.setURL(this.siteUrl)
			.setThumbnail(this.coverImage.large)
			.setDescription(`${this.englishTitle}
			**Status:** ${this.status} | **Format:** ${this.format} | **Average Score:** ${this.averageScore}
			**Genres:** ${this.genres}
			
			**Volumes:** ${this.volumes} | **Chapters:** ${this.chapters}
			
			**Start Date:** ${formatDate(this.startDate.year, this.startDate.month, this.startDate.day)}
			**End Date:** ${formatDate(this.endDate.year, this.endDate.month, this.endDate.day)}
			
			**Description**
			${this.description}`
				.replace(/\t/g, ''))
			.setFooter({ text: `Anilist ID: ${this.id}` });
	}

	buildMalEmbed() {
		return new EmbedBuilder()
			.setAuthor({
				name: 'MyAnimeList [Unoffical]',
				url: 'https://myanimelist.net',
				iconURL: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/MyAnimeList_Logo.png',
			})
			.setColor('#2e51a2')
			.setTitle(`${this.romajiTitle} [${this.nativeTitle}]`)
			.setURL(this.siteUrl)
			.setThumbnail(this.coverImage)
			.setDescription(`${this.englishTitle}
				
			**Status:** ${this.status} | **Format:** ${this.format} | **Average Score:** ${this.averageScore}/10
			**Genres:** ${this.genres}

			**Volumes:** ${this.volumes} | **Chapters:** ${this.chapters}
			
			**Start Date:** ${formatDate(this.startDate.year, this.startDate.month, this.startDate.day)}
			**End Date:** ${formatDate(this.endDate.year, this.endDate.month, this.endDate.day)}

			**Description**
			${this.description}`
				.replace(/\t/g, ''))
			.setFooter({ text: `MAL ID: ${this.id}` });
	}
}

module.exports = { AnimeInfo, MangaInfo };