import fetch from 'node-fetch';
import config from '../config.json';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import Segment, { Category, PostSegment } from './types/segment.model';
import Vote, { CategoryVote } from './types/vote.model';
import Video from './types/video.model';

/**
 * SponsorBlock API class, to be constructed with a userID.
 * Complete API documentation can be found {@link https://github.com/ajayyy/SponsorBlock/wiki/API-Docs here}
 */
export default class SponsorBlock {
	constructor(public userID: string, baseURL?: string) {
		this.baseURL = baseURL || config.baseURL;
	}

	static newUser() {
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
		if (categories) {
			query += `&categories=[`;
			categories.forEach((val) => (query += `"${val}",`));
			query = query.substring(0, query.length - 1) + `]`;
		}
		console.log(query);

		let res = await fetch(`${this.baseURL}/api/skipSegments${query}`);
		if (res.status == 404) {
			throw new Error('Not Found');
		} else if (res.status != 200) {
			throw new Error(`Status code not 200 (${res.status})`);
		}
		return await res.json();
	}

	// 2 A POST /api/skipSegments
	async postSegment(segment: PostSegment): Promise<void> {
		let res = await fetch(`${this.baseURL}/api/skipSegments`, {
			method: 'POST',
			body: JSON.stringify(segment),
			headers: { 'Content-Type': 'application/json' },
		});
		if (res.status == 400) {
			throw new Error('Bad Request (Your inputs are wrong/impossible)');
		} else if (res.status == 403) {
			throw new Error('Rejected by auto moderator (Reason will be sent in the response)');
		} else if (res.status == 429) {
			throw new Error('Rate Limit (Too many for the same user or IP)');
		} else if (res.status == 409) {
			throw new Error('Duplicate');
		} else if (res.status != 200) {
			throw new Error(`Status code not 200 (${res.status})`);
		}
		// returns nothing (status code 200)
	}

	// 2 B POST /api/skipSegments
	async postSegments(segments: Segment[]): Promise<void> {
		let res = await fetch(`${this.baseURL}/api/skipSegments`, {
			method: 'POST',
			body: JSON.stringify(segments),
			headers: { 'Content-Type': 'application/json' },
		});
		if (res.status == 400) {
			throw new Error('Bad Request (Your inputs are wrong/impossible)');
		} else if (res.status == 403) {
			throw new Error('Rejected by auto moderator (Reason will be sent in the response)');
		} else if (res.status == 429) {
			throw new Error('Rate Limit (Too many for the same user or IP)');
		} else if (res.status == 409) {
			throw new Error('Duplicate');
		} else if (res.status != 200) {
			throw new Error(`Status code not 200 (${res.status})`);
		}
		// returns nothing (status code 200)
	}

	// 3 GET /api/skipSegments/:sha256HashPrefix
	async getSegmentsPrivately(videoID: string, category?: Category /*, categories?: Category[]*/): Promise<Video[]> {
		let hashPrefix = crypto.createHash('sha256').update(videoID).digest('hex').substr(0, config.hashPrefixRecommendation);
		let query = category ? `?category=${category}` : '';
		console.log(query + hashPrefix);
		let res = await fetch(`${this.baseURL}/api/skipSegments/${hashPrefix}${query}`);
		if (res.status == 404) {
			throw new Error('Not Found');
		} else if (res.status != 200) {
			throw new Error(`Status code not 200 (${res.status})`);
		}
		return await res.json();
	}

	// 4 A POST or GET (legacy) /api/voteOnSponsorTime

	async postNormalVote(vote: Vote): Promise<void> {
		let query = `?UUID=${vote.UUID}&userID=${this.userID}&type=${vote.type}`;
		let res = await fetch(`${this.baseURL}/api/voteOnSponsorTime${query}`);
		if (res.status == 400) {
			throw new Error('Bad Request (Your inputs are wrong/impossible)');
		} else if (res.status == 405) {
			throw new Error('Duplicate');
		} else if (res.status != 200) {
			throw new Error(`Status code not 200 (${res.status})`);
		}
		// returns nothing (status code 200)
	}

	// 4 B POST or GET (legacy) /api/voteOnSponsorTime
	async postCategoryVote(vote: CategoryVote): Promise<void> {
		let query = `?UUID=${vote.UUID}&userID=${this.userID}&category=${vote.category}`;
		let res = await fetch(`${this.baseURL}/api/voteOnSponsorTime${query}`);
		if (res.status == 400) {
			throw new Error('Bad Request (Your inputs are wrong/impossible)');
		} else if (res.status == 405) {
			throw new Error('Duplicate');
		} else if (res.status != 200) {
			throw new Error(`Status code not 200 (${res.status})`);
		}
		// returns nothing (status code 200)
	}

	// 5 POST or GET (legacy) /api/viewedVideoSponsorTime
	async viewdVideoSponsorTime(segment: Segment): Promise<void> {
		let res = await fetch(`${this.baseURL}/api/viewedVideoSponsorTime?UUID=${segment.UUID}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
		});
		if (res.status == 400) {
			throw new Error('Bad Request (Your inputs are wrong/impossible)');
		} else if (res.status != 200) {
			throw new Error(`Status code not 200 (${res.status})`);
		}
		// returns nothing (status code 200)
	}

	// 6 GET /api/getViewsForUser
	async getViews(): Promise<number> {
		let res = await fetch(`${this.baseURL}/api/getViewsForUser?userID=${this.userID}`);
		if (res.status == 404) {
			throw new Error('Not Found');
		} else if (res.status != 200) {
			throw new Error(`Status code not 200 (${res.status})`);
		}
		let data = await res.json();
		return data.viewCount;
	}

	// 7 GET /api/getSavedTimeForUser
	async getSavedTime(): Promise<number> {
		let res = await fetch(`${this.baseURL}/api/getSavedTimeForUser?userID=${this.userID}`);
		if (res.status == 404) {
			throw new Error('Not Found');
		} else if (res.status != 200) {
			throw new Error(`Status code not 200 (${res.status})`);
		}
		let data = await res.json();
		return data.timeSaved;
	}

	// 8 POST /api/setUsername
	async setUsername(username: string): Promise<void> {
		let res = await fetch(`${this.baseURL}/api/setUsername?userID=${this.userID}&username=${username}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
		});
		if (res.status == 400) {
			throw new Error('Bad Request (Your inputs are wrong/impossible)');
		} else if (res.status != 200) {
			throw new Error(`Status code not 200 (${res.status})`);
		}
		// returns nothing (status code 200)
	}

	// 9 GET /api/getUsername
	async getUsername(): Promise<string> {
		let res = await fetch(`${this.baseURL}/api/getUsername?userID=${this.userID}`);
		if (res.status == 400) {
			throw new Error('Bad Request (Your inputs are wrong/impossible)');
		} else if (res.status != 200) {
			throw new Error(`Status code not 200 (${res.status})`);
		}
		let data = await res.json();
		return data.userName;
	}

	// Stat Calls

	// 10 GET /api/getTopUsers
	async getTopUsers(sortType: SortType): Promise<{ userNames: string[]; viewCounts: number[]; totalSubmissions: number[]; minutesSaved: number[] }> {
		let res = await fetch(`${this.baseURL}/api/getTopUsers?sortType=${sortType}`);
		if (res.status == 400) {
			throw new Error('Bad Request (Your inputs are wrong/impossible)');
		} else if (res.status != 200) {
			throw new Error(`Status code not 200 (${res.status})`);
		}
		return await res.json();
	}

	// 11 GET /api/getTotalStats
	async getTotalStats(): Promise<{ userCount: number; viewCount: number; totalSubmissions: number; minutesSaved: number }> {
		let res = await fetch(`${this.baseURL}/api/getTotalStats`);
		if (res.status != 200) {
			throw new Error(`Status code not 200 (${res.status})`);
		}
		return await res.json();
	}

	// 12 GET /api/getDaysSavedFormatted
	async getDaysSavedFormatted(): Promise<number> {
		let res = await fetch(`${this.baseURL}/api/getDaysSavedFormatted`);
		if (res.status != 200) {
			throw new Error(`Status code not 200 (${res.status})`);
		}
		let data = await res.json();
		return data.daysSaved;
	}

	// VIP Calls

	// 13 GET /api/isUserVIP
	async isUserVIP(): Promise<{ hashedUserID: string; vip: boolean }> {
		let res = await fetch(`${this.baseURL}/api/isUserVIP?userID=${this.userID}`);
		if (res.status == 400) {
			throw new Error('Bad Request (Your inputs are wrong/impossible)');
		} else if (res.status != 200) {
			throw new Error(`Status code not 200 (${res.status})`);
		}
		return await res.json();
	}
}

export class SponsorBlockVIP extends SponsorBlock {
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
		let res = await fetch(
			`${this.baseURL}/api/shadowBanUser?userID=${publicUserID}&adminUserID=${this.userID}&enabled=${enabled}&unHideOldSubmissions=${unHideOldSubmissions}`,
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
	async warnUser(publicUserID: string, enabled?: boolean) {
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
			throw new Error('Unauthorized (You are not a VIP)');
		} else if (res.status != 200) {
			throw new Error(`Status code not 200 (${res.status})`);
		}
		// returns nothing (status code 200)
	}
}

export enum SortType {
	MINUTES_SAVED,
	VIEW_COUNT,
	TOTAL_SUBMISSIONS,
}
