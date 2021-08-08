import { VideoID } from '../Video';
import { Category } from './Category';

export type categoryLock = {
	videoID: VideoID;
	hash: string;
	categories: Category[];
	reason: string;
};
