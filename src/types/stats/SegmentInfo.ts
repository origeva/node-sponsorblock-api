import { SegmentUUID, VideoID } from "src/apis/first/utils";
import { Category } from "../segment/Category";
import { Service } from "../segment/Segment";

export type segmentInfo = { videoID: VideoID; startTime: number, endTime: number, votes: number, locked: number, UUID: SegmentUUID, userID: string, timeSubmitted: number, views: number, category: Category, service: Service, videoDuration: number, hidden: number, reputation: number, shadowHidden: number };