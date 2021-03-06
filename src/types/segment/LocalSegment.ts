import { Category } from './Category';

export type LocalSegment = {
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
};
