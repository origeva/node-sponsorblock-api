import { ResponseError } from '../errors/ResponseError';
import { SegmentResolvable, SegmentUUID } from '../types/segment/Segment';
import { UserStats } from '../types/stats/UserStat';
import { VideoID, VideoResolvable } from '../types/Video';

export function resolveSegment(resolvable: SegmentResolvable): SegmentUUID {
	let UUID: string;
	if (typeof resolvable === 'string') {
		UUID = resolvable;
	} else {
		UUID = resolvable.UUID;
	}
	return UUID;
}

export function resolveVideo(resolvable: VideoResolvable): VideoID {
	let videoID: string;
	if (typeof resolvable === 'string') {
		videoID = resolvable;
	} else {
		videoID = resolvable.videoID;
	}
	return videoID;
}

export function dbuserStatsToUserStats(dbuserStat: { userNames: string[]; viewCounts: number[]; totalSubmissions: number[]; minutesSaved: number[] }): UserStats[] {
	let userStats: UserStats[] = [];
	for (let i = 0; i < dbuserStat.userNames[0].length; i++) {
		let { userNames, viewCounts, totalSubmissions, minutesSaved } = dbuserStat;
		userStats.push({ userName: userNames[i], viewCounts: viewCounts[i], totalSubmissions: totalSubmissions[i], minutesSaved: minutesSaved[i] });
	}
	return userStats;
}

export function statusCheck(res: Response) {
	if (res.status !== 200) {
		if (res.status === 400) {
			throw new ResponseError(400, '[SponsorBlock] Bad Request (Your inputs are wrong/impossible)');
		} else if (res.status == 403) {
			throw new ResponseError(403, `[SponsorBlock] Rejected by auto moderator`);
		} else if (res.status === 404) {
			throw new ResponseError(404, '[SponsorBlock] Not Found');
		} else if (res.status === 405) {
			throw new ResponseError(405, '[SponsorBlock] Duplicate');
		} else if (res.status === 409) {
			throw new ResponseError(409, '[SponsorBlock] Duplicate');
		} else if (res.status === 429) {
			throw new ResponseError(429, '[SponsorBlock] Rate Limit (Too many for the same user or IP)');
		} else {
			throw new ResponseError(res.status, `[SponsorBlock] Status code not 200 (${res.status})`);
		}
	}
}
