import { assert } from 'chai';
import { config } from '../config';
const { sponsorBlock } = config;

describe('getTimeSaved', () => {
	it('should return at least 0', async () => {
		let result = await sponsorBlock.getTimeSaved();
		assert.isAtLeast(result, 0);
	});
});
