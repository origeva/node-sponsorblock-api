import { Segment } from './segment/Segment';

export type Video = { videoID: string; hash: string; segments: Segment[] };
