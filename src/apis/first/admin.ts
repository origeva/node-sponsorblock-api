import fetch from 'node-fetch';
import { statusCheck } from '../utils';
import { SponsorBlockVIP } from './vip';

export class SponsorBlockAdmin extends SponsorBlockVIP {
	// Admin Calls
	// 17 POST /api/addUserAsVIP
	async addVIP(publicUserID: string, enabled?: boolean): Promise<void> {
		let res = await fetch(`${this.options.baseURL}/api/warnUser`, {
			method: 'POST',
			body: JSON.stringify({ adminUserID: this.userID, userID: publicUserID, enabled }),
			headers: { 'Content-Type': 'application/json' },
		});
		statusCheck(res);
		// returns nothing (status code 200)
	}
}
