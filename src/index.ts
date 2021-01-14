import fetch, { Response } from 'node-fetch';
import crypto from 'crypto';
import { Segment, Category } from './types/segment.model';
import { Vote, CategoryVote } from './types/vote.model';
import { DBVideo, dbvideoToVideo, Video } from './types/video.model';
import { dbuserStatToUserStats, OverallStats, UserStat, SortType } from './types/stats.model';
import fs from 'fs';

const config = {
	hashPrefixRecommendation: 4, // Recommended prefix length to use for getting segments privately, to balance between privacy and getting less results
	baseURL: process.argv[2] === 'local' ? 'https://localhost' : 'https://sponsor.ajay.app', // Base URL for the api endpoints
};

type SponsorBlockOptions = {
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
export default class SponsorBlock implements API {
	constructor(public userID: string, public options: SponsorBlockOptions = {}) {
		options.baseURL = options.baseURL ?? 'https://sponsor.ajay.app';
		options.hashPrefixLength = options.hashPrefixLength ?? 4;
	}

	/**
	 *
	 * @param videoID The ID of the video to get segments for.
	 * @param categories The categories of the segments. Defaults to "sponsor".
	 */
	// 1 GET /api/skipSegments
	async getSegments(videoID: string, ...categories: Category[]): Promise<Segment[]> {
		let query = `?videoID=${videoID}`;
		if (categories.length > 0) {
			query += `&categories=${JSON.stringify(categories)}`;
		}
		let res = await fetch(`${this.options.baseURL}/api/skipSegments${query}`);
		this.statusCheck(res);

		await res.json();
		return ((await res.json()) as { UUID: string; segment: [number, number]; category: Category }[]).map(({ UUID, segment, category }) => {
			return { UUID, startTime: segment[0], endTime: segment[1], category };
		});
	}

	// // 2 A POST /api/skipSegments
	// async postSegment(videoID: string, segment: Segment): Promise<void> {
	// 	let res = await fetch(
	// 		`${this.options.baseURL}/api/skipSegments?videoID=${videoID}&startTime=${segment.startTime}&endTime=${segment.endTime}&category=${segment.category}&userID=${this.userID}`,
	// 		{
	// 			method: 'POST',
	// 			headers: { 'Content-Type': 'application/json' },
	// 		}
	// 	);
	// 	this.statusCheck(res);
	// 	// returns nothing (status code 200)
	// }

	// 2 B POST /api/skipSegments
	async postSegments(videoID: string, ...segments: Segment[]): Promise<void> {
		let dbSegments = segments.map((segment: Segment) => {
			let { UUID, startTime, endTime, category } = segment;
			return { UUID, segment: [startTime, endTime], category };
		});
		dbSegments.forEach((segment) => (segment.UUID = undefined));
		let res = await fetch(`${this.options.baseURL}/api/skipSegments`, {
			method: 'POST',
			body: JSON.stringify({ videoID, userID: this.userID, segments: dbSegments }),
			headers: { 'Content-Type': 'application/json' },
		});
		this.statusCheck(res);
		// returns nothing (status code 200)
	}

	// 3 GET /api/skipSegments/:sha256HashPrefix
	async getSegmentsPrivately(videoID: string, ...categories: Category[]): Promise<Video> {
		let hashPrefix = crypto.createHash('sha256').update(videoID).digest('hex').substr(0, this.options.hashPrefixLength);
		let query = '';
		if (categories.length > 0) {
			query += `?categories=${JSON.stringify(categories)}`;
		}
		let res = await fetch(`${this.options.baseURL}/api/skipSegments/${hashPrefix}${query}`);
		this.statusCheck(res);
		let filtered = ((await res.json()) as DBVideo[]).find((video) => video.videoID === videoID);
		if (!filtered) {
			throw new Error('Not found');
		}
		return dbvideoToVideo(filtered);
	}

	// 4 A POST or GET (legacy) /api/voteOnSponsorTime
	async vote(UUID: string, type: VoteType): Promise<void> {
		type = type === 'down' ? 0 : type === 'up' ? 1 : type;
		let query = `?UUID=${UUID}&userID=${this.userID}&type=${type}`;
		let res = await fetch(`${this.options.baseURL}/api/voteOnSponsorTime${query}`);
		this.statusCheck(res);
		// returns nothing (status code 200)
	}

	// 4 B POST or GET (legacy) /api/voteOnSponsorTime
	async voteCategory(UUID: string, category: Category): Promise<void> {
		let query = `?UUID=${UUID}&userID=${this.userID}&category=${category}`;
		let res = await fetch(`${this.options.baseURL}/api/voteOnSponsorTime${query}`);
		this.statusCheck(res);
		// returns nothing (status code 200)
	}

	// 5 POST or GET (legacy) /api/viewedVideoSponsorTime
	async viewed(UUID: string): Promise<void> {
		let res = await fetch(`${this.options.baseURL}/api/viewedVideoSponsorTime?UUID=${UUID}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
		});
		this.statusCheck(res);
		// returns nothing (status code 200)
	}

	// 6 GET /api/getViewsForUser
	async getViews(): Promise<number> {
		let res = await fetch(`${this.options.baseURL}/api/getViewsForUser?userID=${this.userID}`);
		this.statusCheck(res);
		let data = await res.json();
		return data.viewCount;
	}

	// 7 GET /api/getSavedTimeForUser
	async getTimeSaved(): Promise<number> {
		let res = await fetch(`${this.options.baseURL}/api/getSavedTimeForUser?userID=${this.userID}`);
		this.statusCheck(res);
		let data = await res.json();
		return data.timeSaved;
	}

	// 8 POST /api/setUsername
	async setUsername(username: string): Promise<void> {
		let res = await fetch(`${this.options.baseURL}/api/setUsername?userID=${this.userID}&username=${username}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
		});
		this.statusCheck(res);
		// returns nothing (status code 200)
	}

	// 9 GET /api/getUsername
	async getUsername(): Promise<string> {
		let res = await fetch(`${this.options.baseURL}/api/getUsername?userID=${this.userID}`);
		this.statusCheck(res);
		let data = await res.json();
		return data.userName;
	}

	// Stat Calls

	// 10 GET /api/getTopUsers
	async getTopUsers(sortType: SortType): Promise<UserStat[]> {
		sortType = sortType === 'minutesSaved' ? 0 : sortType === 'viewCount' ? 1 : sortType === 'totalSubmissions' ? 2 : sortType;
		let res = await fetch(`${this.options.baseURL}/api/getTopUsers?sortType=${sortType}`);
		this.statusCheck(res);
		return dbuserStatToUserStats(await res.json());
	}

	// 11 GET /api/getTotalStats
	async getOverallStats(): Promise<OverallStats> {
		let res = await fetch(`${this.options.baseURL}/api/getTotalStats`);
		this.statusCheck(res);
		return await res.json();
	}

	// 12 GET /api/getDaysSavedFormatted
	async getDaysSaved(): Promise<number> {
		let res = await fetch(`${this.options.baseURL}/api/getDaysSavedFormatted`);
		this.statusCheck(res);
		let data = await res.json();
		return parseFloat(data.daysSaved);
	}

	// 13 GET /api/isUserVIP
	async isVIP(): Promise<boolean> {
		let res = await fetch(`${this.options.baseURL}/api/isUserVIP?userID=${this.userID}`);
		this.statusCheck(res);
		return await res.json();
	}

	getHashedUserID(): string {
		return '';
	}

	// Legacy Calls
	/**
	 *
	 * @param videoID
	 * @deprecated This method is deprecated and should not be used.
	 */
	async legacyGetVideoSponsorTimes(videoID: string): Promise<{ sponsorTimes: number[]; UUIDs: string[] }> {
		let res = await fetch(`${this.options.baseURL}/api/getVideoponsorTimes?$videoID=${videoID}`);
		this.statusCheck(res);
		return await res.json();
	}

	/**
	 * Legacy API call to submit a sponsor segment, the segment's category will always be "sponsor"
	 * @param videoID
	 * @param startTime
	 * @param endTime
	 * @deprecated This method is deprecated and should not be used.
	 */
	async legacyPostVideoSponsorTimes(videoID: string, startTime: number, endTime: number) {
		let res = await fetch(`${this.options.baseURL}/api/postVideoponsorTimes?userID=${this.userID}&videoID=${videoID}`);
		this.statusCheck(res);
		return await res.json();
	}

	private statusCheck(res: Response) {
		if (res.status === 400) {
			throw new Error('Bad Request (Your inputs are wrong/impossible)');
		} else if (res.status == 403) {
			throw new Error('Rejected by auto moderator (Reason will be sent in the response)');
		} else if (res.status === 404) {
			throw new Error('Not Found');
		} else if (res.status === 405) {
			throw new Error('Duplicate');
		} else if (res.status === 409) {
			throw new Error('Duplicate');
		} else if (res.status === 429) {
			throw new Error('Rate Limit (Too many for the same user or IP)');
		} else if (res.status !== 200) {
			throw new Error(`Status code not 200 (${res.status})`);
		}
	}
}

// export class SponsorBlockVIP extends SponsorBlock {
// 	constructor(public userID: string, baseURL?: string) {
// 		super(userID, options.baseURL);
// 		this.isUserVIP().then((res) => res.vip || console.log('\x1b[31m%s\x1b[0m', 'User is not VIP, VIP methods will be unauthorized'));
// 	}
// 	// VIP Calls
// 	// 14 POST /api/noSegments
// 	async blockSubmissionsOfCategory(video: Video, ...categories: Category[]): Promise<void> {
// 		let res = await fetch(`${this.options.baseURL}/api/noSegments`, {
// 			method: 'POST',
// 			body: JSON.stringify({ videoID: video.videoID, userID: this.userID, categories }),
// 			headers: { 'Content-Type': 'application/json' },
// 		});
// 		if (res.status == 400) {
// 			throw new Error('Bad Request (Your inputs are wrong/impossible)');
// 		} else if (res.status == 403) {
// 			throw new Error('Unauthorized (You are not a VIP)');
// 		} else if (res.status != 200) {
// 			throw new Error(`Status code not 200 (${res.status})`);
// 		}
// 		// returns nothing (status code 200)
// 	}

// 	// 15 POST /api/shadowBanUser
// 	async shadowBanUser(publicUserID: string, enabled: boolean, unHideOldSubmissions: boolean): Promise<void> {
// 		let res = await fetch(`${this.options.baseURL}/api/shadowBanUser?userID=${publicUserID}&adminUserID=${this.userID}&enabled=${enabled}&unHideOldSubmissions=${unHideOldSubmissions}`, {
// 			method: 'POST',
// 			headers: { 'Content-Type': 'application/json' },
// 		});
// 		if (res.status == 400) {
// 			throw new Error('Bad Request (Your inputs are wrong/impossible)');
// 		} else if (res.status == 403) {
// 			throw new Error('Unauthorized (You are not a VIP)');
// 		} else if (res.status != 200) {
// 			throw new Error(`Status code not 200 (${res.status})`);
// 		}
// 		// returns nothing (status code 200)
// 	}

// 	// 16 POST /api/warnUser
// 	async warnUser(publicUserID: string, enabled?: boolean): Promise<void> {
// 		let res = await fetch(`${this.options.baseURL}/api/warnUser`, {
// 			method: 'POST',
// 			body: JSON.stringify({ issuerUserID: this.userID, userID: publicUserID, enabled }),
// 			headers: { 'Content-Type': 'application/json' },
// 		});
// 		if (res.status == 400) {
// 			throw new Error('Bad Request (Your inputs are wrong/impossible)');
// 		} else if (res.status == 403) {
// 			throw new Error('Unauthorized (You are not a VIP)');
// 		} else if (res.status != 200) {
// 			throw new Error(`Status code not 200 (${res.status})`);
// 		}
// 		// returns nothing (status code 200)
// 	}
// }

// export class SponsorBlockAdmin extends SponsorBlockVIP {
// 	// Admin Calls
// 	// 17 POST /api/addUserAsVIP
// 	async addVIP(publicUserID: string, enabled?: boolean): Promise<void> {
// 		let res = await fetch(`${this.options.baseURL}/api/warnUser`, {
// 			method: 'POST',
// 			body: JSON.stringify({ adminUserID: this.userID, userID: publicUserID, enabled }),
// 			headers: { 'Content-Type': 'application/json' },
// 		});
// 		if (res.status == 400) {
// 			throw new Error('Bad Request (Your inputs are wrong/impossible)');
// 		} else if (res.status == 403) {
// 			throw new Error('Unauthorized (You are not an admin)');
// 		} else if (res.status != 200) {
// 			throw new Error(`Status code not 200 (${res.status})`);
// 		}
// 		// returns nothing (status code 200)
// 	}
// }

interface API {
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
	vote(UUID: string, type: 'down' | 'up' | 0 | 1): Promise<void>;

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

type VoteType = 'down' | 'up' | 0 | 1;

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

type PrefixRange = 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32;
