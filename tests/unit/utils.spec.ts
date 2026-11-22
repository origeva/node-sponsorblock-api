import { assert } from 'chai';
import { extractVideoID, validateYoutubeURL } from '../../src/utils';
import { statusCheck } from '../../src/api/utils';
import { ResponseError } from '../../src/errors/ResponseError';

describe('extractVideoID', () => {
	const videoID = 'abc123XYZ_-';
	const cases: Array<[string, string | null]> = [
		[`https://youtube.com/shorts/${videoID}`, videoID],
		[`https://www.youtube.com/shorts/${videoID}?feature=share`, videoID],
		[`https://youtube.com/live/${videoID}`, videoID],
		[`https://www.youtube.com/live/${videoID}?si=tracking`, videoID],
		[`https://music.youtube.com/watch?v=${videoID}`, videoID],
		[`https://music.youtube.com/watch?v=${videoID}&list=RD${videoID}`, videoID],
		[`https://www.youtube.com/watch?list=PL1234567890&v=${videoID}&index=2`, videoID],
		[`https://www.youtube.com/watch?v=${videoID}`, videoID],
		[`youtube.com/watch?v=${videoID}`, videoID],
		[`//www.youtube.com/watch?v=${videoID}`, videoID],
		[`https://youtu.be/${videoID}?t=10`, videoID],
		[`https://www.youtube.com/embed/${videoID}`, videoID],
		[`https://www.youtube.com/v/${videoID}`, videoID],
		['https://example.com/watch?v=abc123XYZ_-', null],
		['https://youtube.com.evil.com/watch?v=abc123XYZ_-', null],
		['https://youtube.com/watch?list=PL1234567890', null],
		['ftp://youtube.com/watch?v=abc123XYZ_-', null],
		['', null],
		['not a url', null],
	];

	for (const [input, expected] of cases) {
		it(`parses ${input || '(empty string)'} as ${expected ?? 'null'}`, () => {
			assert.strictEqual(extractVideoID(input), expected);
			assert.strictEqual(validateYoutubeURL(input), expected !== null);
		});
	}
});

describe('statusCheck', () => {
	it('accepts any 2xx status', () => {
		assert.doesNotThrow(() => statusCheck({ status: 200, data: {} }));
		assert.doesNotThrow(() => statusCheck({ status: 204, data: undefined }));
	});

	it('extracts messages from object bodies', () => {
		try {
			statusCheck({ status: 403, data: { message: 'Unauthorized (You are not a VIP)' } });
			assert.fail('statusCheck should throw');
		} catch (err) {
			assert.instanceOf(err, ResponseError);
			assert.strictEqual((err as ResponseError).status, 403);
			assert.strictEqual((err as Error).message, '[SponsorBlock] Unauthorized (You are not a VIP)');
		}
	});

	it('falls back to the status description for HTML bodies', () => {
		try {
			statusCheck({ status: 404, data: '<!DOCTYPE html><html></html>' });
			assert.fail('statusCheck should throw');
		} catch (err) {
			assert.instanceOf(err, ResponseError);
			assert.strictEqual((err as Error).message, '[SponsorBlock] Not Found');
		}
	});
});
