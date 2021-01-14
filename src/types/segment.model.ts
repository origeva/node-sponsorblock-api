/**
 * SponsorBlock segment with times where the content is deemed as one of the categories that you might want to skip.
 */
export type Segment = {
	/**
	 * The ID of the Segment in the database, should not be assigned locally.
	 */
	UUID?: string;

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

export function isSegment(object: any): object is Segment {
	return object.UUID && object.startTime && object.endTime && object.category;
}

/**
 * The category of a segment
 */
export type Category = 'sponsor' | 'intro' | 'outro' | 'interaction' | 'selfpromo' | 'music_offtopic';
