import fetch from 'cross-fetch';
import { Category } from '../../types/segment/Category';
import { SponsorBlockOptions } from '../interfaces/interfaces';
import { SponsorBlock } from './user';
import { resolveVideo, VideoResolvable } from './utils';
import { SponsorBlockVIPAPI } from '../interfaces/interfaces';
import { statusCheck } from '../utils';

export class SponsorBlockVIP extends SponsorBlock implements SponsorBlockVIPAPI {
	constructor(public userID: string, public options: SponsorBlockOptions = {}) {
		super(userID, options);
		this.isVIP().then((result) => result || console.info('\x1b[31m%s\x1b[0m', 'User is not VIP, VIP methods will be unauthorized'));
	}

	async blockSubmissionsOfCategory(video: VideoResolvable, ...categories: Category[]): Promise<void> {
		let videoID = resolveVideo(video);
		let res = await fetch(`${this.options.baseURL}/api/noSegments`, {
			method: 'POST',
			body: JSON.stringify({ videoID, userID: this.userID, categories }),
			headers: { 'Content-Type': 'application/json' },
		});
		statusCheck(res);
		// returns nothing (status code 200)
	}

	async shadowBan(publicUserID: string, hideOldSubmissions?: boolean): Promise<void> {
		let res = await fetch(
			`${this.options.baseURL}/api/shadowBanUser?userID=${publicUserID}&adminUserID=${this.userID}&enabled=true&unHideOldSubmissions=${hideOldSubmissions ?? false}`,
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			}
		);
		statusCheck(res);
		// returns nothing (status code 200)
	}

	async removeShadowBan(publicUserID: string): Promise<void> {
		let res = await fetch(`${this.options.baseURL}/api/shadowBanUser?userID=${publicUserID}&adminUserID=${this.userID}&enabled=false`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
		});
		statusCheck(res);
		// returns nothing (status code 200)
	}

	async hideOldSubmissions(publicUserID: string): Promise<void> {
		let res = await fetch(`${this.options.baseURL}/api/shadowBanUser?userID=${publicUserID}&adminUserID=${this.userID}&enabled=true&unHideOldSubmissions=true`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
		});
		statusCheck(res);
		// returns nothing (status code 200)
	}

	async warnUser(publicUserID: string, reason: string = '', enabled?: boolean): Promise<void> {
		let res = await fetch(`${this.options.baseURL}/api/warnUser`, {
			method: 'POST',
			body: JSON.stringify({ issuerUserID: this.userID, userID: publicUserID, enabled, reason }),
			headers: { 'Content-Type': 'application/json' },
		});
		statusCheck(res);
		// returns nothing (status code 200)
	}

	async clearCache(video: VideoResolvable): Promise<void> {
		let videoID = resolveVideo(video);
		let res = await fetch(`${this.options.baseURL}/api/clearCache?videoID=${videoID}&userID=${this.userID}`);
		statusCheck(res);
		// returns nothing (status code 200)
	}

	async purgeAllSegments(video: VideoResolvable): Promise<void> {
		let videoID = resolveVideo(video);
		let res = await fetch(`${this.options.baseURL}/api/purgeAllSegments?videoID=${videoID}&userID=${this.userID}`);
		statusCheck(res);
		// returns nothing (status code 200)
	}
}
