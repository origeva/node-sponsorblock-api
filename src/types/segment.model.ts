export type Segment = { UUID?: string; startTime: number; endTime: number; category: Category };
export type DBSegment = { UUID?: string; segment: [number, number]; category: Category };

export function isSegment(object: any): object is Segment {
	return object.UUID && object.startTime && object.endTime && object.category;
}

export function dbsegmentToSegment(dbsegment: DBSegment): Segment {
	let { UUID, segment, category } = dbsegment;
	return { UUID, startTime: segment[0], endTime: segment[1], category };
}

export function segmentsToDBSegments(segment: Segment): DBSegment {
	let { UUID, startTime, endTime, category } = segment;
	return { UUID, segment: [startTime, endTime], category };
}

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
