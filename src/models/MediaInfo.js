import { EmbedBuilder } from 'discord.js';
import { MediaInfoBase } from './MediaInfoBase.js';
import { formatDate } from '../utils/formatters.js';

export class AnimeInfo extends MediaInfoBase {
	constructor(anime) {
		super(anime);
		this.episodes = anime.episodes || 'Unknown';
	}

	buildEmbed() {
		return new EmbedBuilder()
			.setAuthor({
				name: 'AniList [Unoffical]',
				url: 'https://anilist.co',
				iconURL: 'https://anilist.co/img/icons/android-chrome-512x512.png',
			})
			.setColor(this.coverImage?.color || '#2e51a2')
			.setTitle(`${this.romajiTitle} [${this.nativeTitle}]`)
			.setURL(this.siteUrl)
			.setThumbnail(this.coverImage?.large)
			.setDescription(`${this.englishTitle}

			**Status:** ${this.status} | **Format:** ${this.format} | **Episodes:** ${this.episodes}
			**Studio:** ${this.studios} **Average Score:** ${this.averageScore}%
			
			**Genres:** ${this.genres}

			**Start Date:** ${formatDate(this.startDate.year, this.startDate.month, this.startDate.day)}
			**End Date:** ${formatDate(this.endDate.year, this.endDate.month, this.endDate.day)}

			**Description**
			${this.description}`
				.replace(/\t/g, ''))
			.setFooter({ text: `AniList ID: ${this.id}` });
	}
}

export class MangaInfo extends MediaInfoBase {
	constructor(manga) {
		super(manga);
		this.volumes = manga.volumes || 'Unknown';
		this.chapters = manga.chapters || 'Unknown';
	}

	buildEmbed() {
		return new EmbedBuilder()
			.setAuthor({
				name: 'AniList [Unofficial]',
				url: 'https://anilist.co',
				iconURL: 'https://anilist.co/img/icons/android-chrome-512x512.png',
			 })
			.setColor(this.coverImage?.color || '#2e51a2')
			.setTitle(`${this.romajiTitle} [${this.nativeTitle}]`)
			.setURL(this.siteUrl)
			.setThumbnail(this.coverImage?.large)
			.setDescription(`${this.englishTitle}

			**Status:** ${this.status} | **Format:** ${this.format} | **Average Score:** ${this.averageScore}
			**Staff:** ${this.staff}
			**Genres:** ${this.genres}
			
			**Volumes:** ${this.volumes} | **Chapters:** ${this.chapters}
			
			**Start Date:** ${formatDate(this.startDate.year, this.startDate.month, this.startDate.day)}
			**End Date:** ${formatDate(this.endDate.year, this.endDate.month, this.endDate.day)}
			
			**Description**
			${this.description}`
				.replace(/\t/g, ''))
			.setFooter({ text: `Anilist ID: ${this.id}` });
	}
}