import { assert } from 'chai';
import { config } from '../config';
const { sponsorBlock } = config;

describe.skip('getViews', () => {
	it('should return at least 0', async () => {
		let result = await sponsorBlock.getViews();
		assert.isAtLeast(result, 0);
	});
});
