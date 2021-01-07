import Segment from './segment.model';

export default class Video {
	constructor(public videoID: string, public hash: string, public segments: Segment[]) {}
}

export class PostVideo {
	constructor(public videoID: string, public userID: string, public segments: Segment[]) {}
}
