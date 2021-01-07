export default class Segment {
	constructor(public UUID: string, public segment: number[], public category: Category) {}
}

export class PostSegment {
	constructor(public segment: number[], public category: string) {}
}

// ["sponsor", "intro", "outro", "interaction", "selfpromo", "music_offtopic"]
export enum Category {
	SPONSOR = 'sponsor',
	INTRO = 'intro',
	OUTRO = 'outro',
	INTERACTION = 'interaction',
	SELFPROMO = 'selfpromo',
	MUSIC_OFFTOPIC = 'music_offtopic',
}
