import { SponsorBlockVIPAPI } from './vip';

export interface SponsorBlockAdminAPI extends SponsorBlockVIPAPI {
	// Admin Calls
	// 17 POST /api/addUserAsVIP
	addVIP(publicUserID: string, enabled?: boolean): Promise<void>;
}
