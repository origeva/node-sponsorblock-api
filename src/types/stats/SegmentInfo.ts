import { VideoID } from '../Video';
import { Category } from '../segment/Category';
import { SegmentUUID, Service } from '../segment/Segment';

export type SegmentInfo = {
	videoID: VideoID;
	startTime: number;
	endTime: number;
	votes: number;
	locked: number;
	UUID: SegmentUUID;
	userID: string;
	timeSubmitted: number;
	views: number;
	category: Category;
	service: Service;
	videoDuration: number;
	hidden: number;
	reputation: number;
	shadowHidden: number;
};
