import { SponsorBlockAdminInterface } from '../interfaces/admin';
import { statusCheck } from '../utils';
import { SponsorBlockVIP } from './vip';

export class SponsorBlockAdmin extends SponsorBlockVIP implements SponsorBlockAdminInterface {
	// Admin Calls
	// 17 POST /api/addUserAsVIP
	async addVIP(publicUserID: string, enabled?: boolean): Promise<void> {
		let res = await this.http.post('/api/warnUser', { adminUserID: this.userID, userID: publicUserID, enabled })
		// let res = await fetch(`${this.options.baseURL}/api/warnUser`, {
		// 	method: 'POST',
		// 	body: JSON.stringify({ adminUserID: this.userID, userID: publicUserID, enabled }),
		// 	headers: { 'Content-Type': 'application/json' },
		// });
		statusCheck(res);
		// returns nothing (status code 200)
	}
}
