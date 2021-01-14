import { Category, Segment } from 'src/types/segment.model';
import { SponsorBlock, SponsorBlockOptions, VoteType } from '../index';
import crypto from 'crypto';
import { Video } from 'src/types/video.model';
import { dbuserStatToUserStats, OverallStats, SortType, UserStat } from 'src/types/stats.model';

export default class SponsorBlockAPI implements SponsorBlock {
	constructor(public userID: string, public options: SponsorBlockOptions = {}) {
		options.baseURL = options.baseURL ?? 'https://sponsor.ajay.app';
		options.hashPrefixLength = options.hashPrefixLength ?? 4;
	}

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

		await res.json();
		return ((await res.json()) as { UUID: string; segment: [number, number]; category: Category }[]).map(({ UUID, segment, category }) => {
			return { UUID, startTime: segment[0], endTime: segment[1], category };
		});
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
		statusCheck(res);
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
		statusCheck(res);
		return await res.json();
	}
}
function statusCheck(res: Response) {
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
