import SponsorBlock from '../../src/index';
import { assert } from 'chai';
import { config } from '../config';

const { sponsorBlock } = config;

describe('isUserVIP', () => {
	it('should not return undefined', async () => {
		let response = await sponsorBlock.isVIP();
		assert.notStrictEqual(response, undefined, 'isUserVIP(): vip is undefined');
	});
	it('should return false', async () => {
		let response = await sponsorBlock.isVIP();
		assert.strictEqual(response, false, 'isUserVIP(): vip is undefined');
	});
});
