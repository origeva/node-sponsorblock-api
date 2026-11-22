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

/** @throws {@link ResponseError} */
export function statusCheck(res: any) {
	if (typeof res.status === 'number' && res.status >= 200 && res.status < 300) return;

	/** @internal */
	const makeErrMsg = (msg: string) => `[SponsorBlock] ${msg}`;
	const msgErrors: Record<number, string> = {
		400: 'Bad Request (Your inputs are wrong/impossible)',
		403: 'Rejected by auto moderator',
		404: 'Not Found',
		405: 'Duplicate',
		409: 'Duplicate',
		429: 'Rate Limit (Too many for the same user or IP)',
	};
	const apiMessage = extractApiErrorMessage(res.data);
	const fallback = msgErrors[res.status] ?? `Status code not 200 (${res.status})`;
	throw new ResponseError(res.status, makeErrMsg(apiMessage ?? fallback));
}

/** @internal */
function extractApiErrorMessage(data: any): string | undefined {
	if (typeof data === 'string') {
		const message = data.trim();
		return message && !message.startsWith('<') ? message : undefined;
	}
	if (Array.isArray(data)) {
		const messages = data
			.filter((entry): entry is string => typeof entry === 'string')
			.map((entry) => entry.trim())
			.filter(Boolean);
		return messages.length > 0 ? messages.join('; ') : undefined;
	}
	if (data && typeof data === 'object') {
		const message = data.message ?? data.error;
		if (typeof message === 'string' && message.trim()) return message.trim();
	}
	return undefined;
}
