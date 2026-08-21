import axios, { Axios } from 'axios'
import crypto from 'crypto';
import { Segment, SegmentResolvable } from '../../types/segment/Segment';
import { Category } from '../../types/segment/Category';
import { LocalSegment } from '../../types/segment/LocalSegment';
import { UserStats } from '../../types/stats/UserStat';
import { OverallStats } from '../../types/stats/OverallStats';
import { defaultOptions } from '../../index';
import { SponsorBlockInterface } from '../interfaces/user';
import { SponsorBlockOptions } from '../../types/SponsorBlockOptions';
import { VoteType } from '../../types/vote/VoteType';
import { dbuserStatsToUserStats, resolveSegment, resolveVideo, statusCheck } from '../utils';
import { SortType } from '../../types/stats/SortType';
import { SegmentInfo } from '../../types/stats/SegmentInfo';
import { UserIDPair } from '../../types/user';
import { VideoResolvable } from '../../types/Video';

/**
 * SponsorBlock API class, to be constructed with a userID.
 *
 * @description Complete API documentation can be found {@link https://wiki.sponsor.ajay.app/index.php/API_Docs here}.
 * Please review the {@link https://gist.github.com/ajayyy/4b27dfc66e33941a45aeaadccb51de71 attriution template}
 * to abide the {@link https://github.com/ajayyy/SponsorBlock/wiki/Database-and-API-License license}.
 */
export class SponsorBlock implements SponsorBlockInterface {

	protected http: Axios;
	private hashedUserID: string;
	
	constructor(public userID: string, public options: SponsorBlockOptions = {}) {
		if (options.baseURL?.endsWith('/')) options.baseURL = options.baseURL.slice(0, -1);
		this.options = { ...defaultOptions, ...options };
		this.http = axios.create({ baseURL: this.options.baseURL, validateStatus: null });
	}

	async getSegments(video: VideoResolvable, categories: Category[] = ['sponsor'], ...requiredSegments: string[]): Promise<Segment[]> {
		const videoID = resolveVideo(video);
		const res = await this.http.get('/api/skipSegments', { params: { videoID, service: this.options.service, categories: JSON.stringify(categories), ...(requiredSegments.length && { requiredSegments }) } })
		statusCheck(res);
		const data = res.data as { UUID: string; segment: [number, number]; category: Category; videoDuration: number }[];
		const segments = data.map(({ UUID, segment, category, videoDuration }) => {
			return { UUID, startTime: segment[0], endTime: segment[1], category, videoDuration };
		});
		return segments;
	}

	async postSegments(video: VideoResolvable, ...segments: LocalSegment[]): Promise<void> {
		const videoID = resolveVideo(video);
		const userAgent = this.options.userAgent;
		const dbSegments = segments.map((segment) => {
			// turn segments to objects the api accepts
			const { startTime, endTime, category } = segment;
			return { segment: [startTime, endTime], category };
		});
		const res = await this.http.post('/api/skipSegments', { videoID, userID: this.userID, segments: dbSegments, userAgent })
		statusCheck(res);
		// returns nothing (status code 200)
	}

	async getSegmentsPrivately(video: VideoResolvable, categories: Category[] = ['sponsor'], ...requiredSegments: string[]): Promise<Segment[]> {
		const videoID = resolveVideo(video);
		const hashPrefix = crypto.createHash('sha256').update(videoID).digest('hex').substr(0, this.options.hashPrefixLength);
		let query = `?service=${this.options.service}&categories=${JSON.stringify(categories)}`;
		if (requiredSegments.length > 0) {
			query += `&requiredSegments=${JSON.stringify(requiredSegments)}`;
		}
		const res = await this.http.get(`/api/skipSegments/${hashPrefix}`)
		statusCheck(res);
		const filtered = (
			res.data as { videoID: string; hash: string; segments: { UUID: string; segment: [number, number]; category: Category; videoDuration: number }[] }[]
		).find((video) => video.videoID === videoID);
		if (!filtered) {
			throw new Error('[SponsorBlock] Not found within returned videos');
		}
		const segments = filtered.segments.map((val) => {
			return { UUID: val.UUID, startTime: val.segment[0], endTime: val.segment[1], category: val.category, videoDuration: val.videoDuration };
		});
		return segments;
	}

	async vote(segment: SegmentResolvable, type: VoteType): Promise<void> {
		const UUID = resolveSegment(segment);
		type = type === 'down' ? 0 : type === 'up' ? 1 : type === 'undo' ? 20 : type;
		const res = await this.http.get('/api/voteOnSponsorTime', { params: { UUID, userID: this.userID, type } })
		statusCheck(res);
		// returns nothing (status code 200)
	}

	async voteCategory(segment: SegmentResolvable, category: Category): Promise<void> {
		const UUID = resolveSegment(segment);
		const res = await this.http.get('/api/voteOnSponsorTime', { params: { UUID, userID: this.userID, category } })
		statusCheck(res);
		// returns nothing (status code 200)
	}

	async viewed(segment: SegmentResolvable): Promise<void> {
		const UUID = resolveSegment(segment);
		const res = await this.http.get('/api/viewedVideoSponsorTime', { params: { UUID } })
		statusCheck(res);
		// returns nothing (status code 200)
	}

	async getViews(): Promise<number> {
		const res = await this.http.get('/api/getViewsForUser', { params: { userID: this.userID } })
		statusCheck(res);
		const data = res.data;
		return data.viewCount;
	}

	async getTimeSaved(): Promise<number> {
		const res = await this.http.get('/api/getSavedTimeForUser', { params: { userID: this.userID } })
		statusCheck(res);
		const data = res.data;
		return data.timeSaved;
	}

	async setUsername(username: string): Promise<void> {
		const res = await this.http.get('/api/setUsername', { params: { userID: this.userID, username } })
		statusCheck(res);
		// returns nothing (status code 200)
	}

	async getUsername(): Promise<string> {
		const res = await this.http.get('/api/getUsername', { params: { userID: this.userID } })
		statusCheck(res);
		const data = res.data;
		return data.userName;
	}

	async getTopUsers(sortType: SortType): Promise<UserStats[]> {
		sortType = sortType === 'minutesSaved' ? 0 : sortType === 'viewCount' ? 1 : sortType === 'totalSubmissions' ? 2 : sortType;
		const res = await this.http.get('/api/getTopUsers', { params: { sortType } })
		statusCheck(res);
		return dbuserStatsToUserStats(res.data);
	}

	async getOverallStats(): Promise<OverallStats> {
		const res = await this.http.get('/api/getTotalStats')
		statusCheck(res);
		return res.data;
	}

	async getDaysSaved(): Promise<number> {
		const res = await this.http.get('/api/getDaysSavedFormatted')
		statusCheck(res);
		const data = res.data;
		return parseFloat(data.daysSaved);
	}

	async isVIP(): Promise<boolean> {
		const res = await this.http.get('/api/isUserVIP', { params: { userID: this.userID }})
		statusCheck(res);
		return res.data.vip;
	}

	getHashedUserID(): string {
		if (this.hashedUserID) return this.hashedUserID;
		let value = this.userID;
		for (let i = 0; i < 5000; i++) {
			value = crypto.createHash('sha256').update(value).digest('hex');
		}
		return (this.hashedUserID = value);
	}

	async getSegmentInfo(segments: SegmentResolvable[]): Promise<SegmentInfo[]> {
		const UUIDs = segments.map((segment) => resolveSegment(segment));
		const res = await this.http.get('/api/segmentInfo', { params: { UUIDs: JSON.stringify(UUIDs) } })
		statusCheck(res);
		return res.data;
	}

	async getUserID(username: string, exact: boolean = false): Promise<UserIDPair[]> {
		const res = await this.http.get('/api/userID', { params: { username } })
		statusCheck(res);
		return res.data;
	}

	async getLockCategories(video: VideoResolvable): Promise<Category[]> {
		const videoID = resolveVideo(video);
		const res = await this.http.get('/api/lockCategories', { params: { videoID } })
		statusCheck(res);
		return res.data.categories;
	}

	async getLockCategoriesPrivately(video: VideoResolvable): Promise<Category[]> {
		const videoID = resolveVideo(video);
		const hashPrefix = crypto.createHash('sha256').update(videoID).digest('hex').substr(0, this.options.hashPrefixLength);
		const res = await this.http.get(`/api/skipSegments/${hashPrefix}`)
		statusCheck(res);
		const filtered = (res.data as { videoID: string; hash: string; categories: Category[] }[]).find((video) => video.videoID === videoID);
		if (!filtered) {
			throw new Error('[SponsorBlock] Not found within returned videos');
		}
		return filtered.categories;
	}
}
