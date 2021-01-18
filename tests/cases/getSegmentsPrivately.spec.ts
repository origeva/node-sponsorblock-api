import { assert } from 'chai';
import { isSegment } from './utils';
import { config } from '../config';

const { sponsorBlock, videoID } = config;

describe('getSegmentsPrivately', () => {
	it('should return a Video', async () => {
		let video = await sponsorBlock.getSegmentsPrivately(videoID);
		assert.ok(video.segments.every(isSegment), `sponsorBlock.getSegmentsPrivately('${videoID}'): segments is not of type Segment[]`);
	});
	// assert.equal(video.segments[0].category, 'sponsor', `sponsorBlock.getSegmentsPrivately('${videoID}'): Default category from API is not "sponsor"`);
	// video = await sponsorBlock.getSegmentsPrivately(videoID, 'intro', 'outro');
	// assert.ok(
	// 	video.segments.every((segment) => segment.category === 'intro' || segment.category === 'outro'),
	// 	`sponsorBlock.getSegmentsPrivately('${videoID}', 'intro', 'outro'): Not every category is as requested`
	// );
});
