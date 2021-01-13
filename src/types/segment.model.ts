/**
 * SponsorBlock segment with times where the content is deemed as one of the categories that you might want to skip.
 */
export type Segment = {
	/**
	 * The ID of the Segment in the database, should not be assigned locally.
	 */
	UUID?: string;

	/**
	 * The start time of the segment
	 */
	startTime: number;

	/**
	 * The end time of the segment
	 */
	endTime: number;

	category: Category;
};

// export type DBSegment = { UUID?: string; segment: [number, number]; category: Category };

export function isSegment(object: any): object is Segment {
	return object.UUID && object.startTime && object.endTime && object.category;
}

/**
 * The category of a segment
 */
export type Category = 'sponsor' | 'intro' | 'outro' | 'interaction' | 'selfpromo' | 'music_offtopic';

// export default class Segment {
// 	constructor(public segment: [number, number], public category: Category, public UUID?: string | undefined) {}
// }

// export default interface Segment {
// 	UUID: string;
// 	segment: number[];
// 	category: Category;
// }

// export class PostSegment {
// 	constructor(public segment: number[], public category: string) {}
// }
