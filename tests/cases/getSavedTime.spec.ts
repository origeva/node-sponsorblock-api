import { assert } from 'chai';
import { config } from '../config';
const { sponsorBlock } = config;

describe('getSavedTime', () => {
	it('should return at least 0', async () => {
		let result = await sponsorBlock.getSavedTime();
		assert.isAtLeast(result, 0);
	});
});
