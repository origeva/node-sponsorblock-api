import { Segment, Service } from '../types/segment/Segment';
import { Category } from '../types/segment/Category';
import { LocalSegment } from '../types/segment/LocalSegment';
import { UserStats } from '../types/stats/UserStat';
import { OverallStats } from '../types/stats/OverallStats';
import { VoteType } from '../types/vote/VoteType';
import { PrefixRange } from '../types/PrefixRange';
import { SegmentResolvable, VideoResolvable } from './first/utils';
import { SortType } from '../types/stats/SortType';
import { segmentInfo } from 'src/types/stats/SegmentInfo';
import { userIDPair } from 'src/types/user';

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

	/**
	 * Service to query segments from
	 * @default Service.YouTube
	 */
	service?: Service.YouTube;
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
	 * @param service the service to fetch sergments for. Defaults to YouTube.
	 * @param requiredSegments list of segment UUIDs to be required to retreived.
	 */
	getSegments(video: VideoResolvable, categories: Category[], ...requiredSegments: string[]): Promise<Segment[]>;

	/**
	 * Submit new segments.
	 * @param video the ID of a video or a video object gotten from a different call.
	 * @param segments the segments to submit.
	 */
	postSegments(video: VideoResolvable, ...segments: LocalSegment[]): Promise<void>;

	/**
	 * Hashes the ID of the video and send the prefix of the hash so the server doesn't know which video you're looking for.
	 * The method filters out the videos that don't match the input videoID.
	 * @param video the ID of a video or a video object gotten from a different call.
	 * @param categories the categories of the segments. Defaults to "sponsor".
	 * @param service the service to fetch sergments for. Defaults to YouTube.
	 * @param requiredSegments list of segment UUIDs to be required to retreived.
	 */
	getSegmentsPrivately(video: VideoResolvable, categories: Category[], ...requiredSegments: string[]): Promise<Segment[]>;

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
	viewed(segment: SegmentResolvable): Promise<void>;

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

	/**
	 * Get information of segments
	 * @param segments UUIDs of segments or segment from a different call
	 */
	getSegmentInfo(segments: string[]): Promise<segmentInfo[]>

	/**
	 * Get userID matches for a given username
	 * @param username partial username to search for
	 * @param exact if the lookup should be exact and not fuzzy
	 */
	getUserID(username: string, exact: boolean): Promise<userIDPair[]>

	/**
	 * Get locked categories for a given video
	 * @param video the ID of a video or a video object gotten from a different call.
	 */
	getLockCategories(video: VideoResolvable): Promise<Category[]>

	/**
	 * Get locked categores for a given video privately
	 * @param video the ID of a video or a video object gotten from a different call.
	 */
	getLockCategoriesPrivately(video: VideoResolvable): Promise<Category[]>
}

export interface SponsorBlockVIPAPI extends SponsorBlockAPI {
	// VIP Calls

	/**
	 *
	 * @param video The ID of a video or a video object gotten from a different call.
	 * @param categories
	 */
	blockSubmissionsOfCategory(video: VideoResolvable, ...categories: Category[]): Promise<void>;

	/**
	 * Shadowban User
	 * @param publicUserID the ID of the user to shadowban.
	 */
	shadowBan(publicUserID: string): Promise<void>;

	/**
	 * Un-shadowban user
	 * @param publicUserID the ID of the user to unban.
	 */
	removeShadowBan(publicUserID: string): Promise<void>;

	/**
	 * Shadowban user and hide old submissions
	 * @param publicUserID the ID of the user to shadow hide submissions for.
	 */
	hideOldSubmissions(publicUserID: string): Promise<void>;

	/**
	 * Warn a user
	 * @param publicUserID the ID of the user to warn.
	 * @param reason reason for warning.
	 * @param enabled enable or disable warning.
	 */
	warnUser(publicUserID: string, reason: string, enabled?: boolean): Promise<void>;

	/**
	 * Clear redis cache of a video
	 * @param video The ID of a video or a video object gotten from a different call.
	 */
	clearCache(video: VideoResolvable): Promise<void>;

	/**
	 * Hide all segments on a video
	 * @param video The ID of a video or a video object gotten from a different call.
	 */
	purgeAllSegments(video: VideoResolvable): Promise<void>;
}

export interface SponsorBlockAdminAPI extends SponsorBlockVIPAPI {
	// Admin Calls
	// 17 POST /api/addUserAsVIP
	addVIP(publicUserID: string, enabled?: boolean): Promise<void>;
}
