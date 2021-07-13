import { assert } from 'chai';
import { config } from '../config';
const { sponsorBlock } = config;

describe.skip('getDaysSaved', () => {
	it('should return at least 0', async () => {
		let result = await sponsorBlock.getDaysSaved();
		assert.ok(true);
		// getDaysSaved will return 404 since the userID has no submissions
		assert.isAtLeast(result, 0);
	});
});
