import fetch, { Response } from 'node-fetch';
import { Category, Segment } from 'src/types/segment.model';
import { SponsorBlockAPI, SponsorBlockOptions, VoteType } from '../index';
import crypto from 'crypto';
import { dbuserStatToUserStats, OverallStats, SortType, UserStat } from '../types/stats.model';
import { Video } from 'src/types/video.model';
import { config } from '../index';

export default class SponsorBlock implements SponsorBlockAPI {
	constructor(public userID: string, public options: SponsorBlockOptions = {}) {
		options.baseURL = options.baseURL ?? config.baseURL;
		options.hashPrefixLength = options.hashPrefixLength ?? config.hashPrefixRecommendation;
	}

	private hashedUserID: string;

	/**
	 * Get the skip segments of the chosen categories for a video.
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
		statusCheck(res);
		let data = (await res.json()) as { UUID: string; segment: [number, number]; category: Category }[];
		let segments = data.map(({ UUID, segment, category }) => {
			return { UUID, startTime: segment[0], endTime: segment[1], category };
		});
		return segments;
	}

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
		statusCheck(res);
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
		statusCheck(res);
		let filtered = ((await res.json()) as { videoID: string; hash: string; segments: { UUID: string; segment: [number, number]; category: Category }[] }[]).find(
			(video) => video.videoID === videoID
		);
		if (!filtered) {
			throw new Error('Not found');
		}
		let segments = filtered.segments.map((val) => {
			return { UUID: val.UUID, startTime: val.segment[0], endTime: val.segment[1], category: val.category };
		});
		return { videoID: filtered.videoID, hash: filtered.hash, segments };
	}

	// 4 A POST or GET (legacy) /api/voteOnSponsorTime
	async vote(UUID: string, type: VoteType): Promise<void> {
		type = type === 'down' ? 0 : type === 'up' ? 1 : type;
		let query = `?UUID=${UUID}&userID=${this.userID}&type=${type}`;
		let res = await fetch(`${this.options.baseURL}/api/voteOnSponsorTime${query}`);
		statusCheck(res);
		// returns nothing (status code 200)
	}

	// 4 B POST or GET (legacy) /api/voteOnSponsorTime
	async voteCategory(UUID: string, category: Category): Promise<void> {
		let query = `?UUID=${UUID}&userID=${this.userID}&category=${category}`;
		let res = await fetch(`${this.options.baseURL}/api/voteOnSponsorTime${query}`);
		statusCheck(res);
		// returns nothing (status code 200)
	}

	// 5 POST or GET (legacy) /api/viewedVideoSponsorTime
	async viewed(UUID: string): Promise<void> {
		let res = await fetch(`${this.options.baseURL}/api/viewedVideoSponsorTime?UUID=${UUID}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
		});
		statusCheck(res);
		// returns nothing (status code 200)
	}

	// 6 GET /api/getViewsForUser
	async getViews(): Promise<number> {
		let res = await fetch(`${this.options.baseURL}/api/getViewsForUser?userID=${this.userID}`);
		statusCheck(res);
		let data = await res.json();
		return data.viewCount;
	}

	// 7 GET /api/getSavedTimeForUser
	async getTimeSaved(): Promise<number> {
		let res = await fetch(`${this.options.baseURL}/api/getSavedTimeForUser?userID=${this.userID}`);
		statusCheck(res);
		let data = await res.json();
		return data.timeSaved;
	}

	// 8 POST /api/setUsername
	async setUsername(username: string): Promise<void> {
		let res = await fetch(`${this.options.baseURL}/api/setUsername?userID=${this.userID}&username=${username}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
		});
		statusCheck(res);
		// returns nothing (status code 200)
	}

	// 9 GET /api/getUsername
	async getUsername(): Promise<string> {
		let res = await fetch(`${this.options.baseURL}/api/getUsername?userID=${this.userID}`);
		statusCheck(res);
		let data = await res.json();
		return data.userName;
	}

	// Stat Calls

	// 10 GET /api/getTopUsers
	async getTopUsers(sortType: SortType): Promise<UserStat[]> {
		sortType = sortType === 'minutesSaved' ? 0 : sortType === 'viewCount' ? 1 : sortType === 'totalSubmissions' ? 2 : sortType;
		let res = await fetch(`${this.options.baseURL}/api/getTopUsers?sortType=${sortType}`);
		statusCheck(res);
		return dbuserStatToUserStats(await res.json());
	}

	// 11 GET /api/getTotalStats
	async getOverallStats(): Promise<OverallStats> {
		let res = await fetch(`${this.options.baseURL}/api/getTotalStats`);
		statusCheck(res);
		return await res.json();
	}

	// 12 GET /api/getDaysSavedFormatted
	async getDaysSaved(): Promise<number> {
		let res = await fetch(`${this.options.baseURL}/api/getDaysSavedFormatted`);
		statusCheck(res);
		let data = await res.json();
		return parseFloat(data.daysSaved);
	}

	// 13 GET /api/isUserVIP
	async isVIP(): Promise<boolean> {
		let res = await fetch(`${this.options.baseURL}/api/isUserVIP?userID=${this.userID}`);
		statusCheck(res);
		return (await res.json()).vip
	}

	getHashedUserID(): string {
		if (this.hashedUserID) return this.hashedUserID;
		let value = this.userID;
		for (let i = 0; i < 5000; i++) {
			value = crypto.createHash('sha256').update(value).digest('hex');
		}
		return (this.hashedUserID = value);
	}
}

export class SponsorBlockVIP extends SponsorBlock {
	constructor(public userID: string, public options: SponsorBlockOptions = {}) {
		super(userID, options);
		this.isVIP().then((res) => res || console.info('\x1b[31m%s\x1b[0m', 'User is not VIP, VIP methods will be unauthorized'));
	}

	// VIP Calls
	// 14 POST /api/noSegments
	async blockSubmissionsOfCategory(video: Video, ...categories: Category[]): Promise<void> {
		let res = await fetch(`${this.options.baseURL}/api/noSegments`, {
			method: 'POST',
			body: JSON.stringify({ videoID: video.videoID, userID: this.userID, categories }),
			headers: { 'Content-Type': 'application/json' },
		});
		if (res.status == 400) {
			throw new Error('Bad Request (Your inputs are wrong/impossible)');
		} else if (res.status == 403) {
			throw new Error('Unauthorized (You are not a VIP)');
		} else if (res.status != 200) {
			throw new Error(`Status code not 200 (${res.status})`);
		}
		// returns nothing (status code 200)
	}

	// 15 POST /api/shadowBanUser
	async shadowBanUser(publicUserID: string, enabled: boolean, unHideOldSubmissions: boolean): Promise<void> {
		let res = await fetch(
			`${this.options.baseURL}/api/shadowBanUser?userID=${publicUserID}&adminUserID=${this.userID}&enabled=${enabled}&unHideOldSubmissions=${unHideOldSubmissions}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			}
		);
		if (res.status == 400) {
			throw new Error('Bad Request (Your inputs are wrong/impossible)');
		} else if (res.status == 403) {
			throw new Error('Unauthorized (You are not a VIP)');
		} else if (res.status != 200) {
			throw new Error(`Status code not 200 (${res.status})`);
		}
		// returns nothing (status code 200)
	}

	// 16 POST /api/warnUser
	async warnUser(publicUserID: string, enabled?: boolean): Promise<void> {
		let res = await fetch(`${this.options.baseURL}/api/warnUser`, {
			method: 'POST',
			body: JSON.stringify({ issuerUserID: this.userID, userID: publicUserID, enabled }),
			headers: { 'Content-Type': 'application/json' },
		});
		if (res.status == 400) {
			throw new Error('Bad Request (Your inputs are wrong/impossible)');
		} else if (res.status == 403) {
			throw new Error('Unauthorized (You are not a VIP)');
		} else if (res.status != 200) {
			throw new Error(`Status code not 200 (${res.status})`);
		}
		// returns nothing (status code 200)
	}
}

export class SponsorBlockAdmin extends SponsorBlockVIP {
	// Admin Calls
	// 17 POST /api/addUserAsVIP
	async addVIP(publicUserID: string, enabled?: boolean): Promise<void> {
		let res = await fetch(`${this.options.baseURL}/api/warnUser`, {
			method: 'POST',
			body: JSON.stringify({ adminUserID: this.userID, userID: publicUserID, enabled }),
			headers: { 'Content-Type': 'application/json' },
		});
		if (res.status == 400) {
			throw new Error('Bad Request (Your inputs are wrong/impossible)');
		} else if (res.status == 403) {
			throw new Error('Unauthorized (You are not an admin)');
		} else if (res.status != 200) {
			throw new Error(`Status code not 200 (${res.status})`);
		}
		// returns nothing (status code 200)
	}
}

function statusCheck(res: Response) {
	if (res.status !== 200) {
		if (res.status === 400) {
			throw new ResponseError(400, 'Bad Request (Your inputs are wrong/impossible)');
		} else if (res.status == 403) {
			throw new ResponseError(403, 'Rejected by auto moderator (Reason will be sent in the response)');
		} else if (res.status === 404) {
			throw new ResponseError(404, 'Not Found');
		} else if (res.status === 405) {
			throw new ResponseError(405, 'Duplicate');
		} else if (res.status === 409) {
			throw new ResponseError(409, 'Duplicate');
		} else if (res.status === 429) {
			throw new ResponseError(429, 'Rate Limit (Too many for the same user or IP)');
		} else {
			throw new ResponseError(res.status, `Status code not 200 (${res.status})`);
		}
	}
}

class ResponseError extends Error {
	constructor(public status: number, message?: string) {
		super(message);
		this.name = 'ResponseError';
	}
}
