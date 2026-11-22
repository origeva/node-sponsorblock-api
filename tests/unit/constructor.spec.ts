import { assert } from 'chai';
import MockAdapter from 'axios-mock-adapter';
import { SponsorBlock, SponsorBlockVIP } from '../../src';

describe('constructors', () => {
	it('does not mutate the caller options object', () => {
		const options = { baseURL: 'https://sponsor.test/', hashPrefixLength: 4 as const };
		const original = { ...options };

		const client = new SponsorBlock('local-user', options);

		assert.deepEqual(options, original);
		assert.strictEqual(options.baseURL, 'https://sponsor.test/');
		assert.strictEqual(client.options.baseURL, 'https://sponsor.test');
		assert.notStrictEqual(client.options, options);
	});

	it('does not make a request or log from the VIP constructor', async () => {
		const originalIsVIP = SponsorBlockVIP.prototype.isVIP;
		const originalInfo = console.info;
		let vipChecked = false;
		let infoCalled = false;
		SponsorBlockVIP.prototype.isVIP = async () => {
			vipChecked = true;
			return false;
		};
		console.info = () => {
			infoCalled = true;
		};

		let vip: SponsorBlockVIP;
		let mock: MockAdapter;
		try {
			vip = new SponsorBlockVIP('local-user', { baseURL: 'https://sponsor.test' });
			mock = new MockAdapter((vip as any).http);
			await new Promise((resolve) => setTimeout(resolve, 25));

			assert.isFalse(vipChecked);
			assert.isFalse(infoCalled);
			assert.lengthOf(mock.history.get, 0);
		} finally {
			SponsorBlockVIP.prototype.isVIP = originalIsVIP;
			console.info = originalInfo;
			if (mock!) mock.restore();
		}
	});
});
