import { assert } from 'chai';
import { config } from '../config';

const { sponsorBlock } = config;

describe('isVIP', () => {
	it('should not return undefined', async () => {
		let response = await sponsorBlock.isVIP();
		assert.notStrictEqual(response, undefined, 'isVIP(): vip is undefined');
	});
	it('should return false', async () => {
		let response = await sponsorBlock.isVIP();
		assert.strictEqual(response, false, 'isVIP(): vip is true');
	});
});
