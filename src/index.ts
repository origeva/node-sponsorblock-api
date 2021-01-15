import fetch, { Response } from 'node-fetch';
import crypto from 'crypto';
import { Segment, Category } from './types/segment.model';
import { Vote, CategoryVote } from './types/vote.model';
import { Video } from './types/video.model';
import { dbuserStatToUserStats, OverallStats, UserStat, SortType } from './types/stats.model';

export const config: { hashPrefixRecommendation: PrefixRange; baseURL: string } = {
	baseURL: process.argv[2] === 'local' ? 'https://localhost' : 'https://sponsor.ajay.app', // Base URL for the api endpoints
	hashPrefixRecommendation: 4, // Recommended prefix length to use for getting segments privately, to balance between privacy and more accurate results
};

import SponsorBlock from './apis/api';
export default SponsorBlock;

export class SponsorBlockLegacy {
	constructor(public userID: string, public baseURL: string = config.baseURL) {}

	// Legacy Calls
	/**
	 * Legacy API call to get videos' segments. Only returns segments of 'sponsor' category.
	 * @param videoID The ID of the video to get segments for.
	 * @deprecated This method is deprecated and should not be used.
	 */
	async getSegments(videoID: string): Promise<Segment[]> {
		let res = await fetch(`${this.baseURL}/api/getVideoSponsorTimes?videoID=${videoID}`);
		if (res.status === 404) {
			throw new Error('Not found');
		}
		let data = (await res.json()) as { sponsorTimes: [number, number][]; UUIDs: string[] };
		let segments: Segment[] = [];
		for (let i = 0; i < data.UUIDs.length; i++) {
			segments.push({ UUID: data.UUIDs[i], startTime: data.sponsorTimes[i][0], endTime: data.sponsorTimes[i][1], category: 'sponsor' });
		}
		return segments;
	}

	/**
	 * Legacy API call to submit a sponsor segment, the segment's category will always be 'sponsor'.
	 * @param videoID The ID of the video to get segments for.
	 * @param startTime The start time of the segment.
	 * @param endTime The end time of the segment.
	 * @deprecated This method is deprecated and should not be used.
	 */
	async postSegment(videoID: string, startTime: number, endTime: number): Promise<void> {
		let res = await fetch(`${this.baseURL}/api/postVideoponsorTimes?userID=${this.userID}&videoID=${videoID}`);
		if (res.status === 400) {
			throw new Error('Bad Request (Your inputs are wrong/impossible)');
		} else if (res.status === 409) {
			throw new Error('Rate Limit (Too many for the same user or IP)');
		} else if (res.status === 429) {
			throw new Error('Duplicate');
		}
		// returns nothing (status code 200)
	}
}

export type SponsorBlockOptions = {
	/**
	 * The base URL to send requests to.
	 * @default https://sponsor.ajay.app
	 */
	baseURL?: string;

	/**
	 * The length of the prefix of the hash to query the server with, the shorter the more private.
	 * Accepts 3-32
	 * @default 4
	 */
	hashPrefixLength?: PrefixRange;
};

/**
 * SponsorBlock API class, to be constructed with a userID.
 *
 * @description Complete API documentation can be found {@link https://github.com/ajayyy/SponsorBlock/wiki/API-Docs here}.
 * Please review the {@link https://gist.github.com/ajayyy/4b27dfc66e33941a45aeaadccb51de71 attriution template}
 * to abide the {@link https://github.com/ajayyy/SponsorBlock/wiki/Database-and-API-License license}.
 */
export interface SponsorBlockAPI {
	/**
	 * The local user ID.
	 */
	userID: string;
	options: SponsorBlockOptions;
	/**
	 * @param videoID The ID of the video to get segments for.
	 * @param categories The categories of the segments. Defaults to "sponsor".
	 */
	getSegments(videoID: string, ...categories: Category[]): Promise<Segment[]>;

	/**
	 * @param videoID The ID of the video to submit segments for.
	 * @param segments The segments to submit.
	 */
	postSegments(videoID: string, ...segments: Segment[]): Promise<void>;

	/**
	 * Hashes the ID of the video and send the prefix of the hash so the server doesn't know which video you're looking for.
	 * The method filters out the video that don't match the input videoID.
	 * @param videoID The ID of the video to get segments for.
	 * @param categories The categories of the segments. Defaults to "sponsor".
	 */
	getSegmentsPrivately(videoID: string, ...categories: Category[]): Promise<Video>;

	/**
	 * Vote a submission up or down.
	 * @param UUID The UUID of the segment you're voting for.
	 * @param type The vote type, 'down', 'up' or 0 for down, 1 for up.
	 */
	vote(UUID: string, type: VoteType): Promise<void>;

	/**
	 * Vote a submission for a more fitting category change.
	 * @param UUID The UUID of the segment you're voting for.
	 * @param category The category you think would be more fitting.
	 */
	voteCategory(UUID: string, category: Category): Promise<void>;

	/**
	 * Submitting a view for a segment, let it be known you've made use of a submission.
	 * To be used only after using a segment.
	 * @param UUID The UUID of the segment you've viewed.
	 */
	viewed(UUID: string): Promise<void>; // UUID or segment?

	/**
	 * Check how many times your submissions have been viewed.
	 */
	// 6 GET /api/getViewsForUser
	getViews(): Promise<number>;

	/**
	 * Check how much time you saved for other.
	 */
	// 7 GET /api/getSavedTimeForUser
	getTimeSaved(): Promise<number>;

	/**
	 * Set a different username.
	 * @param username The username you'd like to change to.
	 */
	setUsername(username: string): Promise<void>;

	/**
	 * Get your username.
	 */
	getUsername(): Promise<string>;

	// Stat Calls

	/**
	 * Get the top user stats
	 * @param sortType
	 */
	getTopUsers(sortType: SortType): Promise<UserStat[]>;

	// 11 GET /api/getTotalStats
	getOverallStats(): Promise<OverallStats>;

	/**
	 * Get how many days the platform has saved for users.
	 */
	// 12 GET /api/getDaysSavedFormatted
	getDaysSaved(): Promise<number>;

	/**
	 * Check whether you're a VIP.
	 */
	// 13 GET /api/isUserVIP
	isVIP(): Promise<boolean>;

	/**
	 * Get the hash of your local ID (as stored in the server's database).
	 */
	getHashedUserID(): string;
}

interface SponsorBlockAPIVIP extends SponsorBlockAPI {
	// VIP Calls

	/**
	 *
	 * @param video
	 * @param categories
	 */
	// 14 POST /api/noSegments
	blockSubmissionsOfCategory(videoID: string, ...categories: Category[]): Promise<void>;

	// 15 POST /api/shadowBanUser
	shadowBan(publicUserID: string): Promise<void>;

	removeShadowBan(publicUserID: string): Promise<void>;

	hideOldSubmissions(publicUserID: string): Promise<void>;

	// 16 POST /api/warnUser
	warnUser(publicUserID: string, enabled?: boolean): Promise<void>;
}

interface SponsorBlockAPIAdmin extends SponsorBlockAPIVIP {
	// Admin Calls
	// 17 POST /api/addUserAsVIP
	addVIP(publicUserID: string, enabled?: boolean): Promise<void>;
}

/**
 * Whether you want to vote up or down, 0 for down, 1 for up.
 */
export type VoteType = 'down' | 'up' | 0 | 1;

/**
 * The length range of hash prefix that will be accepted to search for a video by.
 */
export type PrefixRange = 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32;

/**
 * Extracts the video ID from the full URL.
 * this function assumes the input is surely a YouTube video URL, otherwise may return null or a part of the input.
 * @param youtubeURL The complete YouTube URL of a video.
 * @returns The video ID extracted from the input URL.
 */
export function extractVideoID(youtubeURL: string): string | null {
	let regex = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	let matchArray = youtubeURL.match(regex);
	return matchArray && matchArray[2];
}
