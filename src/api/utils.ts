import { Response } from 'cross-fetch';
import { ResponseError } from '../errors/ResponseError';

export function statusCheck(res: Response) {
	if (res.status !== 200) {
		if (res.status === 400) {
			throw new ResponseError(400, '[SponsorBlock] Bad Request (Your inputs are wrong/impossible)');
		} else if (res.status == 403) {
			throw new ResponseError(403, `[SponsorBlock] Rejected by auto moderator`);
		} else if (res.status === 404) {
			throw new ResponseError(404, '[SponsorBlock] Not Found');
		} else if (res.status === 405) {
			throw new ResponseError(405, '[SponsorBlock] Duplicate');
		} else if (res.status === 409) {
			throw new ResponseError(409, '[SponsorBlock] Duplicate');
		} else if (res.status === 429) {
			throw new ResponseError(429, '[SponsorBlock] Rate Limit (Too many for the same user or IP)');
		} else {
			throw new ResponseError(res.status, `[SponsorBlock] Status code not 200 (${res.status})`);
		}
	}
}
