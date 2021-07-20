import { SponsorBlockVIPInterface } from './vip';

export interface SponsorBlockAdminInterface extends SponsorBlockVIPInterface {
	// Admin Calls
	// 17 POST /api/addUserAsVIP
	addVIP(publicUserID: string, enabled?: boolean): Promise<void>;
}
