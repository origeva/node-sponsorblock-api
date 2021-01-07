import SponsorBlock from '../../src';
import { strict as assert } from 'assert';

export async function isUserVIPTest(sponsorBlock?: SponsorBlock): Promise<void> {
	sponsorBlock = sponsorBlock ? sponsorBlock : SponsorBlock.newUser();
	var response = await sponsorBlock.isUserVIP();
	assert.ok(response.hashedUserID, 'isUserVIPTest(sponsorBlock?: SponsorBlock): hashedUserID is falsy');
	assert.notEqual(response.vip, undefined, 'isUserVIPTest(sponsorBlock?: SponsorBlock): vip is undefined');
}
