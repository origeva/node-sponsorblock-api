import { Category } from './Category';

export type LegacySegment = {
	UUID: string;
	startTime: number;
	endTime: number;
	category: 'sponsor';
}

/**
 * SponsorBlock segment with times where the content is deemed as one of the categories that you might want to skip.
 */
export type Segment = {
	/**
	 * The ID of the Segment in the database, should not be assigned locally.
	 */
	UUID: string;

	/**
	 * The start time of the segment.
	 */
	startTime: number;

	/**
	 * The end time of the segment.
	 */
	endTime: number;

	/**
	 * The category of the segment.
	 */
	category: Category;

	/**
	 * Duration of the video when submission occurred
	 */
	videoDuration: number;
};

/**
 * The service to fetch sergments for. Defaults to YouTube.
 */
export type Service = 'YouTube' | 'PeerTube';