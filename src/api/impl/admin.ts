import { SponsorBlockAdminInterface } from '../interfaces/admin';
import { statusCheck } from '../utils';
import { SponsorBlockVIP } from './vip';

export class SponsorBlockAdmin extends SponsorBlockVIP implements SponsorBlockAdminInterface {
	// Admin Calls
	// 17 POST /api/addUserAsVIP
	async addVIP(publicUserID: string, enabled?: boolean): Promise<void> {
		let res = await this.http.post('/api/addUserAsVIP', null, { params: { userID: publicUserID, adminUserID: this.userID, enabled } })
		statusCheck(res);
		// returns nothing (status code 200)
	}
}
