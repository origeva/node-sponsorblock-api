import SponsorBlock from '../../src/index';
import { assert } from 'chai';
import { config } from '../config';

const { sponsorBlock } = config;

describe('isUserVIP', () => {
	it('should not return undefined', async () => {
		let response = await sponsorBlock.isUserVIP();
		assert.notEqual(response.vip, undefined, 'isUserVIP(): vip is undefined');
	});
});
