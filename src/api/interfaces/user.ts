import { SponsorBlockOptions } from '../../types/SponsorBlockOptions';
import { Category, LocalSegment, OverallStats, Segment, SortType, UserStats, VoteType } from '../../types';
import { SegmentInfo } from '../../types/stats/SegmentInfo';
import { UserIDPair } from '../../types/user';
import { VideoResolvable } from '../../types/Video';
import { SegmentResolvable } from '../../types/segment/Segment';

/**
 * SponsorBlock API class, to be constructed with a userID.
 *
 * @description Complete API documentation can be found {@link https://wiki.sponsor.ajay.app/index.php/API_Docs here}.
 * Please review the {@link https://gist.github.com/ajayyy/4b27dfc66e33941a45aeaadccb51de71 attriution template}
 * to abide the {@link https://github.com/ajayyy/SponsorBlock/wiki/Database-and-API-License license}.
 */
export interface SponsorBlockInterface {
	/**
	 * The local user ID.
	 */
	userID: string;
	options: SponsorBlockOptions;

	/**
	 * Get the skip segments for a video of the specified categories.
	 * @param video the ID of a video or a video object gotten from a different call.
	 * @param categories the categories of the segments. Defaults to "sponsor".
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
	getSegmentInfo(segments: string[]): Promise<SegmentInfo[]>;

	/**
	 * Get userID matches for a given username
	 * @param username partial username to search for
	 * @param exact if the lookup should be exact and not fuzzy
	 */
	getUserID(username: string, exact: boolean): Promise<UserIDPair[]>;

	/**
	 * Get locked categories for a given video
	 * @param video the ID of a video or a video object gotten from a different call.
	 */
	getLockCategories(video: VideoResolvable): Promise<Category[]>;

	/**
	 * Get locked categores for a given video privately
	 * @param video the ID of a video or a video object gotten from a different call.
	 */
	getLockCategoriesPrivately(video: VideoResolvable): Promise<Category[]>;
}
