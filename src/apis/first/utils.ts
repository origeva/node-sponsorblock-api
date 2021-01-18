import Segment from 'src/types/segment/Segment';
import UserStat from 'src/types/stats/UserStat';
import Video from 'src/types/Video';

export type SegmentUUID = string;

export type SegmentResolvable = Segment | SegmentUUID;

export function resolveSegment(resolvable: SegmentResolvable): SegmentUUID {
	let UUID: string;
	if (typeof resolvable === 'string') {
		UUID = resolvable;
	} else {
		UUID = resolvable.UUID;
	}
	return UUID;
}

export type VideoID = string;

export type VideoResolvable = Video | VideoID;

export function resolveVideo(resolvable: VideoResolvable): VideoID {
	let videoID: string;
	if (typeof resolvable === 'string') {
		videoID = resolvable;
	} else {
		videoID = resolvable.videoID;
	}
	return videoID;
}

export function dbuserStatsToUserStats(dbuserStat: { userNames: string[]; viewCounts: number[]; totalSubmissions: number[]; minutesSaved: number[] }): UserStat[] {
	let userStats: UserStat[] = [];
	for (let i = 0; i < dbuserStat.userNames[0].length; i++) {
		let { userNames, viewCounts, totalSubmissions, minutesSaved } = dbuserStat;
		userStats.push({ userName: userNames[i], viewCounts: viewCounts[i], totalSubmissions: totalSubmissions[i], minutesSaved: minutesSaved[i] });
	}
	return userStats;
}
