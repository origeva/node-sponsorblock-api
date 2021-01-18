import { Segment } from '../../src/types/segment/Segment';

export function isSegment(object: any): object is Segment {
	return object.UUID && object.startTime && object.endTime && object.category;
}
