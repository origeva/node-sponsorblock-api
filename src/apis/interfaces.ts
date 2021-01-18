import Segment from 'src/types/segment/Segment';
import Category from 'src/types/segment/Category';
import LocalSegment from 'src/types/segment/LocalSegment';
import UserStats from 'src/types/stats/UserStat';
import OverallStats from 'src/types/stats/OverallStats';
import Video from 'src/types/Video';
import VoteType from 'src/types/vote/VoteType';
import PrefixRange from '../types/PrefixRange';
import { SegmentResolvable, VideoResolvable } from './first/utils';
import SortType from 'src/types/stats/SortType';

export type SponsorBlockOptions = {
	/**
	 * The base URL to send requests to.
	 * @default https://sponsor.ajay.app
	 */
	baseURL?: string;

	/**
	 * The length of the prefix of the hash to query the server with, the shorter the more private.
	 * Accepts 3-32
	 * @default 4
	 */
	hashPrefixLength?: PrefixRange;
};

/**
 * SponsorBlock API class, to be constructed with a userID.
 *
 * @description Complete API documentation can be found {@link https://github.com/ajayyy/SponsorBlock/wiki/API-Docs here}.
 * Please review the {@link https://gist.github.com/ajayyy/4b27dfc66e33941a45aeaadccb51de71 attriution template}
 * to abide the {@link https://github.com/ajayyy/SponsorBlock/wiki/Database-and-API-License license}.
 */
export interface SponsorBlockAPI {
	/**
	 * The local user ID.
	 */
	userID: string;
	options: SponsorBlockOptions;

	/**
	 * Get the skip segments for a video of the specified categories.
	 * @param video the ID of a video or a video object gotten from a different call.
	 * @param categories the categories of the segments. Defaults to "sponsor".
	 */
	getSegments(video: VideoResolvable, ...categories: Category[]): Promise<Segment[]>;

	/**
	 * Submit new segments.
	 * @param video the ID of a video or a video object gotten from a different call.
	 * @param segments the segments to submit.
	 */
	postSegments(video: VideoResolvable, ...segments: LocalSegment[]): Promise<void>;

	/**
	 * Hashes the ID of the video and send the prefix of the hash so the server doesn't know which video you're looking for.
	 * The method filters out the video that don't match the input videoID.
	 * @param video the ID of a video or a video object gotten from a different call.
	 * @param categories the categories of the segments. Defaults to "sponsor".
	 */
	getSegmentsPrivately(video: VideoResolvable, ...categories: Category[]): Promise<Video>;

	/**
	 * Vote a submission up or down.
	 * @param segment the UUID of the segment or the segment you've gotten from a different call.
	 * @param type the vote type, 'down', 'up' or 0 for down, 1 for up.
	 */
	vote(segment: SegmentResolvable, type: VoteType): Promise<void>;

	/**
	 * Vote a submission for a more fitting category change.
	 * @param segment the UUID of the segment or the segment you've gotten from a different call.
	 * @param category the category you think would be more fitting.
	 */
	voteCategory(segment: SegmentResolvable, category: Category): Promise<void>;

	/**
	 * Submitting a view for a segment, let it be known you've made use of a submission.
	 * To be used only after using a segment.
	 * @param segment the UUID of the segment or the segment you've gotten from a different call.
	 */
	viewed(segment: SegmentResolvable): Promise<void>; // UUID or segment?

	/**
	 * Check how many times your submissions have been viewed.
	 */
	getViews(): Promise<number>;

	/**
	 * Check how much time you saved for other.
	 */
	getTimeSaved(): Promise<number>;

	/**
	 * Set a different username.
	 * @param username the username you'd like to change to.
	 */
	setUsername(username: string): Promise<void>;

	/**
	 * Get your username.
	 */
	getUsername(): Promise<string>;

	// Stat Calls

	/**
	 * Get the top user stats
	 * @param sortType
	 */
	getTopUsers(sortType: SortType): Promise<UserStats[]>;

	getOverallStats(): Promise<OverallStats>;

	/**
	 * Get how many days the platform has saved for users.
	 */
	getDaysSaved(): Promise<number>;

	/**
	 * Check whether you're a VIP.
	 */
	isVIP(): Promise<boolean>;

	/**
	 * Get the hash of your local ID (as stored in the server's database).
	 */
	getHashedUserID(): string;
}

export interface SponsorBlockVIPAPI extends SponsorBlockAPI {
	// VIP Calls

	/**
	 *
	 * @param video The ID of a video or a video object gotten from a different call.
	 * @param categories
	 */
	blockSubmissionsOfCategory(video: VideoResolvable, ...categories: Category[]): Promise<void>;

	shadowBan(publicUserID: string): Promise<void>;

	removeShadowBan(publicUserID: string): Promise<void>;

	hideOldSubmissions(publicUserID: string): Promise<void>;

	// 16 POST /api/warnUser
	warnUser(publicUserID: string, enabled?: boolean): Promise<void>;
}

export interface SponsorBlockAdminAPI extends SponsorBlockVIPAPI {
	// Admin Calls
	// 17 POST /api/addUserAsVIP
	addVIP(publicUserID: string, enabled?: boolean): Promise<void>;
}
