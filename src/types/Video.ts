import { Segment } from './segment/Segment';

export type VideoID = string;

export type VideoResolvable = Video | VideoID;

export type Video = { videoID: VideoID; hash: string; segments: Segment[] };
