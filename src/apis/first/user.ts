import fetch from 'cross-fetch';
import crypto from 'crypto';
import { Segment } from '../../types/segment/Segment';
import { Category } from '../../types/segment/Category';
import { LocalSegment } from '../../types/segment/LocalSegment';
import { UserStats } from '../../types/stats/UserStat';
import { OverallStats } from '../../types/stats/OverallStats';
import { defaultOptions } from '../../index';
import { dbuserStatsToUserStats, resolveSegment, resolveVideo, SegmentResolvable, VideoResolvable } from './utils';
import { SponsorBlockAPI, SponsorBlockOptions } from '../interfaces';
import { VoteType } from '../../types/vote/VoteType';
import { statusCheck } from '../utils';
import { SortType } from '../../types/stats/SortType';

/**
 * SponsorBlock API class, to be constructed with a userID.
 *
 * @description Complete API documentation can be found {@link https://github.com/ajayyy/SponsorBlock/wiki/API-Docs here}.
 * Please review the {@link https://gist.github.com/ajayyy/4b27dfc66e33941a45aeaadccb51de71 attriution template}
 * to abide the {@link https://github.com/ajayyy/SponsorBlock/wiki/Database-and-API-License license}.
 */
export class SponsorBlock implements SponsorBlockAPI {
	constructor(public userID: string, public options: SponsorBlockOptions = {}) {
		this.options = { ...defaultOptions, ...options };
	}

	private hashedUserID: string;

	async getSegments(video: VideoResolvable, ...categories: Category[]): Promise<Segment[]> {
		let videoID = resolveVideo(video);
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

	async postSegments(video: VideoResolvable, ...segments: LocalSegment[]): Promise<void> {
		let videoID = resolveVideo(video);
		let dbSegments = segments.map((segment: LocalSegment) => {
			// turn segments to objects the api accepts
			let { startTime, endTime, category } = segment;
			return { segment: [startTime, endTime], category };
		});
		let res = await fetch(`${this.options.baseURL}/api/skipSegments`, {
			method: 'POST',
			body: JSON.stringify({ videoID, userID: this.userID, segments: dbSegments }),
			headers: { 'Content-Type': 'application/json' },
		});
		statusCheck(res);
		// returns nothing (status code 200)
	}

	async getSegmentsPrivately(video: VideoResolvable, ...categories: Category[]): Promise<Segment[]> {
		let videoID = resolveVideo(video);
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
			throw new Error('[SponsorBlock] Not found within returned videos');
		}
		let segments = filtered.segments.map((val) => {
			return { UUID: val.UUID, startTime: val.segment[0], endTime: val.segment[1], category: val.category };
		});
		return segments;
	}

	// async vote(segment: Segment, type: VoteType): Promise<void>;
	// async vote(UUID: string, type: VoteType): Promise<void>;
	async vote(segment: SegmentResolvable, type: VoteType): Promise<void> {
		let UUID = resolveSegment(segment);
		type = type === 'down' ? 0 : type === 'up' ? 1 : type;
		let query = `?UUID=${UUID}&userID=${this.userID}&type=${type}`;
		let res = await fetch(`${this.options.baseURL}/api/voteOnSponsorTime${query}`);
		statusCheck(res);
		// returns nothing (status code 200)
	}

	// async voteCategory(segment: Segment, category: Category): Promise<void>;
	// async voteCategory(UUID: string, category: Category): Promise<void>;
	async voteCategory(segment: SegmentResolvable, category: Category): Promise<void> {
		let UUID = resolveSegment(segment);
		let query = `?UUID=${UUID}&userID=${this.userID}&category=${category}`;
		let res = await fetch(`${this.options.baseURL}/api/voteOnSponsorTime${query}`);
		statusCheck(res);
		// returns nothing (status code 200)
	}

	async viewed(segment: SegmentResolvable): Promise<void> {
		let UUID = resolveSegment(segment);
		let res = await fetch(`${this.options.baseURL}/api/viewedVideoSponsorTime?UUID=${UUID}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
		});
		statusCheck(res);
		// returns nothing (status code 200)
	}

	async getViews(): Promise<number> {
		let res = await fetch(`${this.options.baseURL}/api/getViewsForUser?userID=${this.userID}`);
		statusCheck(res);
		let data = await res.json();
		return data.viewCount;
	}

	async getTimeSaved(): Promise<number> {
		let res = await fetch(`${this.options.baseURL}/api/getSavedTimeForUser?userID=${this.userID}`);
		statusCheck(res);
		let data = await res.json();
		return data.timeSaved;
	}

	async setUsername(username: string): Promise<void> {
		let res = await fetch(`${this.options.baseURL}/api/setUsername?userID=${this.userID}&username=${username}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
		});
		statusCheck(res);
		// returns nothing (status code 200)
	}

	async getUsername(): Promise<string> {
		let res = await fetch(`${this.options.baseURL}/api/getUsername?userID=${this.userID}`);
		statusCheck(res);
		let data = await res.json();
		return data.userName;
	}

	async getTopUsers(sortType: SortType): Promise<UserStats[]> {
		sortType = sortType === 'minutesSaved' ? 0 : sortType === 'viewCount' ? 1 : sortType === 'totalSubmissions' ? 2 : sortType;
		let res = await fetch(`${this.options.baseURL}/api/getTopUsers?sortType=${sortType}`);
		statusCheck(res);
		return dbuserStatsToUserStats(await res.json());
	}

	async getOverallStats(): Promise<OverallStats> {
		let res = await fetch(`${this.options.baseURL}/api/getTotalStats`);
		statusCheck(res);
		return await res.json();
	}

	async getDaysSaved(): Promise<number> {
		let res = await fetch(`${this.options.baseURL}/api/getDaysSavedFormatted`);
		statusCheck(res);
		let data = await res.json();
		return parseFloat(data.daysSaved);
	}

	async isVIP(): Promise<boolean> {
		let res = await fetch(`${this.options.baseURL}/api/isUserVIP?userID=${this.userID}`);
		statusCheck(res);
		return (await res.json()).vip;
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
