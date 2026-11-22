import axios, { AxiosRequestConfig } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { assert } from 'chai';
import { ResponseError, SponsorBlock, SponsorBlockAdmin, SponsorBlockVIP } from '../../src';

const baseURL = 'https://sponsor.test';

function attachMock(client: SponsorBlock): MockAdapter {
	return new MockAdapter((client as any).http);
}

function lastRequest(mock: MockAdapter, method: 'get' | 'post'): AxiosRequestConfig {
	const requests = mock.history[method];
	return requests[requests.length - 1];
}

function requestURI(config: AxiosRequestConfig): string {
	return decodeURIComponent(axios.getUri(config));
}

function requestBody(config: AxiosRequestConfig): any {
	return typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
}

describe('request handling (offline)', () => {
	let client: SponsorBlock;
	let mock: MockAdapter;

	beforeEach(() => {
		client = new SponsorBlock('local-user', { baseURL });
		mock = attachMock(client);
	});

	afterEach(() => {
		mock.restore();
	});

	it('getSegments serializes requiredSegments as a JSON array parameter', async () => {
		mock.onGet('/api/skipSegments').reply(200, []);

		await client.getSegments('jiK2jmTVF3A', ['sponsor', 'intro'], 'uuid-1', 'uuid-2');

		const config = lastRequest(mock, 'get');
		const uri = requestURI(config);
		assert.strictEqual(config.method, 'get');
		assert.strictEqual(config.url, '/api/skipSegments');
		assert.include(uri, 'categories=["sponsor","intro"]');
		assert.include(uri, 'requiredSegments=["uuid-1","uuid-2"]');
		assert.notInclude(uri, 'requiredSegments[]');
	});

	it('getSegments omits requiredSegments when none are given', async () => {
		mock.onGet('/api/skipSegments').reply(200, []);

		await client.getSegments('jiK2jmTVF3A');

		const uri = requestURI(lastRequest(mock, 'get'));
		assert.notInclude(uri, 'requiredSegments');
		assert.include(uri, 'categories=["sponsor"]');
	});

	it('getSegmentsPrivately sends service, categories and requiredSegments', async () => {
		mock.onGet(/^\/api\/skipSegments\/[a-f0-9]+$/).reply(200, [
			{
				videoID: 'jiK2jmTVF3A',
				hash: 'd036example',
				segments: [{ UUID: 'uuid-1', segment: [10, 20], category: 'intro', videoDuration: 100 }],
			},
			{
				videoID: 'unrelated-video',
				hash: 'other',
				segments: [{ UUID: 'uuid-2', segment: [0, 5], category: 'sponsor', videoDuration: 50 }],
			},
		]);

		const segments = await client.getSegmentsPrivately('jiK2jmTVF3A', ['intro'], 'uuid-1');

		const config = lastRequest(mock, 'get');
		const uri = requestURI(config);
		assert.match(config.url!, /^\/api\/skipSegments\/[a-f0-9]{4}$/);
		assert.include(uri, 'service=YouTube');
		assert.include(uri, 'categories=["intro"]');
		assert.include(uri, 'requiredSegments=["uuid-1"]');
		assert.deepEqual(segments, [{ UUID: 'uuid-1', startTime: 10, endTime: 20, category: 'intro', videoDuration: 100 }]);
	});

	it('getLockCategoriesPrivately queries the lockCategories endpoint', async () => {
		mock.onGet(/^\/api\/lockCategories\/[a-f0-9]+$/).reply(200, [
			{ videoID: 'jiK2jmTVF3A', hash: 'd036example', categories: ['sponsor', 'intro'], reason: 'test' },
			{ videoID: 'unrelated-video', hash: 'other', categories: ['outro'], reason: '' },
		]);

		const categories = await client.getLockCategoriesPrivately('jiK2jmTVF3A');

		const config = lastRequest(mock, 'get');
		assert.match(config.url!, /^\/api\/lockCategories\/[a-f0-9]{4}$/);
		assert.notInclude(config.url!, '/api/skipSegments');
		assert.deepEqual(categories, ['sponsor', 'intro']);
	});

	it('setUsername uses POST with URL parameters', async () => {
		mock.onPost('/api/setUsername').reply(200);

		await client.setUsername('new name');

		const config = lastRequest(mock, 'post');
		assert.strictEqual(config.method, 'post');
		assert.deepEqual(config.params, { userID: 'local-user', username: 'new name' });
		assert.lengthOf(mock.history.get, 0);
		assert.include(requestURI(config), 'username=new+name');
	});

	it('clearCache uses POST with a JSON body', async () => {
		const vip = new SponsorBlockVIP('vip-user', { baseURL });
		mock.restore();
		mock = attachMock(vip);
		mock.onPost('/api/clearCache').reply(200);

		await vip.clearCache('jiK2jmTVF3A');

		const config = lastRequest(mock, 'post');
		assert.strictEqual(config.url, '/api/clearCache');
		assert.deepEqual(requestBody(config), { videoID: 'jiK2jmTVF3A', userID: 'vip-user' });
	});

	it('purgeAllSegments uses POST with a JSON body', async () => {
		const vip = new SponsorBlockVIP('vip-user', { baseURL });
		mock.restore();
		mock = attachMock(vip);
		mock.onPost('/api/purgeAllSegments').reply(200);

		await vip.purgeAllSegments('jiK2jmTVF3A');

		const config = lastRequest(mock, 'post');
		assert.strictEqual(config.url, '/api/purgeAllSegments');
		assert.deepEqual(requestBody(config), { videoID: 'jiK2jmTVF3A', userID: 'vip-user' });
	});

	it('addVIP posts to addUserAsVIP with admin URL parameters', async () => {
		const admin = new SponsorBlockAdmin('admin-user', { baseURL });
		mock.restore();
		mock = attachMock(admin);
		mock.onPost('/api/addUserAsVIP').reply(200);

		await admin.addVIP('public-user', true);

		const config = lastRequest(mock, 'post');
		assert.strictEqual(config.url, '/api/addUserAsVIP');
		assert.deepEqual(config.params, { userID: 'public-user', adminUserID: 'admin-user', enabled: true });
		assert.include(requestURI(config), 'enabled=true');
		assert.lengthOf(mock.history.post, 1);
	});

	it('getTopUsers rejects locally without calling the disabled endpoint', async () => {
		let requested = false;
		mock.onGet('/api/getTopUsers').reply(() => {
			requested = true;
			return [200, { userNames: [], viewCounts: [], totalSubmissions: [], minutesSaved: [] }];
		});

		try {
			await client.getTopUsers('minutesSaved');
			assert.fail('getTopUsers should reject');
		} catch (err) {
			assert.instanceOf(err, ResponseError);
			assert.strictEqual((err as ResponseError).status, 404);
			assert.match((err as Error).message, /\/api\/getTopUsers/);
			assert.match((err as Error).message, /always returns 404/);
		}
		assert.isFalse(requested);
		assert.lengthOf(mock.history.get, 0);
	});

	it('getUserID forwards the exact flag', async () => {
		mock.onGet('/api/userID').reply(200, [{ userName: 'someone', userID: 'public-id' }]);

		const matches = await client.getUserID('someone', true);

		const config = lastRequest(mock, 'get');
		assert.deepEqual(config.params, { username: 'someone', exact: true });
		assert.include(requestURI(config), 'exact=true');
		assert.deepEqual(matches, [{ userName: 'someone', userID: 'public-id' }]);
	});

	it('statusCheck preserves a JSON-array error body from the API', async () => {
		mock.onGet('/api/getViewsForUser').reply(400, ['userID parameter does not match format requirements.']);

		try {
			await client.getViews();
			assert.fail('getViews should reject');
		} catch (err) {
			assert.instanceOf(err, ResponseError);
			assert.strictEqual((err as ResponseError).status, 400);
			assert.strictEqual((err as Error).message, '[SponsorBlock] userID parameter does not match format requirements.');
		}
	});

	it('statusCheck preserves a plain-text error body from the API', async () => {
		mock.onGet(/^\/api\/skipSegments\/[a-f0-9]+$/).reply(400, 'Hash prefix does not match format requirements.');

		try {
			await client.getSegmentsPrivately('jiK2jmTVF3A');
			assert.fail('getSegmentsPrivately should reject');
		} catch (err) {
			assert.instanceOf(err, ResponseError);
			assert.strictEqual((err as ResponseError).status, 400);
			assert.strictEqual((err as Error).message, '[SponsorBlock] Hash prefix does not match format requirements.');
		}
	});
});
