import { config } from '../../config';
import { assert } from 'chai';
import { Category } from '../../../src/types/segment/Category';
import { SponsorBlockLegacy } from '../../../src/apis/legacy';

describe('Legacy getSegments', () => {
	it('should return an array of segments', async () => {
		let result = await new SponsorBlockLegacy('test').getSegments(config.videoID);
		assert.strictEqual<Category>(result[0].category, 'sponsor');
	});
});
