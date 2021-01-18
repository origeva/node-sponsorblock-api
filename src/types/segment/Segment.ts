import Category from './Category';

/**
 * SponsorBlock segment with times where the content is deemed as one of the categories that you might want to skip.
 */
type Segment = {
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
};
export default Segment;
