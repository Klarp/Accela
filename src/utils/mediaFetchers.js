import { MessageFlags } from 'discord.js';
import { anilist } from 'anilist';
import PQueue from 'p-queue';
import { MediaPage } from '../models/MediaPage.js';
import { createMediaQuery } from './constants.js';
import { formatSelectedOptions } from './formatters.js';
import { messageHandler } from './messageHandler.js';

const mediaQueue = new PQueue(
	{
		intervalCap: 29,
		interval: 60_000,
		strict: true,
	});

async function fetchAniPage(query) {
	const response = await fetch('https://graphql.anilist.co', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		},
		body: JSON.stringify({ query }),
		signal: AbortSignal.timeout(15_000),
	});

	if (!response.ok) {
		const error = new Error(`AniList returned HTTP ${response.status}`);
		error.status = response.status;
		error.retryAfter = response.headers.get('retry-after');

		if (response.status === 429) {
			pauseForRateLimit(error.retryAfter);
		}

		throw error;
	}

	const result = await response.json();

	if (result.errors?.length) {
		throw new Error('AniList returned GraphQL errors', {
			cause: result.errors,
		});
	}

	if (!Array.isArray(result.data?.Page?.media)) {
		throw new Error('AniList returned an invalid page response');
	}

	return result.data.Page;
}

export async function getAniPage(interaction, options) {
	try {
		await interaction.deferReply();

		const mediaQuery = createMediaQuery().arguments(options);
		const fullPage = anilist.query.page({ perPage: 5 }).withMedia(mediaQuery);

		const controller = new AbortController();
		const queueTimeout = new Error('AniList queue wait timed out');
		const timer = setTimeout(() => controller.abort(queueTimeout), 5 * 60_000);

		let pageData;

		try {
			if (mediaQueue.size >= 58) {
				await interaction.editReply('The search queue is busy. Please try again later.');
				return;
			}

			pageData = await mediaQueue.add(() => {
				clearTimeout(timer);
				return fetchAniPage(fullPage.raw);
			}, { signal: controller.signal });
		} catch (error) {
			if (error === queueTimeout) {
				console.error('AniList queue wait timed out:', error);
				await interaction.editReply('The search queue is busy. Please try again later');
				return;
			}
			throw error;
		} finally {
			clearTimeout(timer);
		}

		if (!pageData || !pageData.media || pageData.media.length === 0) {
			const selected = formatSelectedOptions(options);
			await interaction.editReply(
				`No results found for "${options.search}"\n\n**With filters:**\n${selected}`,
			);
			return;
		}

		const page = new MediaPage(pageData, { ...options });
		const content = await page.createMessage();

		return await messageHandler(interaction, content, page);
	} catch(err) {
		console.error(`Failed to send information on "${options.search}":`, err);
		if (interaction.deferred) {
			await interaction.editReply({
				content: `An error occured while fetching information for "${options.search}"`,
			});
		} else if (interaction.replied) {
			await interaction.followUp({
				content: `An error occurred while fetching information for "${options.search}"`,
        		flags: MessageFlags.Ephemeral,
			});
		} else {
			await interaction.reply({
				content: `An error occured while fetching information for "${options.search}"`,
				flags: MessageFlags.Ephemeral,
			});
		}
	}
}

let pausedUntil = 0;
let resumeTimer;

function pauseForRateLimit(retryAfter) {
	const now = Date.now();
	const value = retryAfter?.trim();
	const seconds = value && /^\d+$/.test(value) ? Number(value) : NaN;
	const date = value && !/^\d+$/.test(value) ? Date.parse(value) : NaN;

	const delay = Number.isFinite(seconds)
		? seconds * 1_000
		: Number.isFinite(date) ? Math.max(0, date - now) : 60_000;

	pausedUntil = Math.max(pausedUntil, now + delay);
	mediaQueue.pause();
	clearTimeout(resumeTimer);

	function resumeWhenReady() {
		const remaining = pausedUntil - Date.now();
		if (remaining > 0) {
			resumeTimer = setTimeout(resumeWhenReady, Math.min(remaining, 2_147_483_647));
		} else {
			mediaQueue.start();
		}
	}

	resumeWhenReady();
}