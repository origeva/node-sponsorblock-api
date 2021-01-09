import { DBSegment, dbsegmentToSegment, Segment } from './segment.model';

export type Video = { videoID: string; hash: string; segments: Segment[] };

export type DBVideo = { videoID: string; hash: string; segments: DBSegment[] };

export function dbvideoToVideo(dbvideo: DBVideo): Video {
	let { videoID, hash, segments } = dbvideo;
	return { videoID, hash, segments: segments.map(dbsegmentToSegment) };
}

// export default class Video {
// 	constructor(public videoID: string, public hash: string, public segments: Segment[]) {}
// }
