import { Response } from 'node-fetch';
import { ResponseError } from './ResponseError';

export function statusCheck(res: Response) {
	if (res.status !== 200) {
		if (res.status === 400) {
			throw new ResponseError(400, 'Bad Request (Your inputs are wrong/impossible)');
		} else if (res.status == 403) {
			throw new ResponseError(403, `Rejected by auto moderator`);
		} else if (res.status === 404) {
			throw new ResponseError(404, 'Not Found');
		} else if (res.status === 405) {
			throw new ResponseError(405, 'Duplicate');
		} else if (res.status === 409) {
			throw new ResponseError(409, 'Duplicate');
		} else if (res.status === 429) {
			throw new ResponseError(429, 'Rate Limit (Too many for the same user or IP)');
		} else {
			throw new ResponseError(res.status, `Status code not 200 (${res.status})`);
		}
	}
}
