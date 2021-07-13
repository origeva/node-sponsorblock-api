import { assert } from 'chai';
import { config } from '../config';
const { sponsorBlock } = config;

describe.skip('getTimeSaved', () => {
	it('should return at least 0', async () => {
		let result = await sponsorBlock.getTimeSaved();
		// getTimeSaved will return 404 since the user has no segments
		assert.isAtLeast(result, 0);
	});
});
