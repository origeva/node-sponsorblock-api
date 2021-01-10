import fetch, { Response } from 'node-fetch';
import config from './config.json';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { Segment, DBSegment, Category, dbsegmentToSegment, segmentsToDBSegments } from './types/segment.model';
import { Vote, CategoryVote } from './types/vote.model';
import { DBVideo, dbvideoToVideo, Video } from './types/video.model';
import { dbuserStatToUserStats, OverallStats, UserStat } from './types/stats.model';

// interface SponsorBlockInterface {
// 	getSegments(videoID: string, ...categories: Category[]): Promise<Segment[]>;
// 	submitSegment(segment: Segment): Promise<void>;
// }

/**
 * SponsorBlock API class, to be constructed with a userID.
 * Complete API documentation can be found {@link https://github.com/ajayyy/SponsorBlock/wiki/API-Docs here}
 */
export default class SponsorBlock {
	constructor(public userID: string, baseURL?: string) {
		this.baseURL = baseURL || config.baseURL;
	}

	static newUser(): SponsorBlock {
		let newUserID = uuidv4();
		console.info(
			'\x1b[36m%s\x1b[0m',
			`Make sure to save your userID for use in API requests to keep track of stats: ${newUserID}\nYou can access your userID using sponsorBlock.userID`
		);
		return new SponsorBlock(newUserID);
	}

	baseURL: string;

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
		let res = await fetch(`${this.baseURL}/api/skipSegments${query}`);
		this.statusCheck(res);

		return (await res.json()).map(dbsegmentToSegment);
	}

	// 2 A POST /api/skipSegments
	async postSegment(videoID: string, segment: Segment): Promise<void> {
		let res = await fetch(
			`${this.baseURL}/api/skipSegments?videoID=${videoID}&startTime=${segment.startTime}&endTime=${segment.endTime}&category=${segment.category}&userID=${this.userID}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			}
		);
		this.statusCheck(res);
		// returns nothing (status code 200)
	}

	// 2 B POST /api/skipSegments
	async postSegments(videoID: string, ...segments: Segment[]): Promise<void> {
		segments.map(segmentsToDBSegments).forEach((segment) => (segment.UUID = undefined));
		let res = await fetch(`${this.baseURL}/api/skipSegments`, {
			method: 'POST',
			body: JSON.stringify({ videoID, userID: this.userID, segments }),
			headers: { 'Content-Type': 'application/json' },
		});
		this.statusCheck(res);
		// returns nothing (status code 200)
	}

	// 3 GET /api/skipSegments/:sha256HashPrefix
	async getSegmentsPrivately(videoID: string, prefixLength: PrefixRange = config.hashPrefixRecommendation as PrefixRange, ...categories: Category[]): Promise<Video> {
		let hashPrefix = crypto.createHash('sha256').update(videoID).digest('hex').substr(0, prefixLength);
		let query = '';
		if (categories.length > 0) {
			query += `?categories=${JSON.stringify(categories)}`;
		}
		let res = await fetch(`${this.baseURL}/api/skipSegments/${hashPrefix}${query}`);
		this.statusCheck(res);
		return dbvideoToVideo(((await res.json()) as DBVideo[]).find((video) => video.videoID === videoID) as DBVideo);
	}

	// 4 A POST or GET (legacy) /api/voteOnSponsorTime
	async postNormalVote(vote: Vote): Promise<void> {
		vote.type = vote.type === 'down' ? 0 : vote.type === 'up' ? 1 : vote.type;
		let query = `?UUID=${vote.UUID}&userID=${this.userID}&type=${vote.type}`;
		let res = await fetch(`${this.baseURL}/api/voteOnSponsorTime${query}`);
		this.statusCheck(res);
		// returns nothing (status code 200)
	}

	// 4 B POST or GET (legacy) /api/voteOnSponsorTime
	async postCategoryVote(vote: CategoryVote): Promise<void> {
		let query = `?UUID=${vote.UUID}&userID=${this.userID}&category=${vote.category}`;
		let res = await fetch(`${this.baseURL}/api/voteOnSponsorTime${query}`);
		this.statusCheck(res);
		// returns nothing (status code 200)
	}

	// 5 POST or GET (legacy) /api/viewedVideoSponsorTime
	async viewdVideoSponsorTime(segment: Segment): Promise<void> {
		let res = await fetch(`${this.baseURL}/api/viewedVideoSponsorTime?UUID=${segment.UUID}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
		});
		this.statusCheck(res);
		// returns nothing (status code 200)
	}

	// 6 GET /api/getViewsForUser
	async getViews(): Promise<number> {
		let res = await fetch(`${this.baseURL}/api/getViewsForUser?userID=${this.userID}`);
		this.statusCheck(res);
		let data = await res.json();
		return data.viewCount;
	}

	// 7 GET /api/getSavedTimeForUser
	async getSavedTime(): Promise<number> {
		let res = await fetch(`${this.baseURL}/api/getSavedTimeForUser?userID=${this.userID}`);
		this.statusCheck(res);
		let data = await res.json();
		return data.timeSaved;
	}

	// 8 POST /api/setUsername
	async setUsername(username: string): Promise<void> {
		let res = await fetch(`${this.baseURL}/api/setUsername?userID=${this.userID}&username=${username}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
		});
		this.statusCheck(res);
		// returns nothing (status code 200)
	}

	// 9 GET /api/getUsername
	async getUsername(): Promise<string> {
		let res = await fetch(`${this.baseURL}/api/getUsername?userID=${this.userID}`);
		this.statusCheck(res);
		let data = await res.json();
		return data.userName;
	}

	// Stat Calls

	// 10 GET /api/getTopUsers
	async getTopUsers(sortType: SortType): Promise<UserStat[]> {
		sortType = sortType === 'minutesSaved' ? 0 : sortType === 'viewCount' ? 1 : sortType === 'totalSubmissions' ? 2 : sortType;
		let res = await fetch(`${this.baseURL}/api/getTopUsers?sortType=${sortType}`);
		this.statusCheck(res);
		return dbuserStatToUserStats(await res.json());
	}

	// 11 GET /api/getTotalStats
	async getTotalStats(): Promise<OverallStats> {
		let res = await fetch(`${this.baseURL}/api/getTotalStats`);
		this.statusCheck(res);
		return await res.json();
	}

	// 12 GET /api/getDaysSavedFormatted
	async getDaysSavedFormatted(): Promise<number> {
		let res = await fetch(`${this.baseURL}/api/getDaysSavedFormatted`);
		this.statusCheck(res);
		let data = await res.json();
		return data.daysSaved;
	}

	// 13 GET /api/isUserVIP
	async isUserVIP(): Promise<{ hashedUserID: string; vip: boolean }> {
		let res = await fetch(`${this.baseURL}/api/isUserVIP?userID=${this.userID}`);
		this.statusCheck(res);
		return await res.json();
	}

	// Legacy Calls
	/**
	 *
	 * @param videoID
	 * @deprecated This method is deprecated and should not be used.
	 */
	async legacyGetVideoSponsorTimes(videoID: string): Promise<{ sponsorTimes: number[]; UUIDs: string[] }> {
		let res = await fetch(`${this.baseURL}/api/getVideoponsorTimes?$videoID=${videoID}`);
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
	// Is the submitted category "sponsor"? <===========
	async legacyPostVideoSponsorTimes(videoID: string, startTime: number, endTime: number) {
		let res = await fetch(`${this.baseURL}/api/postVideoponsorTimes?userID=${this.userID}&videoID=${videoID}`);
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

export class SponsorBlockVIP extends SponsorBlock {
	constructor(public userID: string, baseURL?: string) {
		super(userID, baseURL);
		this.isUserVIP().then((res) => res.vip || console.log('\x1b[31m%s\x1b[0m', 'User is not VIP, VIP methods will be unauthorized'));
	}
	// VIP Calls
	// 14 POST /api/noSegments
	async blockSubmissionsOfCategory(video: Video, ...categories: Category[]): Promise<void> {
		let res = await fetch(`${this.baseURL}/api/noSegments`, {
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
		let res = await fetch(`${this.baseURL}/api/shadowBanUser?userID=${publicUserID}&adminUserID=${this.userID}&enabled=${enabled}&unHideOldSubmissions=${unHideOldSubmissions}`, {
			method: 'POST',
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

	// 16 POST /api/warnUser
	async warnUser(publicUserID: string, enabled?: boolean): Promise<void> {
		let res = await fetch(`${this.baseURL}/api/warnUser`, {
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
		let res = await fetch(`${this.baseURL}/api/warnUser`, {
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

export type SortType = 'minutesSaved' | 'viewCount' | 'totalSubmissions' | 0 | 1 | 2;

export type PrefixRange = 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32;
