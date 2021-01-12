import { assert } from 'chai';
import { config } from '../config';
const { sponsorBlock } = config;

describe('getDaysSaved', () => {
	it('should return at least 0', async () => {
		let result = await sponsorBlock.getDaysSaved();
		assert.isAtLeast(result, 0);
	});
});
