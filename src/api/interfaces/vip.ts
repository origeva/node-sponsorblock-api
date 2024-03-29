import { Category } from '../../types';
import { VideoResolvable } from '../../types/Video';
import { SponsorBlockInterface } from './user';

export interface SponsorBlockVIPInterface extends SponsorBlockInterface {
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
