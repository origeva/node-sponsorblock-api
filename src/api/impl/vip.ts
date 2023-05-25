import axios from 'axios';
import { Category } from '../../types/segment/Category';
import { SponsorBlockOptions } from '../../types/SponsorBlockOptions';
import { SponsorBlock } from './user';
import { SponsorBlockVIPInterface } from '../interfaces/vip';
import { resolveVideo, statusCheck } from '../utils';
import { VideoResolvable } from '../../types/Video';

export class SponsorBlockVIP extends SponsorBlock implements SponsorBlockVIPInterface {
	constructor(public userID: string, public options: SponsorBlockOptions = {}) {
		super(userID, options);
		this.isVIP().then((result) => result || console.info('\x1b[31m%s\x1b[0m', 'User is not VIP, VIP methods will be unauthorized'));
	}

	async blockSubmissionsOfCategory(video: VideoResolvable, ...categories: Category[]): Promise<void> {
		let videoID = resolveVideo(video);
		let res = await axios.post('/api/noSegments', { videoID, userID: this.userID, categories }, { baseURL: this.options.baseURL, validateStatus: null })
		statusCheck(res);
		// returns nothing (status code 200)
	}

	async shadowBan(publicUserID: string, hideOldSubmissions?: boolean): Promise<void> {
		let res = await axios.post('/api/shadowBanUser', null, { params: { userID: publicUserID, adminUserID: this.userID, unHideOldSubmissions: hideOldSubmissions ?? false }, baseURL: this.options.baseURL, validateStatus: null })
		statusCheck(res);
		// returns nothing (status code 200)
	}

	async removeShadowBan(publicUserID: string): Promise<void> {
		let res = await axios.post('/api/shadowBanUser', null, { params: { userID: publicUserID, adminUserID: this.userID, enabled: false }, baseURL: this.options.baseURL, validateStatus: null })
		statusCheck(res);
		// returns nothing (status code 200)
	}

	async hideOldSubmissions(publicUserID: string): Promise<void> {
		let res = await axios.post('/api/shadowBanUser' , null, { params: { userID: publicUserID, adminUserID: this.userID, enabled: true, unHideOldSubmissions: true }, baseURL: this.options.baseURL, validateStatus: null })
		statusCheck(res);
		// returns nothing (status code 200)
	}

	async warnUser(publicUserID: string, reason: string = '', enabled?: boolean): Promise<void> {
		let res = await axios.post('/api/warnUser', { issuerUserID: this.userID, userID: publicUserID, enabled, reason }, { baseURL: this.options.baseURL, validateStatus: null })
		statusCheck(res);
		// returns nothing (status code 200)
	}

	async clearCache(video: VideoResolvable): Promise<void> {
		let videoID = resolveVideo(video);
		let res = await axios.get('/api/clearCache?videoID', { params: { videoID, userID: this.userID }, baseURL: this.options.baseURL, validateStatus: null })
		// let res = await fetch(`${this.options.baseURL}/api/clearCache?videoID=${videoID}&userID=${this.userID}`);
		statusCheck(res);
		// returns nothing (status code 200)
	}

	async purgeAllSegments(video: VideoResolvable): Promise<void> {
		let videoID = resolveVideo(video);
		let res = await axios.get('/api/purgeAllSegments', { params: { videoID, userID: this.userID }, baseURL: this.options.baseURL, validateStatus: null })
		statusCheck(res);
		// returns nothing (status code 200)
	}
}
