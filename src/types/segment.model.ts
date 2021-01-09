export default class Segment {
	constructor(public segment: [number, number], public category: Category, public UUID?: string | undefined) {}
}

// export default interface Segment {
// 	UUID: string;
// 	segment: number[];
// 	category: Category;
// }

export function isSegment(object: any): object is Segment {
	return object.UUID && object.segment && object.category;
}

// export class PostSegment {
// 	constructor(public segment: number[], public category: string) {}
// }

export type Category = 'sponsor' | 'intro' | 'outro' | 'interaction' | 'selfpromo' | 'music_offtopic';

// ["sponsor", "intro", "outro", "interaction", "selfpromo", "music_offtopic"]
// export enum Category {
// 	SPONSOR = 'sponsor',
// 	INTRO = 'intro',
// 	OUTRO = 'outro',
// 	INTERACTION = 'interaction',
// 	SELFPROMO = 'selfpromo',
// 	MUSIC_OFFTOPIC = 'music_offtopic',
// }
