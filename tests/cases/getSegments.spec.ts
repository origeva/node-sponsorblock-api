import { assert } from 'chai';
import { config } from '../config';
import { Segment } from '../../src/types/segment/Segment';

const { sponsorBlock, videoID } = config;

describe('getSegments', () => {
	it(`should return an array of category 'sponsor'`, async () => {
		let segments = await sponsorBlock.getSegments(videoID);
		assert.strictEqual(segments[0].category, 'sponsor', `getSegments('${videoID}'): Default category from API is not "sponsor"`);
	});

	it('should return an array of type segments', async () => {
		let segments = await sponsorBlock.getSegments(videoID);
		assert.typeOf<Segment[]>(segments, 'array');
		assert.typeOf<Segment>(segments[0], 'object');
	});
	it('should return an array of segments with only intro and outro categories', async () => {
		let segments = await sponsorBlock.getSegments(videoID, ['intro', 'outro']);
		assert.ok(
			segments.every((segment) => segment.category === 'intro' || segment.category === 'outro'),
			`getSegments('${videoID}', 'intro', 'outro'): Not every category is as requested`
		);
	});
});
